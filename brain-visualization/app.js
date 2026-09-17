/*
 * Brain 3D Report — configuration for the shared MIViewer engine.
 *
 * Original prototype by the Centre of Excellence and Technological Innovation
 * in Bioimaging (CEIB), Conselleria de Sanitat, Generalitat Valenciana:
 * María de la Iglesia Vayá, Gonzalo M. Rojas, Jhon Jairo Saenz.
 *
 * The VTK surfaces are in scanner millimetres, RAS orientation
 * (right = +X, anterior = +Y, superior = +Z), so patient axes are
 * left = -X, posterior = -Y, superior = +Z.
 */
(function () {
  'use strict';

  var PAGE = {
    title:       { es: 'Informe 3D del cerebro', en: 'Brain 3D Report' },
    portal:      { es: 'Inicio', en: 'Portal' },
    portalTitle: { es: 'Volver al inicio', en: 'Back to the portal' },
    controls:    { es: 'Controles', en: 'Controls' },
    hide:        { es: 'Ocultar', en: 'Hide' },
    loading:     { es: 'Cargando el cerebro…', en: 'Loading brain surfaces…' },
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
    loader: 'vtk',
    basePath: '',
    scale: 1,
    units: 'mm',
    showVolumes: true,
    screenshotName: 'brain-report',
    axes: { left: [-1, 0, 0], posterior: [0, -1, 0], superior: [0, 0, 1] },
    defaultView: 'oblique',

    // The cortical shell is translucent and drawn last so the lesion inside it
    // stays visible; the tumour core is opaque, the edema a soft halo.
    segments: [
      { key: 'tumor', name: { es: 'Tumor', en: 'Tumour' },   color: '#ff3b3b', opacity: 1.0,  renderOrder: 0, files: ['tumor.vtk'], smooth: 3 },
      { key: 'edema', name: { es: 'Edema', en: 'Edema' }, color: '#3d8bff', opacity: 0.75, renderOrder: 1, files: ['edema.vtk'], smooth: 3 },
      { key: 'brain', name: { es: 'Cerebro', en: 'Brain' },  color: '#f2efe9', opacity: 0.5,  renderOrder: 2, files: ['cerebro.vtk'], smooth: 2 }
    ],

    infoTitle: { es: 'Sobre este caso', en: 'Case' },
    info: {
      es: 'Cerebro de una persona real visto con una resonancia magnética. En rojo está el tumor y en azul el ' +
          'edema, la zona hinchada que lo rodea. Prueba a cortar el cerebro por la mitad para ver dónde están. ' +
          'Los volúmenes se calculan a partir de las superficies 3D.',
      en: 'Glial tumour with peritumoural edema, segmented from a T1/FLAIR MRI study. Structure volumes are ' +
          'computed from the closed surface meshes (mm³ → cm³). Use the section plane to inspect the lesion in situ.'
    }
  });
})();
