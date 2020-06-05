/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */



var ShaderCompare = {

	uniforms: {

		"tDiffuse": { value: null },
		"imgA": { value: null },
		"imgB": { value: null },
		"mousePos": { value:  {x:0, y:0}},
		"time": { value: 0. },
		"opacity": { value: 1.0 },
		"renderRatio": {value:1},  // Screen ratio  W/H
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"uniform float opacity;",
		"uniform float time;",
		"uniform vec2 mousePos;", // Already normalized

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D imgA;",  // Recent image
		"uniform sampler2D imgB;",  // Historical image
		"uniform float renderRatio;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 texelA = texture2D( imgA, vUv );",
		"	vec4 texelB = texture2D( imgB, vUv );",
		"	vec4 texelPreviousFrame = texture2D( tDiffuse, vUv );",
		"	float l = linearToRelativeLuminance( texelA.rgb );", // luminance: vec3 weights = vec3( 0.2126, 0.7152, 0.0722 ); return dot( weights, color.rgb );
		"	vec4 testminusluminance = opacity * (2.* texelA - vec4(l,l,l,texelA.a));",
		
		"	gl_FragColor = texelPreviousFrame;", 
		"if (distance(vec2(vUv.x * renderRatio,vUv.y) , vec2(mousePos.x * renderRatio, mousePos.y)) < 0.2) ",
		"	gl_FragColor = texelPreviousFrame + texelB * 0.01 /*texelPreviousFrame - 0.01*/;", 
		

		
		"}"

	].join( "\n" )

};

export { ShaderCompare };
