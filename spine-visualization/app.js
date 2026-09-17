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
    label: 'Structures'
  });

  window.viewer = MIViewer.create({
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
      { key: 'bone',   name: 'Bone',          color: '#ebebe0', opacity: 1.0, renderOrder: 0, smooth: 2,
        files: ['_spine_thoracic.stl', '_spine_lumbar.stl', '_sacrum.stl'] },
      { key: 'discs',  name: 'Discs',         color: '#99e6ff', opacity: 1.0, renderOrder: 1, smooth: 2,
        files: ['_discs.stl'] },
      { key: 'cord',   name: 'Spinal cord',   color: '#b3ffd9', opacity: 1.0, renderOrder: 1, smooth: 2,
        files: ['_spinal_cord.stl'] },
      { key: 'cavity', name: 'Spinal cavity', color: '#ddccff', opacity: 0.4, renderOrder: 2, smooth: 2,
        files: ['_spinal_cavity.stl'] },
      { key: 'blood',  name: 'Blood vessels', color: '#ff3333', opacity: 0.55, renderOrder: 3, smooth: 2,
        files: ['_blood_vessels.stl'] },
      { key: 'muscle', name: 'Muscle',        color: '#ffccf2', opacity: 0.2, renderOrder: 4, smooth: 2,
        files: ['_muscle.stl'] },
      { key: 'fat',    name: 'Fat',           color: '#ffeecc', opacity: 0.15, renderOrder: 5, smooth: 2,
        files: ['_sct.stl', '_epidural_fat_1.stl', '_epidural_fat_2.stl', '_intramuscular_fat.stl', '_retro_fat.stl'] }
    ],

    infoTitle: 'Dataset',
    info: 'Sample patient, thoraco-lumbar MRI segmentation (13 STL meshes, ~100 MB). ' +
          'Volumes are computed from the closed surface meshes. ' +
          'Fat groups subcutaneous, epidural, intramuscular and retroperitoneal compartments.'
  });
})();
