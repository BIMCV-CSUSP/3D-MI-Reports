

// Objetos, materiales, texturas, geometrias
//RV_brain.js
/*--
	Autor: 
	Fecha: 
	
*/

// Variables texturas

// Variables Materiales

// Variables geometrias 

// Variables Objetos
var matBrain,matTumor,matEdema; 
var loadBrain, loadTumor, loadEdema;

// variables de control
var meshBrain, meshTumor, meshEdema;


/////////////////////////////////////

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
 	camera.position.z = 60;
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
	// para definir una forma hay que determinar la geometria y el material

	matBrain = new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
	matTumor = new THREE.MeshStandardMaterial( { color: 0xff0000, side: THREE.DoubleSide } );
	matEdema = new THREE.MeshStandardMaterial( { color: 0x00407E, side: THREE.DoubleSide } );

}
function loadObjects(){

	loadTumor = new THREE.VTKLoader();
	loadTumor.load( "tumor.vtk", function ( geometry ) {
					geometry.computeFaceNormals();
					geometry.computeVertexNormals();
					
					meshTumor = new THREE.Mesh( geometry, matTumor );
				//	meshTumor.material.opacity=1.0;
					meshTumor.material.transparent=true;
					meshTumor.material.renderOrder=1;
					meshTumor.scale.multiplyScalar( 0.2 );
					scene.add( meshTumor );
				} );



	loadBrain = new THREE.VTKLoader();
	loadBrain.load( "cerebro.vtk", function ( geometry ) {
					geometry.computeFaceNormals();
					geometry.computeVertexNormals();
					meshBrain = new THREE.Mesh( geometry, matBrain);
					//meshBrain.material.opacity=0.5;
					meshBrain.material.transparent=true;
					meshBrain.scale.multiplyScalar( 0.2 );
					scene.add( meshBrain );
				} );



				
	loadEdema = new THREE.VTKLoader();
	loadEdema.load( "edema.vtk", function ( geometry ) {
					geometry.computeFaceNormals();
					geometry.computeVertexNormals();
					meshEdema = new THREE.Mesh( geometry, matEdema );
				//	meshEdema.material.opacity=1.0;
				//	meshEdema.material.renderOrder=1.0;
					meshEdema.material.visible=true;
				//	meshEdema.material.transparent=true;
					meshEdema.scale.multiplyScalar( 0.2 );
					scene.add( meshEdema );
				} );	
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
	// Actualiza la posicion de la camara segun la interaccion entre frames
	

	matBrain.opacity= effectControler.opacityBrain;
//	matTumor.opacity= effectControler.opacityTumor;
//	matEdema.opacity= effectControler.opacityEdema;
	matEdema.visible= effectControler.Edema;
	controls.update();

//	stats.update();
}

function setUpGUI(){
	// Definicion de los controles
	effectControler = {
		//nombre: "____",
		//datos: "xyxyxyxy",

		opacityBrain: 0.5,
	//	opacityTumor: 1.0,
	//	opacityEdema: 1.0,
	
		Edema: true
		
	
	};

	// Creacion de la interfaz
	var gui = new dat.GUI();

	// Construir el menu de widgets
	var h = gui.addFolder( "Opacity Brain" );
	//h.add( effectControler, "nombre" ).name("");
	//h.add( effectControler, "datos" ).name("Opacity");

	h.add(effectControler,"Edema").name("Edema");

	h.add( effectControler, "opacityBrain", 0.0, 1.0, 0.1 ).name("Brain");
//	h.add( effectControler, "opacityTumor", 0.0, 1.0, 0.1 ).name("Tumor");
//	h.add( effectControler, "opacityEdema", 0.0, 1.0, 0.1 ).name("Edema");
	
}
