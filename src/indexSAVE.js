// import * as THREE from '../three';
import * as THREE from '../node_modules/three/build/three.module.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from '../node_modules/three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { ShaderCompare } from '../src/ShaderCompare.js';

var camera, scene, renderer, composer;
var geometry, material, mesh;
var shaderCompare; 
var mouse = new THREE.Vector2();

var renderTarget1, renderTarget2, sceneShader, sceneScreen, uniforms, materialScreen;
init();
animate();


function init() {
 
    // camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    // camera.position.z = 1;
    // Initialize the camera
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  //  scene = new THREE.Scene();
/*
    geometry = new THREE.BoxGeometry( 0.1, 0.2, 0.2 );
    material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
 */



    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

// VERSION OUTPUT TO INPUT
		// Create the plane geometry
    var geometry = new THREE.PlaneBufferGeometry(2, 2);

		// Initialize the render targets
		var size = renderer.getDrawingBufferSize();
		var options = {
			minFilter : THREE.NearestFilter,
			magFilter : THREE.NearestFilter,
			format : THREE.RGBAFormat,
			type : /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType
		};
		renderTarget1 = new THREE.WebGLRenderTarget(size.width, size.height, options);
		renderTarget2 = new THREE.WebGLRenderTarget(size.width, size.height, options);

		// Initialize the scenes
		sceneShader = new THREE.Scene();
		sceneScreen = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry(2, 2);


    // Create the shader material
    shaderCompare = new THREE.ShaderMaterial(ShaderCompare); // ShaderCompare;
    var materialShader = shaderCompare;
    uniforms = shaderCompare.uniforms;

		// Create the screen material
    materialScreen =  new THREE.MeshBasicMaterial({color:0xFF0000}); // shaderCompare;


		// Create the meshes and add them to the scenes
		var meshShader = new THREE.Mesh(geometry, materialShader);
		var meshScreen = new THREE.Mesh(geometry, materialScreen);
		sceneShader.add(meshShader);
    sceneScreen.add(meshScreen);
    

    
/*
    composer = new EffectComposer( renderer );

    var renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    shaderCompare = new ShaderPass( ShaderCompare );
    composer.addPass( shaderCompare );
*/

    shaderCompare.uniforms.renderRatio.value =  window.innerWidth / window.innerHeight;

    loadTextures();
    
}


// Send the textures to the shader as uniforms
function loadTextures(){

  shaderCompare.uniforms.imgA.value = new THREE.TextureLoader().load("img/orthoLaBauleRecenteCropped.jpg");
  shaderCompare.uniforms.imgB.value = new THREE.TextureLoader().load("img/orthoLaBaule1950Cropped.jpg");
}
 

function animate() {
 
    requestAnimationFrame( animate );

    shaderCompare.uniforms.time.value += 0.01;

    // composer.render();
    render();
    // renderer.render( scene, camera );
 
}





function render() {
    // Render the screen scene
    // renderer.render(sceneScreen, camera);
   
   // Start rendering an empty screen scene on the first render target
   if (!uniforms.tDiffuse.value) {
     materialScreen.visible = false;
     renderer.render(sceneScreen, camera, renderTarget1);
     materialScreen.visible = true;
 
   }
   // Update the uniforms
   // uniforms.u_time.value = clock.getElapsedTime();
   // uniforms.u_frame.value += 1.0;
   uniforms.tDiffuse.value = renderTarget1.texture;
 
   // Render the shader scene
   renderer.render(sceneShader, camera, renderTarget2);
 
   // Update the screen material texture
  // materialScreen.map = renderTarget2.texture;
   materialScreen.needsUpdate = true;
 
   // Render the screen scene
   renderer.render(sceneScreen, camera);
 
   // Swap the render targets
   var tmp = renderTarget1;
   renderTarget1 = renderTarget2;
   renderTarget2 = tmp;
   
 }

document.onmousemove = function(e){
  mouse = new THREE.Vector2(e.pageX/ window.innerWidth, 1- e.pageY/ window.innerHeight);
  shaderCompare.uniforms.mousePos.value = mouse;
}