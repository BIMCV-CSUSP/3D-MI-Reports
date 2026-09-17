# 3D-MI-Reports

Visualization of complex Medical Imaging data such as functional connectivity, tractography, functional imaging and Multiparametric Tissue Signatures is a challenge. Recombining such data produces an even more complex problem concerning to medical interpretations.

Many different visualization solutions have been proposed. Margulies et al (2013) [1] and Rojas et al (2011; 2013) [2-3], for example, describe 2D as well as 3D neuroimaging visualization methods for tractography and functional connectivity data.

## Aplications

### 3D Medical Imaging Report
We introduce a new concept of visualization in Medical Imaging biomarkers field through web and smartphones with this prototype.

[ ![QR-Brain-Edema](https://raw.githubusercontent.com/BIMCV-CSUSP/3D-MI-Reports/master/brain-visualization/qrcode.jpeg)](https://bimcv-csusp.github.io/3D-MI-Reports/brain-visualization)

### 10k
A graphical visualization for rapid view of brain statistics using three different programs: FreeSurfer, VolBrain and CERES

[10K FreeSurfer](https://bimcv-csusp.github.io/3D-MI-Reports/brain-statistics/free-surfer/)

[10k VolBrain](https://bimcv-csusp.github.io/3D-MI-Reports/brain-statistics/free-surfer/index_volbrain.html)

[10k CERES](https://bimcv-csusp.github.io/3D-MI-Reports/brain-statistics/free-surfer/index_ceres.html)

## References
[1] Margulies, D.S., Böttger, J., Watanabe A., Gorgolewski, K.J., (2013).'Visualizing the human connectome' ,NeuroImage 80 (2013): 445-461.

[2] Rojas, G.M., Gálvez, M., Cordovez, J., Margulies, D.S., Castellanos, F.X., Milham, M.P., (2011). 'Applications of Stereoscopic 3D in Morphometric and Functional Imaging', HBM 2011, Quebec City, Canada.

[3] Rojas, G.M., Gálvez, M. (2013). 'Functional Connectivity Networks obtained using 10-20 EEG and 7 standard functional networks', HBM 2013, Seattle, USA.

---

## Visual system & shared viewer engine

All pages share one look: the **Aura "Blueprint"** backdrop (dark lattice + cyan glow, `assets/theme.css`) and the
institutional lock-up **Generalitat Valenciana · Fundació Fisabio · Imagen Biomédica e IA** (`assets/logos-*.png`).
The logo lock-up is used as delivered by the communication office — white version on the dark backdrop, never
recoloured, split or re-ordered (see *FS_I032 Convivència logo GVA + Fisabio*).

The two 3D viewers are thin configurations on top of a common engine, `assets/mi-viewer.js` (three.js r78):

| Feature | Notes |
| --- | --- |
| Auto-framing | Camera fits the loaded bounding box (portrait-aware) |
| Anatomical presets | Anterior / Posterior / Left / Right / Superior / Inferior (`1`–`6`), animated transitions; the orbit axis is the patient's vertical axis so the model never rolls |
| Structures panel | Visibility, opacity, colour, per-structure volume (cm³, from the closed mesh), frame (⌖), isolate (double-click), highlight (click, also by clicking the 3D model) |
| Section plane | Sagittal / Coronal / Axial clipping with position slider and flip (`C`) |
| Surface smoothing | Optional Taubin smoothing per structure — visual only, volumes are computed before smoothing |
| Toolbar | Reset view (`R`), auto-rotate (`Space`), PNG screenshot, fullscreen (`F`) |
| Loading | Progress overlay (files / bytes) with retries — the spine case streams ~48 MB of STL |
| Mobile | Panel becomes a bottom sheet, touch orbit/zoom/pan |

### Languages

Every page is bilingual (Spanish by default — the demos are shown to school groups — with an ES | EN switch).
The choice is remembered in `localStorage`; `?lang=es` / `?lang=en` forces it (used by the printed QR codes).
Panel strings live in `assets/mi-viewer.js` (`STRINGS`), page strings in each `app.js` / `index.html`.

### Printable QR codes

`assets/qr/print.html` is an A4 sheet with one branded QR card per viewer (spine in blue, brain in violet,
group mark in the centre, error-correction level H). Regenerate the PNGs with `assets/qr/make_qr.py`
(needs `pip install "qrcode[pil]"`) if the URLs change.

### Adding a new case / viewer

1. Copy `spine-visualization/` (STL) or `brain-visualization/` (VTK) to a new folder.
2. Drop the meshes in and edit `app.js`: list the `segments` (name, colour, opacity, files) and declare the
   **patient axes in model space** (`axes.left / posterior / superior`) — LPS exports (3D Slicer) use
   `left:[1,0,0], posterior:[0,1,0], superior:[0,0,1]`; RAS exports use `left:[-1,0,0], posterior:[0,-1,0]`.
3. Link it from the root `index.html` grid.

## GitHub Pages Deployment

This repository is configured for automatic static deployment using **GitHub Pages**.

### Structure
Root level `index.html` provides a simple navigation landing page linking to:

- `brain-visualization/index.html`
- `spine-visualization/index.html`
- `brain-statistics/free-surfer/index.html` (and related variant pages `index_volbrain.html`, `index_ceres.html`)

All asset/script references are relative; no leading slashes are used, so they work under the Pages subpath.

### Workflow
The GitHub Actions workflow `.github/workflows/deploy-pages.yml` publishes the entire repository contents to Pages on every push to the `master` branch.

### First-time Activation
1. Go to: Repository Settings → Pages.
2. Set Source = GitHub Actions (should auto-detect after first successful run).
3. After the workflow finishes, the site will be available at:
	`https://<org-or-user>.github.io/3D-MI-Reports/`

Direct links (assuming the BIMCV-CSUSP organization):
- Root portal: https://bimcv-csusp.github.io/3D-MI-Reports/
- Brain viewer: https://bimcv-csusp.github.io/3D-MI-Reports/brain-visualization/
- Spine viewer: https://bimcv-csusp.github.io/3D-MI-Reports/spine-visualization/
- FreeSurfer stats: https://bimcv-csusp.github.io/3D-MI-Reports/brain-statistics/free-surfer/

### Local Preview
Serve locally with any static server from the repository root, e.g.:

```bash
python3 -m http.server 8000
# Then open http://localhost:8000/
```

### Adding New Demos
See *Adding a new case / viewer* above; commit & push and the workflow redeploys automatically.

### Troubleshooting
- If assets 404 on Pages but not locally: ensure paths are relative (`./webgl/lib/three.js` or `webgl/lib/three.js`, not `/webgl/...`).
- Clear browser cache or use a hard reload (Ctrl+Shift+R) after redeployments.
- Check Actions tab for any workflow failures.

