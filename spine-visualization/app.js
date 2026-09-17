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

  var togglePanel = MIViewer.panel({
    panel: document.getElementById('panel'),
    openButton: document.getElementById('panel-toggle'),
    closeButton: document.getElementById('panel-close'),
    label: 'Structures',
    onChange: function () { if (window.miViewer) window.miViewer.updateInset(); }
  });

  window.miViewer = MIViewer.create({
    container: document.getElementById('viewer'),
    panelBody: document.getElementById('panel-body'),
    toolbar: document.getElementById('toolbar'),
    tooltip: document.getElementById('pick-tip'),
    loading: {
      root: document.getElementById('loading'),
      status: document.getElementById('loading-status'),
      bar: document.getElementById('loading-bar'),
      error: document.getElementById('loading-error')
    },
    onTogglePanel: togglePanel,
    panelElement: document.getElementById('panel'),
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
      { key: 'bone',   name: 'Bone',          color: '#f1ebdc', opacity: 1.0, renderOrder: 0, smooth: 2,
        files: ['spine_thoracic.stl', 'spine_lumbar.stl', 'sacrum.stl'] },
      { key: 'discs',  name: 'Discs',         color: '#4fc3f7', opacity: 1.0, renderOrder: 1, smooth: 2,
        files: ['discs.stl'] },
      { key: 'cord',   name: 'Spinal cord',   color: '#4fe0a3', opacity: 1.0, renderOrder: 1, smooth: 2,
        files: ['spinal_cord.stl'] },
      { key: 'cavity', name: 'Spinal cavity', color: '#b388ff', opacity: 0.6, renderOrder: 2, smooth: 2,
        files: ['spinal_cavity.stl'] },
      { key: 'blood',  name: 'Blood vessels', color: '#e53935', opacity: 0.9, renderOrder: 3, smooth: 2,
        files: ['blood_vessels.stl'] },
      { key: 'muscle', name: 'Muscle',        color: '#e08a9b', opacity: 0.28, renderOrder: 4, smooth: 2,
        files: ['muscle.stl'] },
      { key: 'fat',    name: 'Fat',           color: '#f2cc7a', opacity: 0.22, renderOrder: 5, smooth: 2,
        files: ['sct.stl', 'epidural_fat_1.stl', 'epidural_fat_2.stl', 'intramuscular_fat.stl', 'retro_fat.stl'] }
    ],

    infoTitle: 'Dataset',
    info: 'Sample patient, thoraco-lumbar MRI segmentation (13 STL meshes, ~100 MB). ' +
          'Volumes are computed from the closed surface meshes. ' +
          'Fat groups subcutaneous, epidural, intramuscular and retroperitoneal compartments.'
  });
})();
