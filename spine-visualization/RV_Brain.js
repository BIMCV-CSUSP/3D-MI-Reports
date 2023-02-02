//Renderer for abdominal segments
//Initially made by Mariam; remade for spine rendering by Kate


// Variables Objetos
var matBone, matFat, matBlood, matDisks, matMuscle, matCavity, matCord;
var loader;
var patient_folder;

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
// variables globales /// 
var container, stats;
var camera, controls, scene, renderer;
var cross;
init();
setUpGUI();
render();

function init(){
  //--- registrar los eventos que se quieren atender 

	//configurar el canvas y el motor de render
	initRenderer();
	//instancia de grafo de escena
	loadScene();
	// instanciar la camara
	initCamera();
	// instanciar luces
	initLights();
	
    window.addEventListener("resize", updateAspectRatio);
   
}
function initRenderer(){
	//configurar el canvas y el motor de render

	renderer = new THREE.WebGLRenderer();
	renderer.antialias = false;
	renderer.setSize( window.innerWidth, window.innerHeight );// area del dibujo
	renderer.setClearColor(new THREE.Color(0x00000A),1.0);	// borrar con el color indicado

	renderer.setPixelRatio( window.devicePixelRatio );

	document.getElementById('container').appendChild(renderer.domElement);

	//document.getElementById('container').appendChild(renderer.domElement);
	//renderer.shadowMap.Enabled = true;
	//renderer.shadowMapSoft = true;	

	stats = new Stats();
//	container.appendChild( stats.dom );
//	window.addEventListener( 'resize', onWindowResize, false );

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
//    document.getElementById( 'container' ).appendChild( stats.domElement );
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
	scene = new THREE.Scene();
	//	scene.fog = new THREE.fog(0xffffff, 1, 1000);
	scene.add( camera );
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
	loadGeometry();
	loadObjects();

}
function loadGeometry(){
 //	cylinder = new THREE.CylinderGeometry( 5, 1, 20, 32 );
}

function loadMaterials(){
	matBone =   new THREE.MeshStandardMaterial( { color: 0xebebe0, side: THREE.DoubleSide } );
    matBone.transparent=false
    
    
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
function loadObjects(){
    patient_folder="patient"
    
    loader = new THREE.STLLoader();
    
    //Spines
    loader.load(patient_folder+"/_spine_thoracic.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matBone, renderOrder=2));
    });
    loader.load(patient_folder+"/_spine_lumbar.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matBone));
    });
    loader.load(patient_folder+"/_sacrum.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matBone));
    });
    
    //Disk
    loader.load(patient_folder+"/_discs.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matDiscs, renderOrder=1));
    });
    
    //Spinal caivty
    loader.load(patient_folder+"/_spinal_cavity.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matCavity, renderOrder=1));
    });
    loader.load(patient_folder+"/_spinal_cord.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matCord, renderOrder=2));
    });
    
    //Fat
    loader.load(patient_folder+"/_sct.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matFat));
    });
    loader.load(patient_folder+"/_epidural_fat_1.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matFat));
    });
    
    loader.load(patient_folder+"/_epidural_fat_2.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matFat));
    });
    loader.load(patient_folder+"/_intramuscular_fat.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matFat));
    });
    loader.load(patient_folder+"/_retro_fat.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matFat));
    });
    
    
    //Meats and bloods
    loader.load(patient_folder+"/_muscle.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matMuscle));
    });
    loader.load(patient_folder+"/_blood_vessels.stl", function(geometry){
        scene.add(new THREE.Mesh(geometry, matBlood));
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
	matFat.opacity =    effectControler.opacityFat;
    matBlood.opacity =  effectControler.opacityBlood;
    matDiscs.opacity =  effectControler.opacityDiscs;
    matMuscle.opacity = effectControler.opacityMuscle;
    matCavity.opacity = effectControler.opacityCavity;
    matCord.opacity =   effectControler.opacityCord;
	matBone.visible = effectControler.enabledBone;
    
	controls.update();

}

function setUpGUI(){
	// Definicion de los controles
	effectControler = {
        opacityFat   : 0.4,
        opacityBlood : 0.4,
        opacityDiscs : 1.0,
        opacityMuscle: 0.4,
        opacityCavity: 0.4,
        opacityCord  : 1.0,
		enabledBone: true
	};

	// Creacion de la interfaz
	var gui = new dat.GUI();

	// Construir el menu de widgets
	var h = gui.addFolder( "Segment Opacity" );
	h.add(effectControler,"enabledBone").name("Spine");
	h.add( effectControler, "opacityFat", 0.0, 1.0, 0.1 ).name("Fat");
	h.add( effectControler, "opacityBlood", 0.0, 1.0, 0.1 ).name("Blood Vessels");
	h.add( effectControler, "opacityDiscs", 0.0, 1.0, 0.1 ).name("Discs");
	h.add( effectControler, "opacityMuscle", 0.0, 1.0, 0.1 ).name("Muscle");
	h.add( effectControler, "opacityCavity", 0.0, 1.0, 0.1 ).name("S Cavity");
	h.add( effectControler, "opacityCord", 0.0, 1.0, 0.1 ).name("S Cord");
	
}
