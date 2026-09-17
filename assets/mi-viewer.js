/*
 * MIViewer — shared 3D viewer engine for the 3D MI Reports demos.
 *
 * Wraps three.js r78 (global THREE + OrbitControls + STLLoader / VTKLoader) and
 * builds the whole control panel from a declarative config:
 *
 *   MIViewer.create({
 *     container:  HTMLElement,          // full-screen canvas host
 *     panelBody:  HTMLElement,          // where panel sections are rendered
 *     loader:     'stl' | 'vtk',
 *     basePath:   'patient/',
 *     scale:      1,                    // model units -> scene units
 *     units:      'mm',                 // for the volume read-out
 *     axes:       { left:[1,0,0], posterior:[0,1,0], superior:[0,0,1] },
 *     defaultView:'oblique',            // preset key, or a [x,y,z] direction
 *     segments:   [{ key, name, color, opacity, visible, renderOrder, smooth, files:[...] }],
 *                 // smooth: Taubin iterations applied to the surface (visual only)
 *     info:       HTML string (optional),
 *     panelElement: HTMLElement        // bottom sheet on mobile -> canvas inset
 *   });
 *
 * Patient axes are expressed in model space so the anatomical view presets
 * (Anterior / Left / Superior …) work for any coordinate convention (LPS / RAS).
 */
