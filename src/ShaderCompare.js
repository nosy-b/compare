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
		"timeSinceMove": { value: 0. },
		"opacity": { value: 1.0 },
		"textureSize": {value:{x:0, y:0}},  // Screen ratio  W/H
		"renderSize": {value:{x:0, y:0}}  // Screen ratio  W/H
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#define M_PI 3.1415926535897932384626433832795",
		"#define PHI_STEP M_PI/180.0",
		"#include <common>",

		"uniform float opacity;",
		"uniform float time;",
		"uniform float timeSinceMove;",
		"uniform vec2 mousePos;", // Already normalized

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D imgA;",  // Recent image
		"uniform sampler2D imgB;",  // Historical image
		"uniform vec2 textureSize;",
		"uniform vec2 renderSize;",

		"varying vec2 vUv;",


		"void main() {",

		"   float renderRatio = renderSize.x / renderSize.y;",
		"   float textureRatio = textureSize.x / textureSize.y;",
		"	vec2 uv = vec2(vUv.x, vUv.y * textureRatio / renderRatio );",
		"   float heightShift = textureRatio / renderRatio;",
		"   uv.y -= (heightShift - 1.) / 2.;",
		"	vec4 texelA = texture2D( imgA, uv );",
		"	vec4 texelB = texture2D( imgB, uv );",
		"	if (uv.y > 1. || uv.y < 0.) {texelA = vec4(1.); texelB = vec4(1.);}", 
		"	vec4 texelPreviousFrame = texture2D( tDiffuse, vUv );",
		"	float l = linearToRelativeLuminance( texelA.rgb );", // luminance: vec3 weights = vec3( 0.2126, 0.7152, 0.0722 ); return dot( weights, color.rgb );
		"	vec4 testminusluminance = opacity * (2.* texelA - vec4(l,l,l,texelA.a));",
		
		"	gl_FragColor =  texelPreviousFrame /* texelA */;", 




		"	if (distance(vec2(vUv.x * renderRatio,vUv.y) , vec2(mousePos.x * renderRatio, mousePos.y)) < 0.1 && timeSinceMove < 0.1 ) ",
		"		gl_FragColor =  mix(texelPreviousFrame, texelB, .4);", 



	//	"vec2 uv = vUv;",
		"vec2 iResolution = textureSize ; //mix(textureSize, vec2(1.,1.) / textureSize, time / 10.);",
    
		//fragColor = 4.*abs(fwidth(texture(iChannel0, uv)));
		
		"vec3 TL = texture2D(imgA, uv + vec2(-1, 1)/ iResolution.xy).rgb;",
		"vec3 TM = texture2D(imgA, uv + vec2(0, 1)/ iResolution.xy).rgb;",
		"vec3 TR = texture2D(imgA, uv + vec2(1, 1)/ iResolution.xy).rgb;",
		
		"vec3 ML = texture2D(imgA, uv + vec2(-1, 0)/ iResolution.xy).rgb;",
		"vec3 MR = texture2D(imgA, uv + vec2(1, 0)/ iResolution.xy).rgb;",
		
		"vec3 BL = texture2D(imgA, uv + vec2(-1, -1)/ iResolution.xy).rgb;",
		"vec3 BM = texture2D(imgA, uv + vec2(0, -1)/ iResolution.xy).rgb;",
		"vec3 BR = texture2D(imgA, uv + vec2(1, -1)/ iResolution.xy).rgb;",
							 
		"vec3 GradX = -TL + TR - 2.0 * ML + 2.0 * MR - BL + BR;",
		"vec3 GradY = TL + 2.0 * TM + TR - BL - 2.0 * BM - BR;",
		
		"vec4 sobelColor = vec4( length(vec2(GradX.r, GradY.r)), length(vec2(GradX.g, GradY.g)), length(vec2(GradX.b, GradY.b)), 1. );",
//		"gl_FragColor =  sobelColor;",


		// Test croissance de région avec vitesse locale dépendant du gradient




		"	if(time < .2) gl_FragColor = texelA;",  // To force to start with the recent ortho
		
		"   gl_FragColor = mix(gl_FragColor, texelA, 0.01);",  // Continuous transformation to recent image


		"}"

	].join( "\n" )

};

export { ShaderCompare };
