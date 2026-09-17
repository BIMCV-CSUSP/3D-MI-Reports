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
      { key: 'tumor', name: 'Tumour',      color: '#ff3b3b', opacity: 1.0,  renderOrder: 0, files: ['tumor.vtk'], smooth: 3 },
      { key: 'edema', name: 'Edema',       color: '#3d8bff', opacity: 0.75, renderOrder: 1, files: ['edema.vtk'], smooth: 3 },
      { key: 'brain', name: 'Brain',       color: '#f2efe9', opacity: 0.5, renderOrder: 2, files: ['cerebro.vtk'], smooth: 2 }
    ],

    infoTitle: 'Case',
    info: 'Glial tumour with peritumoural edema, segmented from a T1/FLAIR MRI study. ' +
          'Structure volumes are computed from the closed surface meshes (mm³ → cm³). ' +
          'Use the section plane to inspect the lesion in situ.'
  });
})();
