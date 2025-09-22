//Renderer for abdominal segments
//Initially made by Mariam; remade for spine rendering by Kate


// Variables Objetos
var matBone, matFat, matBlood, matDisks, matMuscle, matCavity, matCord;
// Grupos de meshes por segmento para controlar visibilidad
var groupBone = [], groupFat = [], groupBlood = [], groupDiscs = [], groupMuscle = [], groupCavity = [], groupCord = [];
var loader;
var patient_folder;

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
// variables globales /// 
var container, stats;
var camera, controls, scene, renderer;
// Crear escena antes de cargar objetos
scene = new THREE.Scene();
var cross;
init();
setUpGUI();
render();

function init(){
  //--- registrar los eventos que se quieren atender 

	//configurar el canvas y el motor de render
	initRenderer();
    // instanciar la camara primero (añadiremos luego a escena ya creada)
	initCamera();
    // cargar escena (materiales + objetos)
    loadScene();
	// instanciar luces
	initLights();
	
    window.addEventListener("resize", updateAspectRatio);
   
}
function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('container').appendChild(renderer.domElement);
}
function initCamera(){
	// instanciar la camara
	var aspectRatio = window.innerWidth /window.innerHeight;
	camera = new THREE.PerspectiveCamera( 60/*grados*/,aspectRatio, 1, 1000)
	// position and point the camera to the center of the scene
	//camera.position.set(230,70,0);
 	camera.position.z = 360;
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 5.0;
	controls.zoomSpeed = 0.8;
	controls.panSpeed = 2;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
    scene.add( camera );
}
function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.8;
}
function initLights(){
	// Luz direccional: color, intensidad, direccion (L)
	var dirLight = new THREE.DirectionalLight( "white", 1.0 );
	dirLight.position.set( 200, 200, 500 ).normalize();
	camera.add( dirLight );
	camera.add( dirLight.target );

	// Luz ambiente: color
	var luzAmbiente = new THREE.AmbientLight ( 0xC0BFB9 );
//	scene.add( luzAmbiente );
}
function loadScene () {

	loadMaterials();
    createLegend();
	loadGeometry();
	loadObjects();

}
function loadGeometry(){
 //	cylinder = new THREE.CylinderGeometry( 5, 1, 20, 32 );
}

function loadMaterials(){
	matBone =   new THREE.MeshStandardMaterial( { color: 0xebebe0, side: THREE.DoubleSide } );
    // Habilitar transparencia para que el slider de opacidad funcione (<1.0)
    matBone.transparent = true;
    matBone.opacity = 1.0;
    
    
	matFat =    new THREE.MeshStandardMaterial( { color: 0xffeecc, side: THREE.DoubleSide } );
    matFat.transparent=true
    matFat.opacity=0.2;
    
    matBlood =  new THREE.MeshStandardMaterial( { color: 0xff3333, side: THREE.DoubleSide } );
    matBlood.transparent=true
    matBlood.opacity=0.4;
    
    matDiscs =  new THREE.MeshStandardMaterial( { color: 0x99e6ff, side: THREE.DoubleSide } );
    matDiscs.transparent=true
    matDiscs.opacity=1.0;
    
    
    matMuscle = new THREE.MeshStandardMaterial( { color: 0xffccf2, side: THREE.DoubleSide } );
    matMuscle.transparent=true
    matMuscle.opacity=0.4;
    
    matCavity = new THREE.MeshStandardMaterial( { color: 0xddccff, side: THREE.DoubleSide } );
    matCavity.transparent=true
    matCavity.opacity=0.6;
    
    matCord =   new THREE.MeshStandardMaterial( { color: 0xb3ffd9, side: THREE.DoubleSide } );
    matCord.transparent=true
    matCord.opacity=1.0;
    
    
    

}

