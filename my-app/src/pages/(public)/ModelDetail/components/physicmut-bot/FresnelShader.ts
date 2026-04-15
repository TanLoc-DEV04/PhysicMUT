
import * as THREE from 'three';

export const createFresnelShader = (colorHex: number) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      glowColor: { value: new THREE.Color(colorHex) },
      rimPower: { value: 0.4 },     // Unused in chatbot shader logic but kept for interface
      rimIntensity: { value: 2.0 }  // Default intensity
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float time;
      uniform float rimPower;
      uniform float rimIntensity;

      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;

      void main() {
        // Normalizing vectors
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel Rim calculation
        float dotProduct = dot(normal, viewDir);
        float rim = 1.0 - max(dotProduct, 0.0);
        rim = pow(rim, 4.0); // Fixed power 4.0 from chatbot source

        // Inner body glow (subtle)
        float bodyGlow = 0.15;

        // Pulsating effect
        float pulse = sin(time * 2.0) * 0.1 + 0.9;

        // Combine
        vec3 finalColor = glowColor * (rim * rimIntensity * pulse);
        
        // Alpha blending: Rim is opaque, center is transparent-ish
        float alpha = rim + bodyGlow;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending // AdditiveBlending from chatbot source 
  });
};
