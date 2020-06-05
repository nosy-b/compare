// import * as THREE from '../three';
import * as THREE from '../node_modules/three/build/three.module.js';
import { ShaderCompare } from '../src/ShaderCompare.js';

/*
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from '../node_modules/three/examples/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from '../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from '../node_modules/three/examples/jsm/postprocessing/ShaderPass.js';

*/

var camera, scene, renderer, composer;
var geometry, material, mesh;
var shaderCompare; 
var mouse = new THREE.Vector2();
var timeSinceMove = 0;
var textureSize = new THREE.Vector2(4264, 2048);

var renderTarget1, renderTarget2, sceneShader, sceneScreen, uniforms, materialScreen;
init();
animate();



function init() {

    // Initialize the camera
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    document.body.appendChild( renderer.domElement );

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
    materialScreen =  new THREE.MeshBasicMaterial(/*{color:0xFF0000}*/); // shaderCompare;


		// Create the meshes and add them to the scenes
		var meshShader = new THREE.Mesh(geometry, materialShader);
		var meshScreen = new THREE.Mesh(geometry, materialScreen);
		sceneShader.add(meshShader);
    sceneScreen.add(meshScreen);


    shaderCompare.uniforms.textureSize.value = textureSize;
    shaderCompare.uniforms.renderSize.value =  new THREE.Vector2(window.innerWidth, window.innerHeight);

    loadTextures();
    document.body.style.cursor = "crosshair";
    
}


// Send the textures to the shader as uniforms
function loadTextures(){

  shaderCompare.uniforms.imgA.value = new THREE.TextureLoader().load("img/orthoLaBauleRecenteCropped.jpg");
  shaderCompare.uniforms.imgB.value = new THREE.TextureLoader().load("img/orthoLaBaule1950Cropped.jpg");

  // Update texture size
}
 

function animate() {
 
    requestAnimationFrame( animate );

    shaderCompare.uniforms.time.value += 0.01;
    shaderCompare.uniforms.timeSinceMove.value = timeSinceMove;
    timeSinceMove += 0.01;
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

    // renderer.render(sceneScreen, camera, renderTarget1);
    renderer.setRenderTarget(renderTarget1 );
    renderer.clear();
    renderer.render(sceneScreen, camera);
    materialScreen.visible = true;

  }
  // Update the uniforms
  // uniforms.u_time.value = clock.getElapsedTime();
  // uniforms.u_frame.value += 1.0;
  uniforms.tDiffuse.value = renderTarget1.texture;

  // Render the shader scene
  // renderer.render(sceneShader, camera, renderTarget2);
  renderer.setRenderTarget(renderTarget2 );
 // renderer.clear();
  renderer.render(sceneShader, camera);

  // Update the screen material texture
  materialScreen.map = renderTarget2.texture;
  materialScreen.needsUpdate = true;

  // Render the screen scene
  // renderer.render(sceneScreen, camera);
  renderer.setRenderTarget(null );
  //renderer.clear();
  renderer.render(sceneScreen, camera);

  // Swap the render targets
  var tmp = renderTarget1;
  renderTarget1 = renderTarget2;
  renderTarget2 = tmp;
  
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  renderer.setSize(window.innerWidth, window.innerHeight);
  shaderCompare.uniforms.renderSize.value =  new THREE.Vector2(window.innerWidth, window.innerHeight);
}

document.onmousemove = function(e){
  
  mouse = new THREE.Vector2(e.pageX/ window.innerWidth, 1- e.pageY/ window.innerHeight);
  shaderCompare.uniforms.mousePos.value = mouse;
  timeSinceMove = 0;

}