function createLegend(){
    var legend = document.getElementById('legend');
    if(!legend) return;
    // Limpia elementos dinámicos previos (manteniendo el título si existe)
    var nodes = Array.from(legend.querySelectorAll('.legend-item'));
    nodes.forEach(n=>legend.removeChild(n));

    var items = [
        { name:'Bone',   color:'#ebebe0' },
        { name:'Fat',    color:'#ffeecc' },
        { name:'Blood Vessels', color:'#ff3333' },
        { name:'Discs',  color:'#99e6ff' },
        { name:'Muscle', color:'#ffccf2' },
        { name:'Spinal Cavity', color:'#ddccff' },
        { name:'Spinal Cord',   color:'#b3ffd9' }
    ];
    items.forEach(it=>{
        var row = document.createElement('div');
        row.className = 'legend-item';
        row.style.display='flex';
        row.style.alignItems='center';
        row.style.margin='2px 0';
        var box = document.createElement('span');
        box.style.background=it.color;
        box.style.width='14px';
        box.style.height='14px';
        box.style.display='inline-block';
        box.style.marginRight='6px';
        box.style.border='1px solid #222';
        row.appendChild(box);
        var label = document.createElement('span');
        label.textContent = it.name;
        row.appendChild(label);
        legend.appendChild(row);
    });
}
function loadObjects(){
    patient_folder="patient"
    
    loader = new THREE.STLLoader();
    
    //Spines
    loader.load(patient_folder+"/_spine_thoracic.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matBone, renderOrder=2);
        groupBone.push(mesh); scene.add(mesh);
    });
    loader.load(patient_folder+"/_spine_lumbar.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matBone);
        groupBone.push(mesh); scene.add(mesh);
    });
    loader.load(patient_folder+"/_sacrum.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matBone);
        groupBone.push(mesh); scene.add(mesh);
    });
    
    //Disk
    loader.load(patient_folder+"/_discs.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matDiscs, renderOrder=1);
        groupDiscs.push(mesh); scene.add(mesh);
    });
    
    //Spinal caivty
    loader.load(patient_folder+"/_spinal_cavity.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matCavity, renderOrder=1);
        groupCavity.push(mesh); scene.add(mesh);
    });
    loader.load(patient_folder+"/_spinal_cord.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matCord, renderOrder=2);
        groupCord.push(mesh); scene.add(mesh);
    });
    
    //Fat
    loader.load(patient_folder+"/_sct.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matFat);
        groupFat.push(mesh); scene.add(mesh);
    });
    loader.load(patient_folder+"/_epidural_fat_1.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matFat);
        groupFat.push(mesh); scene.add(mesh);
    });
    
    loader.load(patient_folder+"/_epidural_fat_2.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matFat);
        groupFat.push(mesh); scene.add(mesh);
    });
    loader.load(patient_folder+"/_intramuscular_fat.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matFat);
        groupFat.push(mesh); scene.add(mesh);
    });
    loader.load(patient_folder+"/_retro_fat.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matFat);
        groupFat.push(mesh); scene.add(mesh);
    });
    
    
    //Meats and bloods
    loader.load(patient_folder+"/_muscle.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matMuscle);
        groupMuscle.push(mesh); scene.add(mesh);
    });
    loader.load(patient_folder+"/_blood_vessels.stl", function(geometry){
        var mesh = new THREE.Mesh(geometry, matBlood);
        groupBlood.push(mesh); scene.add(mesh);
    });
    
}

