import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const ThreeJSScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    
    camera.position.z = 5;

    // Central Glowing Orb (The AI Brain)
    const vertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      uniform float uTime;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 color = vec3(0.2, 0.4, 1.0) * intensity;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const orbGeometry = new THREE.IcosahedronGeometry(1, 15);
    const orbMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uTime: { value: 0 } },
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orb);
    
    // Surrounding particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.009,
        color: 0x06B6D4,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse tracking
    let mouse = new THREE.Vector2();
    const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        
        orb.rotation.y = .3 * elapsedTime;
        orb.material.uniforms.uTime.value = elapsedTime;

        particlesMesh.rotation.y = -.1 * elapsedTime;
        
        // Parallax effect
        camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 0.5 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      if(renderer.domElement && mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};


export default function Home() {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <ThreeJSScene />
      <div className="relative z-10 text-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent mb-4">
            Marketing OS
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Plan → Create → Launch → Learn — in one magical loop.
          </p>
        </motion.div>
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8"
        >
           <p className="text-slate-400 text-sm">
            The intelligent control center for modern marketing teams.
          </p>
        </motion.div>
      </div>
    </div>
  );
}