(function (global) {
  'use strict';

  var PRESETS = [
    { key: 'anterior',  label: 'Anterior',  hotkey: '1' },
    { key: 'posterior', label: 'Posterior', hotkey: '2' },
    { key: 'left',      label: 'Left',      hotkey: '3' },
    { key: 'right',     label: 'Right',     hotkey: '4' },
    { key: 'superior',  label: 'Superior',  hotkey: '5' },
    { key: 'inferior',  label: 'Inferior',  hotkey: '6' }
  ];

  var ICONS = {
    focus: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    rotate: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
  };

  function v3(a) { return new THREE.Vector3(a[0], a[1], a[2]); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function fmtBytes(b) {
    if (b > 1e6) return (b / 1e6).toFixed(1) + ' MB';
    if (b > 1e3) return (b / 1e3).toFixed(0) + ' kB';
    return b + ' B';
  }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  /* Signed volume of a (closed) triangle mesh via the divergence theorem. */
  function meshVolume(geometry) {
    var p = geometry.attributes && geometry.attributes.position;
    if (!p) return 0;
    var a = p.array, idx = geometry.index ? geometry.index.array : null;
    var n = idx ? idx.length : p.count, s = 0;
    for (var i = 0; i < n; i += 3) {
      var ia = (idx ? idx[i] : i) * 3, ib = (idx ? idx[i + 1] : i + 1) * 3, ic = (idx ? idx[i + 2] : i + 2) * 3;
      var ax = a[ia], ay = a[ia + 1], az = a[ia + 2];
      var bx = a[ib], by = a[ib + 1], bz = a[ib + 2];
      var cx = a[ic], cy = a[ic + 1], cz = a[ic + 2];
      s += ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx);
    }
    return Math.abs(s) / 6;
  }

  /* Merge coincident vertices of a non-indexed geometry (STL soup) so the mesh
     becomes a connected, indexed surface — required for smooth normals. */
  function indexGeometry(geometry) {
    if (geometry.index) return geometry;
    var src = geometry.attributes.position.array, n = src.length / 3;
    geometry.computeBoundingBox();
    var mn = geometry.boundingBox.min;
    var map = new Map(), pos = [], index = new Uint32Array(n);
    var Q = 100, K = 131072;   // 0.01 unit grid, 17 bits per axis -> exact 51-bit numeric key
    for (var i = 0; i < n; i++) {
      var x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2];
      var key = (Math.round((x - mn.x) * Q) * K + Math.round((y - mn.y) * Q)) * K + Math.round((z - mn.z) * Q);
      var id = map.get(key);
      if (id === undefined) { id = pos.length / 3; map.set(key, id); pos.push(x, y, z); }
      index[i] = id;
    }
    var g = new THREE.BufferGeometry();
    g.addAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(new THREE.BufferAttribute(pos.length / 3 > 65535 ? index : new Uint16Array(index), 1));
    return g;
  }

  /* Taubin smoothing (λ/μ) — softens voxel staircase without shrinking the
     surface. Runs on an indexed geometry, in place. */
  function smoothGeometry(geometry, iterations) {
    var p = geometry.attributes.position.array, idx = geometry.index.array;
    var nv = p.length / 3, nt = idx.length;
    var acc = new Float32Array(nv * 3), cnt = new Float32Array(nv);
    var steps = [0.5, -0.53];
    function pass(k) {
      acc.fill(0); cnt.fill(0);
      for (var t = 0; t < nt; t += 3) {
        var a = idx[t], b = idx[t + 1], c = idx[t + 2];
        var a3 = a * 3, b3 = b * 3, c3 = c * 3;
        acc[a3] += p[b3] + p[c3]; acc[a3 + 1] += p[b3 + 1] + p[c3 + 1]; acc[a3 + 2] += p[b3 + 2] + p[c3 + 2]; cnt[a] += 2;
        acc[b3] += p[a3] + p[c3]; acc[b3 + 1] += p[a3 + 1] + p[c3 + 1]; acc[b3 + 2] += p[a3 + 2] + p[c3 + 2]; cnt[b] += 2;
        acc[c3] += p[a3] + p[b3]; acc[c3 + 1] += p[a3 + 1] + p[b3 + 1]; acc[c3 + 2] += p[a3 + 2] + p[b3 + 2]; cnt[c] += 2;
      }
      for (var v = 0; v < nv; v++) {
        if (!cnt[v]) continue;
        var v3 = v * 3, inv = 1 / cnt[v];
        p[v3]     += k * (acc[v3] * inv - p[v3]);
        p[v3 + 1] += k * (acc[v3 + 1] * inv - p[v3 + 1]);
        p[v3 + 2] += k * (acc[v3 + 2] * inv - p[v3 + 2]);
      }
    }
    for (var i = 0; i < iterations; i++) { pass(steps[0]); pass(steps[1]); }
    geometry.attributes.position.needsUpdate = true;
    return geometry;
  }

  function create(cfg) {
    var container = cfg.container;
    var panelBody = cfg.panelBody;
    var axes = {
      left: v3(cfg.axes.left).normalize(),
      posterior: v3(cfg.axes.posterior).normalize(),
      superior: v3(cfg.axes.superior).normalize()
    };
    axes.anterior = axes.posterior.clone().negate();
    axes.right = axes.left.clone().negate();
    axes.inferior = axes.superior.clone().negate();
    var scale = cfg.scale || 1;

    /* ---------------- renderer / scene / camera ---------------- */
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);          // transparent: the aura shows through
    renderer.gammaInput = true;                  // hex colours are sRGB
    renderer.gammaOutput = true;
    renderer.sortObjects = true;
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 5000);
    camera.up.copy(axes.superior);               // orbit axis = patient's vertical axis
    camera.position.copy(axes.anterior).multiplyScalar(300);
    scene.add(camera);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.8;
    controls.autoRotateSpeed = 1.2;
    controls.enableKeys = false;

    /* Lighting: sky/ground hemisphere + key light riding with the camera +
       a soft rim from behind so silhouettes separate from the backdrop. */
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8078, 0.9));
    var key = new THREE.DirectionalLight(0xffffff, 0.7);
    key.position.set(0.5, 0.7, 1).normalize().multiplyScalar(10);
    camera.add(key);
    var fill = new THREE.DirectionalLight(0xffffff, 0.25);
    fill.position.set(-1, -0.3, -0.6).normalize().multiplyScalar(10);
    camera.add(fill);

    /* ---------------- state ---------------- */
    var segments = cfg.segments.map(function (s, i) {
      var mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(s.color),
        side: THREE.DoubleSide,
        roughness: s.roughness !== undefined ? s.roughness : 0.9,   // matte, clay-like
        metalness: 0.0,
        transparent: true,
        opacity: s.opacity !== undefined ? s.opacity : 1
      });
      mat.depthWrite = mat.opacity >= 1;
      return {
        key: s.key, name: s.name, files: s.files, mat: mat, meshes: [],
        defaults: { color: s.color, opacity: mat.opacity, visible: s.visible !== false },
        visible: s.visible !== false,
        smooth: s.smooth || 0,
        renderOrder: s.renderOrder !== undefined ? s.renderOrder : i,
        volume: 0, row: null
      };
    });
    var byMesh = {};          // mesh.uuid -> segment
    var selected = null;
    var bounds = new THREE.Box3();
    var clip = { enabled: false, axis: 'sagittal', t: 0.5, flip: false, plane: new THREE.Plane() };
    var loaded = 0, total = 0, bytesLoaded = {}, bytesTotal = {}, failed = false;
    var anim = null;

    segments.forEach(function (s) { total += s.files.length; });

    /* ---------------- loading overlay ---------------- */
    var overlay = cfg.loading || null;
    function updateLoading() {
      if (!overlay) return;
      var lb = 0, lt = 0, known = true;
      Object.keys(bytesLoaded).forEach(function (k) { lb += bytesLoaded[k]; });
      Object.keys(bytesTotal).forEach(function (k) { lt += bytesTotal[k]; });
      if (Object.keys(bytesTotal).length < total) known = false;
      var frac = known && lt > 0 ? lb / lt : loaded / total;
      overlay.bar.style.width = Math.round(frac * 100) + '%';
      overlay.status.textContent = loaded + ' / ' + total + ' files' + (lb ? ' · ' + fmtBytes(lb) + (known ? ' of ' + fmtBytes(lt) : '') : '');
    }
    function finishLoading() {
      if (!overlay) return;
      setTimeout(function () { overlay.root.classList.add('done'); }, failed ? 2500 : 0);
    }

    /* ---------------- geometry loading ---------------- */
    function makeLoader() {
      return cfg.loader === 'vtk' ? new THREE.VTKLoader() : new THREE.STLLoader();
    }

    function prepareGeometry(geometry, smooth) {
      if (!(geometry instanceof THREE.BufferGeometry)) {
        // VTKLoader may hand back a classic Geometry for polygon meshes
        geometry = new THREE.BufferGeometry().fromGeometry(geometry);
      }
      if (smooth) {
        geometry = indexGeometry(geometry);
        smoothGeometry(geometry, smooth);
        geometry.computeVertexNormals();          // smooth (per-vertex) shading
      } else if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
      }
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      return geometry;
    }

    function onFileLoaded(seg, geometry) {
      // volume from the raw segmentation surface, before any cosmetic smoothing
      var rawVolume = meshVolume(geometry instanceof THREE.BufferGeometry ? geometry : new THREE.BufferGeometry().fromGeometry(geometry));
      geometry = prepareGeometry(geometry, seg.smooth);
      var mesh = new THREE.Mesh(geometry, seg.mat);
      mesh.scale.set(scale, scale, scale);
      mesh.renderOrder = seg.renderOrder;
      mesh.visible = seg.visible;
      seg.meshes.push(mesh);
      byMesh[mesh.uuid] = seg;
      scene.add(mesh);
      seg.volume += rawVolume * scale * scale * scale;
      bounds.union(new THREE.Box3().setFromObject(mesh));
      loaded++;
      updateLoading();
      renderSegmentVolume(seg);
      if (loaded === total) onAllLoaded();
    }

    function onAllLoaded() {
      finishLoading();
      setupClipRange();
      goToView(cfg.defaultView || 'oblique', false);
      if (typeof cfg.onLoaded === 'function') cfg.onLoaded(api);
    }

    var RETRIES = 3;
    function loadFile(seg, file, attempt) {
      var url = (cfg.basePath || '') + file;
      makeLoader().load(url, function (geometry) { onFileLoaded(seg, geometry); },
        function (ev) {
          if (ev && ev.lengthComputable) { bytesLoaded[url] = ev.loaded; bytesTotal[url] = ev.total; updateLoading(); }
          else if (ev && ev.loaded) { bytesLoaded[url] = ev.loaded; updateLoading(); }
        },
        function () {
          if (attempt < RETRIES) {
            if (overlay) overlay.status.textContent = 'Retrying ' + file + ' (' + (attempt + 1) + '/' + RETRIES + ')…';
            setTimeout(function () { loadFile(seg, file, attempt + 1); }, 800 * attempt);
            return;
          }
          failed = true;
          total--;                                   // let the rest of the scene finish
          if (overlay) {
            overlay.error.style.display = 'block';
            overlay.error.textContent += (overlay.error.textContent ? ' · ' : '') + 'Could not load ' + file;
          }
          updateLoading();
          if (loaded === total) onAllLoaded();
        });
    }

    function loadAll() {
      segments.forEach(function (seg) {
        seg.files.forEach(function (file) { loadFile(seg, file, 1); });
      });
      updateLoading();
    }

    /* ---------------- camera framing ---------------- */
    function viewDirection(preset) {
      if (Array.isArray(preset)) return v3(preset).normalize();
      var A = axes.anterior, P = axes.posterior, L = axes.left, R = axes.right, S = axes.superior, I = axes.inferior;
      switch (preset) {
        case 'anterior':  return A.clone();
        case 'posterior': return P.clone();
        case 'left':      return L.clone();
        case 'right':     return R.clone();
        // slight posterior tilt keeps "anterior" at the top of the screen
        case 'superior':  return S.clone().add(P.clone().multiplyScalar(0.03)).normalize();
        case 'inferior':  return I.clone().add(P.clone().multiplyScalar(0.03)).normalize();
        case 'oblique':
        default:
          return A.clone().multiplyScalar(0.75).add(L.clone().multiplyScalar(0.6)).add(S.clone().multiplyScalar(0.3)).normalize();
      }
    }

    function frameFor(box, dir) {
      var center = box.center();
      var radius = box.size().length() * 0.5;
      // fit the bounding sphere in the narrower of the vertical / horizontal FOV
      var vfov = THREE.Math.degToRad(camera.fov);
      var hfov = 2 * Math.atan(Math.tan(vfov * 0.5) * camera.aspect);
      var dist = radius / Math.sin(Math.min(vfov, hfov) * 0.5) * 1.05;
      return { target: center, position: center.clone().add(dir.multiplyScalar(dist)), radius: radius };
    }

    function applyFrame(frame, animate) {
      controls.minDistance = frame.radius * 0.15;
      controls.maxDistance = frame.radius * 12;
      camera.near = Math.max(0.05, frame.radius * 0.01);
      camera.far = frame.radius * 40;
      camera.updateProjectionMatrix();
      if (!animate) {
        anim = null;
        camera.position.copy(frame.position);
        controls.target.copy(frame.target);
        controls.update();
        return;
      }
      anim = {
        p0: camera.position.clone(), p1: frame.position,
        t0: controls.target.clone(), t1: frame.target,
        start: performance.now(), dur: 520
      };
    }

    function goToView(preset, animate) {
      if (bounds.isEmpty()) return;
      applyFrame(frameFor(bounds, viewDirection(preset)), animate !== false);
      setActivePreset(typeof preset === 'string' ? preset : null);
    }

    function focusSegment(seg) {
      if (!seg.meshes.length) return;
      var box = new THREE.Box3();
      seg.meshes.forEach(function (m) { box.union(new THREE.Box3().setFromObject(m)); });
      var dir = camera.position.clone().sub(controls.target).normalize();
      applyFrame(frameFor(box, dir), true);
      setActivePreset(null);
    }

    /* ---------------- clipping ---------------- */
    var clipUI = {};
    function clipAxisVector() {
      return clip.axis === 'sagittal' ? axes.left : clip.axis === 'coronal' ? axes.anterior : axes.superior;
    }
    function setupClipRange() { updateClip(); }
    function updateClip() {
      if (!clip.enabled || bounds.isEmpty()) { renderer.clippingPlanes = []; return; }
      var n = clipAxisVector().clone();
      var min = bounds.min.dot(n), max = bounds.max.dot(n);
      if (min > max) { var tmp = min; min = max; max = tmp; }
      var t = min + (max - min) * clip.t;
      // keep the half-space  n·p <= t   (or >= t when flipped)
      if (clip.flip) clip.plane.set(n, -t); else clip.plane.set(n.negate(), t);
      renderer.clippingPlanes = [clip.plane];
    }

    /* ---------------- selection / picking ---------------- */
    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();
    var tip = cfg.tooltip || null;

    function setSelected(seg) {
      if (selected === seg) seg = null;
      selected = seg;
      segments.forEach(function (s) {
        s.mat.emissive.setHex(s === seg ? 0x2451a8 : 0x000000);
        s.mat.emissiveIntensity = s === seg ? 0.55 : 1;
        if (s.row) s.row.classList.toggle('is-selected', s === seg);
      });
      if (seg && seg.row && seg.row.scrollIntoView) seg.row.scrollIntoView({ block: 'nearest' });
    }

    function pick(clientX, clientY) {
      var r = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      var meshes = [];
      segments.forEach(function (s) { if (s.visible && s.mat.opacity > 0.02) meshes = meshes.concat(s.meshes); });
      var hits = raycaster.intersectObjects(meshes, false);
      for (var i = 0; i < hits.length; i++) {
        var h = hits[i];
        // honour the section plane: skip fragments that are clipped away
        if (clip.enabled && clip.plane.distanceToPoint(h.point) < 0) continue;
        return byMesh[h.object.uuid];
      }
      return null;
    }

    var down = null;
    renderer.domElement.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    renderer.domElement.addEventListener('pointerup', function (e) {
      if (!down) return;
      var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      var dt = performance.now() - down.t;
      down = null;
      if (moved > 6 || dt > 400) return;         // it was a drag, not a click
      var seg = pick(e.clientX, e.clientY);
      setSelected(seg);
      if (tip) {
        if (seg) {
          tip.innerHTML = '<span class="dot" style="background:#' + seg.mat.color.getHexString() + '"></span>' + seg.name;
          tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px';
          tip.classList.add('show');
          clearTimeout(tip._t); tip._t = setTimeout(function () { tip.classList.remove('show'); }, 1600);
        } else tip.classList.remove('show');
      }
    });

    /* ---------------- panel ---------------- */
    var presetChips = {};
    function setActivePreset(key) {
      Object.keys(presetChips).forEach(function (k) { presetChips[k].classList.toggle('is-active', k === key); });
    }

    function renderSegmentVolume(seg) {
      if (!seg.row || !cfg.showVolumes) return;
      var v = seg.row.querySelector('.v');
      if (!v) return;
      var cm3 = seg.volume / 1000;   // mm³ -> cm³
      v.textContent = cm3 >= 100 ? cm3.toFixed(0) + ' cm³' : cm3 >= 10 ? cm3.toFixed(1) + ' cm³' : cm3.toFixed(2) + ' cm³';
    }

    function applySegment(seg) {
      seg.meshes.forEach(function (m) { m.visible = seg.visible; });
      seg.mat.depthWrite = seg.mat.opacity >= 1;
      seg.mat.needsUpdate = false;
      if (seg.row) seg.row.classList.toggle('is-hidden', !seg.visible);
    }

    function syncRow(seg) {
      var r = seg.row;
      r.querySelector('.check').checked = seg.visible;
      var sl = r.querySelector('.slider');
      sl.value = seg.mat.opacity;
      sl.style.setProperty('--fill', Math.round(seg.mat.opacity * 100) + '%');
      r.querySelector('.swatch').value = '#' + seg.mat.color.getHexString();
      r.classList.toggle('is-hidden', !seg.visible);
    }

    function buildStructures() {
      var sec = el('div', 'section');
      var head = el('div', 'section-title', '<span>Structures</span>');
      var actions = el('div', 'chip-row');
      var showAll = el('button', 'btn', 'Show all');
      showAll.type = 'button';
      showAll.addEventListener('click', function () {
        segments.forEach(function (s) { s.visible = true; applySegment(s); syncRow(s); });
      });
      var reset = el('button', 'btn', 'Reset');
      reset.type = 'button';
      reset.title = 'Restore default colours, opacities and visibility';
      reset.addEventListener('click', resetSegments);
      actions.appendChild(showAll); actions.appendChild(reset);
      head.appendChild(actions);
      sec.appendChild(head);

      segments.forEach(function (seg) {
        var row = el('div', 'seg-row');
        row.tabIndex = 0;
        row.setAttribute('role', 'button');
        row.title = 'Click to highlight · double-click to isolate';

        var cb = el('input', 'check'); cb.type = 'checkbox'; cb.checked = seg.visible;
        cb.setAttribute('aria-label', 'Show ' + seg.name);
        cb.addEventListener('change', function () { seg.visible = cb.checked; applySegment(seg); });
        cb.addEventListener('click', function (e) { e.stopPropagation(); });

        var sw = el('input', 'swatch'); sw.type = 'color'; sw.value = seg.defaults.color;
        sw.setAttribute('aria-label', seg.name + ' colour');
        sw.addEventListener('input', function () { seg.mat.color.set(sw.value); });
        sw.addEventListener('click', function (e) { e.stopPropagation(); });

        var name = el('div', 'seg-name', '<span class="n">' + seg.name + '</span>' + (cfg.showVolumes ? '<span class="v">…</span>' : ''));

        var op = el('input', 'slider'); op.type = 'range'; op.min = 0; op.max = 1; op.step = 0.01; op.value = seg.mat.opacity;
        op.style.setProperty('--fill', Math.round(seg.mat.opacity * 100) + '%');
        op.setAttribute('aria-label', seg.name + ' opacity');
        op.addEventListener('input', function () {
          seg.mat.opacity = parseFloat(op.value);
          op.style.setProperty('--fill', Math.round(seg.mat.opacity * 100) + '%');
          applySegment(seg);
        });
        op.addEventListener('click', function (e) { e.stopPropagation(); });
        op.addEventListener('pointerdown', function (e) { e.stopPropagation(); });

        var fb = el('button', 'focus-btn', ICONS.focus); fb.type = 'button'; fb.title = 'Frame this structure';
        fb.setAttribute('aria-label', 'Frame ' + seg.name);
        fb.addEventListener('click', function (e) { e.stopPropagation(); focusSegment(seg); });

        row.appendChild(cb); row.appendChild(sw); row.appendChild(name); row.appendChild(op); row.appendChild(fb);
        row.addEventListener('click', function () { setSelected(seg); });
        row.addEventListener('dblclick', function () { soloSegment(seg); });
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(seg); }
        });
        seg.row = row;
        sec.appendChild(row);
      });
      return sec;
    }

    function soloSegment(seg) {
      var othersHidden = segments.every(function (s) { return s === seg ? s.visible : !s.visible; });
      segments.forEach(function (s) {
        s.visible = othersHidden ? true : s === seg;   // double-click again restores everything
        applySegment(s); syncRow(s);
      });
    }

    function resetSegments() {
      segments.forEach(function (s) {
        s.mat.color.set(s.defaults.color);
        s.mat.opacity = s.defaults.opacity;
        s.visible = s.defaults.visible;
        applySegment(s); syncRow(s);
      });
      setSelected(null);
    }

    function buildView() {
      var sec = el('div', 'section');
      sec.appendChild(el('div', 'section-title', '<span>View</span>'));
      var chips = el('div', 'chip-row');
      PRESETS.forEach(function (p) {
        var c = el('button', 'chip', p.label); c.type = 'button';
        c.title = p.label + ' view (' + p.hotkey + ')';
        c.addEventListener('click', function () { goToView(p.key, true); });
        presetChips[p.key] = c;
        chips.appendChild(c);
      });
      sec.appendChild(chips);
      var row = el('div', 'section-row');
      row.style.marginTop = '10px';
      var reset = el('button', 'btn', ICONS.reset + 'Reset view'); reset.type = 'button';
      reset.addEventListener('click', function () { goToView(cfg.defaultView || 'oblique', true); });
      var rot = el('button', 'btn', ICONS.rotate + 'Auto-rotate'); rot.type = 'button';
      rot.setAttribute('aria-pressed', 'false');
      rot.addEventListener('click', function () { toggleAutoRotate(); });
      row.appendChild(reset); row.appendChild(rot);
      sec.appendChild(row);
      viewUI.rotate = rot;
      return sec;
    }

    var viewUI = {};
    function toggleAutoRotate(force) {
      controls.autoRotate = force !== undefined ? force : !controls.autoRotate;
      [viewUI.rotate, toolbarUI.rotate].forEach(function (b) {
        if (!b) return;
        b.classList.toggle('is-active', controls.autoRotate);
        b.setAttribute('aria-pressed', String(controls.autoRotate));
      });
    }

    function buildClip() {
      var sec = el('div', 'section');
      var head = el('div', 'section-title', '<span>Section plane</span>');
      var en = el('input', 'check'); en.type = 'checkbox'; en.setAttribute('aria-label', 'Enable section plane');
      en.addEventListener('change', function () { clip.enabled = en.checked; sec.classList.toggle('is-on', clip.enabled); updateClip(); });
      head.appendChild(en);
      sec.appendChild(head);

      var r1 = el('div', 'section-row');
      var sel = el('select', 'select');
      [['sagittal', 'Sagittal'], ['coronal', 'Coronal'], ['axial', 'Axial']].forEach(function (o) {
        var opt = document.createElement('option'); opt.value = o[0]; opt.textContent = o[1]; sel.appendChild(opt);
      });
      sel.setAttribute('aria-label', 'Section plane orientation');
      sel.addEventListener('change', function () { clip.axis = sel.value; updateClip(); });
      var flip = el('button', 'btn', 'Flip'); flip.type = 'button'; flip.title = 'Keep the other half';
      flip.addEventListener('click', function () { clip.flip = !clip.flip; flip.classList.toggle('is-active', clip.flip); updateClip(); });
      r1.appendChild(sel); r1.appendChild(flip);
      sec.appendChild(r1);

      var r2 = el('div', 'section-row');
      var sl = el('input', 'slider grow'); sl.type = 'range'; sl.min = 0; sl.max = 1; sl.step = 0.005; sl.value = clip.t;
      sl.style.setProperty('--fill', '50%');
      sl.setAttribute('aria-label', 'Section plane position');
      var val = el('span', 'value', '50 %');
      sl.addEventListener('input', function () {
        clip.t = parseFloat(sl.value);
        sl.style.setProperty('--fill', Math.round(clip.t * 100) + '%');
        val.textContent = Math.round(clip.t * 100) + ' %';
        if (!clip.enabled) { clip.enabled = true; en.checked = true; }
        updateClip();
      });
      r2.appendChild(sl); r2.appendChild(val);
      sec.appendChild(r2);
      clipUI = { enable: en, select: sel, slider: sl, flip: flip };
      return sec;
    }

    function buildInfo() {
      if (!cfg.info) return null;
      var sec = el('div', 'section');
      sec.appendChild(el('div', 'section-title', '<span>' + (cfg.infoTitle || 'About') + '</span>'));
      var body = el('div', 'info-body', cfg.info);
      body.style.cssText = 'font-size:12px;line-height:1.5;color:var(--fg-muted)';
      sec.appendChild(body);
      return sec;
    }

    function buildPanel() {
      if (!panelBody) return;
      panelBody.innerHTML = '';
      panelBody.appendChild(buildStructures());
      panelBody.appendChild(buildView());
      panelBody.appendChild(buildClip());
      var info = buildInfo();
      if (info) panelBody.appendChild(info);
    }

    /* ---------------- toolbar ---------------- */
    var toolbarUI = {};
    function buildToolbar() {
      var tb = cfg.toolbar;
      if (!tb) return;
      function b(icon, title, fn) {
        var x = el('button', 'btn icon', icon); x.type = 'button'; x.title = title; x.setAttribute('aria-label', title);
        x.addEventListener('click', fn); tb.appendChild(x); return x;
      }
      b(ICONS.reset, 'Reset view (R)', function () { goToView(cfg.defaultView || 'oblique', true); });
      toolbarUI.rotate = b(ICONS.rotate, 'Auto-rotate (Space)', function () { toggleAutoRotate(); });
      b(ICONS.camera, 'Save screenshot (PNG)', screenshot);
      if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
        b(ICONS.fullscreen, 'Fullscreen (F)', toggleFullscreen);
      }
    }

    function screenshot() {
      renderer.render(scene, camera);           // fresh frame, no preserveDrawingBuffer needed
      var src = renderer.domElement;
      var c = document.createElement('canvas');
      c.width = src.width; c.height = src.height;
      var ctx = c.getContext('2d');
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#100e0b';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(src, 0, 0);
      var a = document.createElement('a');
      a.download = (cfg.screenshotName || 'mi-viewer') + '-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.png';
      a.href = c.toDataURL('image/png');
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }

    function toggleFullscreen() {
      var d = document, root = d.documentElement;
      if (d.fullscreenElement || d.webkitFullscreenElement) {
        (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      } else {
        (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
      }
    }

    /* ---------------- keyboard ---------------- */
    window.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var k = e.key.toLowerCase();
      var preset = PRESETS.filter(function (p) { return p.hotkey === k; })[0];
      if (preset) { goToView(preset.key, true); return; }
      if (k === 'r') goToView(cfg.defaultView || 'oblique', true);
      else if (k === ' ') { e.preventDefault(); toggleAutoRotate(); }
      else if (k === 'f') toggleFullscreen();
      else if (k === 'c') { clip.enabled = !clip.enabled; if (clipUI.enable) clipUI.enable.checked = clip.enabled; updateClip(); }
      else if (k === 'escape') setSelected(null);
      else if (k === 'h' && typeof cfg.onTogglePanel === 'function') cfg.onTogglePanel();
    });

    /* ---------------- resize / loop ---------------- */
    function resize() {
      var w = container.clientWidth, h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    /* On narrow screens the panel is a bottom sheet: shrink the canvas to the
       area above it and re-frame, so the open panel never hides the model. */
    var insetPx = 0;
    function updateInset(animate) {
      var p = cfg.panelElement;
      var open = p && !p.classList.contains('collapsed') && window.innerWidth < 820;
      var px = open ? Math.min(window.innerHeight * 0.6, p.offsetHeight + 72) : 0;
      if (px === insetPx) return;
      insetPx = px;
      container.style.bottom = px + 'px';
      resize();
      if (!bounds.isEmpty()) {
        var dir = camera.position.clone().sub(controls.target).normalize();
        applyFrame(frameFor(bounds, dir), animate !== false);
      }
    }
    window.addEventListener('resize', function () { resize(); updateInset(false); });

    function tick(now) {
      requestAnimationFrame(tick);
      if (anim) {
        var t = Math.min(1, (now - anim.start) / anim.dur), k = easeInOut(t);
        camera.position.copy(anim.p0).lerp(anim.p1, k);
        controls.target.copy(anim.t0).lerp(anim.t1, k);
        if (t >= 1) anim = null;
      }
      controls.update();
      renderer.render(scene, camera);
    }

    /* ---------------- boot ---------------- */
    buildPanel();
    buildToolbar();
    loadAll();
    requestAnimationFrame(tick);

    var api = {
      scene: scene, camera: camera, renderer: renderer, controls: controls,
      segments: segments, bounds: bounds,
      goToView: goToView, focusSegment: focusSegment, select: setSelected,
      resetSegments: resetSegments, screenshot: screenshot, toggleAutoRotate: toggleAutoRotate,
      updateInset: updateInset
    };
    return api;
  }

  /* Collapsible panel chrome shared by the viewers: a "Hide" button inside the
     panel, a floating "Structures" button when hidden, collapsed by default on
     narrow screens. Returns a toggle function (also bound to the H key). */
  function panel(opts) {
    var p = opts.panel, open = opts.openButton, close = opts.closeButton;
    function isCollapsed() { return p.classList.contains('collapsed'); }
    function sync() {
      var c = isCollapsed();
      open.hidden = !c;
      open.setAttribute('aria-expanded', String(!c));
    }
    function toggle(force) {
      var collapse = force !== undefined ? force : !isCollapsed();
      p.classList.toggle('collapsed', collapse);
      sync();
      if (typeof opts.onChange === 'function') opts.onChange(collapse);
    }
    open.innerHTML = ICONS.menu + (opts.label || 'Controls');
    open.addEventListener('click', function () { toggle(false); });
    close.addEventListener('click', function () { toggle(true); });
    if (window.innerWidth < 820) toggle(true);
    sync();
    return toggle;
  }

  global.MIViewer = { create: create, panel: panel, PRESETS: PRESETS, ICONS: ICONS };
})(window);