function updateAspectRatio () {
	// atender al evento resize de la ventana
	renderer.setSize(window.innerWidth,window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	//controls.handleResize();
}

function render () {
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
	

}

function update () {
    // Aplicar opacidades
    matBone.opacity =  effectControler.opacityBone;
    matFat.opacity =    effectControler.opacityFat;
    matBlood.opacity =  effectControler.opacityBlood;
    matDiscs.opacity =  effectControler.opacityDiscs;
    matMuscle.opacity = effectControler.opacityMuscle;
    matCavity.opacity = effectControler.opacityCavity;
    matCord.opacity =   effectControler.opacityCord;

    // Visibilidad por grupo
    setGroupVisibility(groupBone, effectControler.showBone);
    setGroupVisibility(groupFat, effectControler.showFat);
    setGroupVisibility(groupBlood, effectControler.showBlood);
    setGroupVisibility(groupDiscs, effectControler.showDiscs);
    setGroupVisibility(groupMuscle, effectControler.showMuscle);
    setGroupVisibility(groupCavity, effectControler.showCavity);
    setGroupVisibility(groupCord, effectControler.showCord);

    controls.update();
}

function setGroupVisibility(groupArr, visible) {
    for (var i=0;i<groupArr.length;i++) {
        groupArr[i].visible = visible;
    }
}

function setUpGUI(){
    // Estado de segmentos (sin clipping ni dat.GUI)
    effectControler = {
        showBone:true,   opacityBone:1.0,   colorBone:'#ebebe0',
        showFat:true,    opacityFat:0.4,    colorFat:'#ffeecc',
        showBlood:true,  opacityBlood:0.4,  colorBlood:'#ff3333',
        showDiscs:true,  opacityDiscs:1.0,  colorDiscs:'#99e6ff',
        showMuscle:true, opacityMuscle:0.4, colorMuscle:'#ffccf2',
        showCavity:true, opacityCavity:0.4, colorCavity:'#ddccff',
        showCord:true,   opacityCord:1.0,   colorCord:'#b3ffd9'
    };
    buildSegmentsPanel();
    attachResetAll();
}

function buildSegmentsPanel(){
    var rowsContainer = document.getElementById('segments-rows');
    if(!rowsContainer) return;
    rowsContainer.innerHTML='';
    var segments = [
        {key:'Bone',   mat:matBone,   group:groupBone},
        {key:'Fat',    mat:matFat,    group:groupFat},
        {key:'Blood',  mat:matBlood,  group:groupBlood},
        {key:'Discs',  mat:matDiscs,  group:groupDiscs},
        {key:'Muscle', mat:matMuscle, group:groupMuscle},
        {key:'Cavity', mat:matCavity, group:groupCavity},
        {key:'Cord',   mat:matCord,   group:groupCord}
    ];
    segments.forEach(seg=>{
        var row = document.createElement('div');
        row.className='seg-row';
        row.style.display='flex';
        row.style.alignItems='center';
        row.style.gap='6px';
        row.style.margin='4px 0';
        row.style.padding='4px 6px';
        row.style.borderRadius='4px';
        row.style.background='rgba(255,255,255,0.05)';
        row.dataset.segment = seg.key;

        var cb = document.createElement('input');
        cb.type='checkbox';
        cb.checked = effectControler['show'+seg.key];
        cb.style.margin='0';
        cb.addEventListener('change', ()=>{
            effectControler['show'+seg.key] = cb.checked;
        });
        row.appendChild(cb);

        var sw = document.createElement('span');
        sw.style.width='14px';sw.style.height='14px';sw.style.display='inline-block';
        sw.style.border='1px solid #222';
        sw.style.background = '#' + seg.mat.color.getHexString();
        row.appendChild(sw);

        var name = document.createElement('span');
        name.textContent = seg.key;
        name.style.flex='0 0 46px';
        row.appendChild(name);

        // Slider opacidad
        var op = document.createElement('input');
        op.type='range'; op.min='0'; op.max='1'; op.step='0.01';
        op.value = effectControler['opacity'+seg.key];
        op.style.flex='1';
        op.addEventListener('input', ()=>{
            effectControler['opacity'+seg.key] = parseFloat(op.value);
            seg.mat.opacity = effectControler['opacity'+seg.key];
        });
        row.appendChild(op);

        // Color picker
        var col = document.createElement('input');
        col.type='color';
        col.value = effectControler['color'+seg.key];
        col.style.width='34px';
        col.addEventListener('input', ()=>{
            effectControler['color'+seg.key] = col.value;
            seg.mat.color.set(col.value);
            sw.style.background = '#' + seg.mat.color.getHexString();
        });
        row.appendChild(col);

        // Click selección de fila para selección visual
        row.addEventListener('click', (e)=>{
            if(e.target===cb || e.target===op || e.target===col) return;
            selectSegmentRow(seg.key);
        });

        rowsContainer.appendChild(row);
    });
}

function attachResetAll(){
    var btn = document.getElementById('btn-reset-all');
    if(!btn) return;
    btn.addEventListener('click', resetAll);
}

function resetAll(){
    // Valores por defecto
    var defaults = {
        showBone:true,   opacityBone:1.0,   colorBone:'#ebebe0',
        showFat:true,    opacityFat:0.4,    colorFat:'#ffeecc',
        showBlood:true,  opacityBlood:0.4,  colorBlood:'#ff3333',
        showDiscs:true,  opacityDiscs:1.0,  colorDiscs:'#99e6ff',
        showMuscle:true, opacityMuscle:0.4, colorMuscle:'#ffccf2',
        showCavity:true, opacityCavity:0.4, colorCavity:'#ddccff',
        showCord:true,   opacityCord:1.0,   colorCord:'#b3ffd9'
    };
    // Copiar defaults a effectControler
    Object.assign(effectControler, defaults);
    // Aplicar a materiales inmediatamente
    matBone.color.set(defaults.colorBone); matBone.opacity = defaults.opacityBone;
    matFat.color.set(defaults.colorFat); matFat.opacity = defaults.opacityFat;
    matBlood.color.set(defaults.colorBlood); matBlood.opacity = defaults.opacityBlood;
    matDiscs.color.set(defaults.colorDiscs); matDiscs.opacity = defaults.opacityDiscs;
    matMuscle.color.set(defaults.colorMuscle); matMuscle.opacity = defaults.opacityMuscle;
    matCavity.color.set(defaults.colorCavity); matCavity.opacity = defaults.opacityCavity;
    matCord.color.set(defaults.colorCord); matCord.opacity = defaults.opacityCord;
    // Visibilidad (update() también lo hará, pero lo forzamos ya)
    setGroupVisibility(groupBone, defaults.showBone);
    setGroupVisibility(groupFat, defaults.showFat);
    setGroupVisibility(groupBlood, defaults.showBlood);
    setGroupVisibility(groupDiscs, defaults.showDiscs);
    setGroupVisibility(groupMuscle, defaults.showMuscle);
    setGroupVisibility(groupCavity, defaults.showCavity);
    setGroupVisibility(groupCord, defaults.showCord);
    // Reconstruir UI para reflejar valores
    buildSegmentsPanel();
}

var selectedSegment = null;
function selectSegmentRow(key){
    selectedSegment = key;
    var rows = document.querySelectorAll('.seg-row');
    rows.forEach(r=>{
        if(r.dataset.segment===key){
            r.style.outline='2px solid #4cafef';
            r.style.background='rgba(76,175,239,0.18)';
        } else {
            r.style.outline='none';
            r.style.background='rgba(255,255,255,0.05)';
        }
    });
    // Opcional: resaltar meshes (aquí simple aumento de emissive si MeshStandardMaterial)
    [matBone,matFat,matBlood,matDiscs,matMuscle,matCavity,matCord].forEach(m=>{ if(m.emissive) m.emissive.setHex(0x000000); });
    var map = {Bone:matBone,Fat:matFat,Blood:matBlood,Discs:matDiscs,Muscle:matMuscle,Cavity:matCavity,Cord:matCord};
    var target = map[key];
    if(target && target.emissive){ target.emissive.set('#2266aa'); }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Eliminada barra de progreso y LoadingManager porque permanecía en 0%


// Eliminado post-procesado y clipping

// Eliminados eventos de hover/selección

