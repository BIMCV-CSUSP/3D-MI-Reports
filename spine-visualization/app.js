/*
 * Spine Segments Viewer — configuration for the shared MIViewer engine.
 *
 * The STL meshes come from a voxel segmentation exported in LPS orientation
 * (checked against the sample patient: subcutaneous fat lies at +Y = posterior,
 * thoracic vertebrae at +Z = superior), so the patient axes are:
 *   left = +X, posterior = +Y, superior = +Z.
 * Units are millimetres, which lets the panel report structure volumes in cm³.
 */
(function () {
  'use strict';

  var PATIENT = 'patient/';

  /* Page chrome strings (the engine has its own for the panel). */
  var PAGE = {
    title:       { es: 'Visor de columna', en: 'Spine Segments Viewer' },
    portal:      { es: 'Inicio', en: 'Portal' },
    portalTitle: { es: 'Volver al inicio', en: 'Back to the portal' },
    controls:    { es: 'Controles', en: 'Controls' },
    hide:        { es: 'Ocultar', en: 'Hide' },
    loading:     { es: 'Cargando la columna…', en: 'Loading spine segmentation…' },
    hint:        { es: 'Arrastra para girar · Rueda para acercar · Botón derecho para mover · Toca una parte para resaltarla · <kbd>1</kbd>–<kbd>6</kbd> vistas',
                   en: 'Drag to rotate · Scroll to zoom · Right-drag to pan · Click a structure to highlight · <kbd>1</kbd>–<kbd>6</kbd> views' }
  };
  function applyPage() { MI_LANG.apply(PAGE); document.title = MI_LANG.t(PAGE.title) + ' · 3D MI Reports'; }
  applyPage();
  MI_LANG.onChange(applyPage);
  MI_LANG.toggle(document.getElementById('lang-switch'));

  var togglePanel = MIViewer.panel({
    panel: document.getElementById('panel'),
    openButton: document.getElementById('panel-toggle'),
    closeButton: document.getElementById('panel-close'),
    label: { es: 'Partes', en: 'Structures' },
    onChange: function () { if (window.miViewer) window.miViewer.updateInset(); }
  });

  window.miViewer = MIViewer.create({
    container: document.getElementById('viewer'),
    panelBody: document.getElementById('panel-body'),
    panelElement: document.getElementById('panel'),
    toolbar: document.getElementById('toolbar'),
    tooltip: document.getElementById('pick-tip'),
    loading: {
      root: document.getElementById('loading'),
      status: document.getElementById('loading-status'),
      bar: document.getElementById('loading-bar'),
      error: document.getElementById('loading-error')
    },
    onTogglePanel: togglePanel,
    loader: 'stl',
    basePath: PATIENT,
    scale: 1,
    units: 'mm',
    showVolumes: true,
    screenshotName: 'spine-viewer',
    axes: { left: [1, 0, 0], posterior: [0, 1, 0], superior: [0, 0, 1] },
    defaultView: 'oblique',

    // Outer, translucent tissues get a higher renderOrder so the bony core is
    // drawn first and stays legible through them.
    segments: [
      { key: 'bone',   name: { es: 'Huesos', en: 'Bone' }, color: '#e6c78a', opacity: 1.0, renderOrder: 0, smooth: 2,
        files: ['spine_thoracic.stl', 'spine_lumbar.stl', 'sacrum.stl'] },
      { key: 'discs',  name: { es: 'Discos', en: 'Discs' },                        color: '#4fc3f7', opacity: 1.0, renderOrder: 1, smooth: 2,
        files: ['discs.stl'] },
      { key: 'cord',   name: { es: 'Médula', en: 'Spinal cord' },          color: '#4fe0a3', opacity: 1.0, renderOrder: 1, smooth: 2,
        files: ['spinal_cord.stl'] },
      { key: 'cavity', name: { es: 'Canal medular', en: 'Spinal canal' },     color: '#b388ff', opacity: 0.6, renderOrder: 2, smooth: 2,
        files: ['spinal_cavity.stl'] },
      { key: 'blood',  name: { es: 'Vasos', en: 'Blood vessels' },      color: '#e53935', opacity: 0.9, renderOrder: 3, smooth: 2,
        files: ['blood_vessels.stl'] },
      { key: 'muscle', name: { es: 'Músculos', en: 'Muscle' },                     color: '#e08a9b', opacity: 0.28, renderOrder: 4, smooth: 2,
        files: ['muscle.stl'] }
    ],

    infoTitle: { es: 'Sobre este caso', en: 'Dataset' },
    info: {
      es: 'Columna de una persona real, obtenida a partir de una resonancia magnética. Un programa de inteligencia ' +
          'artificial ha separado cada parte: huesos, discos, médula, vasos y músculos (8 mallas 3D, ~48 MB). ' +
          'Los volúmenes se calculan a partir de las superficies.',
      en: 'Sample patient, thoraco-lumbar MRI segmentation (8 STL meshes, ~48 MB): bone, discs, spinal cord and ' +
          'canal, vessels and muscle. Volumes are computed from the closed surface meshes.'
    }
  });
})();
