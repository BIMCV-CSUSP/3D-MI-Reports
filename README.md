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
1. Create a new folder at repository root (e.g., `new-demo/`).
2. Add its own `index.html` and assets with relative paths.
3. Link it from the root `index.html` grid.
4. Commit & push; the workflow redeploys automatically.

### Troubleshooting
- If assets 404 on Pages but not locally: ensure paths are relative (`./webgl/lib/three.js` or `webgl/lib/three.js`, not `/webgl/...`).
- Clear browser cache or use a hard reload (Ctrl+Shift+R) after redeployments.
- Check Actions tab for any workflow failures.

