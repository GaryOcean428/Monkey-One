import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useBrainCore } from '@/hooks/useBrainCore';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';

export function BrainVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number>(0);
  const regionsRef = useRef<THREE.Mesh[]>([]);
  
  const { brainState, neuralMetrics } = useBrainCore();
  const [isVisible, setIsVisible] = useState(false);

  // Throttle render updates for performance
  const updateRegions = useThrottledCallback((regions: THREE.Mesh[]) => {
    regions.forEach(region => {
      region.rotation.x += 0.001;
      region.rotation.y += 0.001;
    });
  }, 16); // ~60fps

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    sceneRef.current = new THREE.Scene();
    
    // Initialize camera with frustum culling
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 5;

    // Initialize renderer with performance optimizations
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: false, // Disable for performance
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    rendererRef.current.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(rendererRef.current.domElement);

    // Create brain regions with shared geometries and materials
    const regions = createBrainRegions();
    regions.forEach(region => sceneRef.current?.add(region));
    regionsRef.current = regions;

    // Add optimized lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    sceneRef.current.add(ambientLight, directionalLight);

    // Start animation loop
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
      
      frameRef.current = requestAnimationFrame(animate);
      
      // Only update visible regions
      if (isVisible) {
        updateRegions(regionsRef.current);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Intersection Observer for visibility
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      
      // Dispose resources
      regions.forEach(region => {
        region.geometry.dispose();
        (region.material as THREE.Material).dispose();
      });
      
      rendererRef.current?.dispose();
      
      if (containerRef.current?.contains(rendererRef.current?.domElement)) {
        containerRef.current.removeChild(rendererRef.current?.domElement);
      }
    };
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-[500px]">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Neural activity indicators */}
      <motion.div 
        className="absolute top-4 right-4 bg-black/50 text-white p-4 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
      >
        <h3 className="text-sm font-medium mb-2">Neural Activity</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Learning Rate:</span>
            <span>{neuralMetrics?.learningRate.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Regions:</span>
            <span>{brainState?.activeRegions.length}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Create optimized brain regions with shared resources
function createBrainRegions(): THREE.Mesh[] {
  const regions: THREE.Mesh[] = [];
  
  // Shared geometries
  const cortexGeometry = new THREE.SphereGeometry(1, 32, 32);
  
  // Shared materials with optimized settings
  const materials = {
    active: new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      opacity: 0.7,
      transparent: true,
      flatShading: true,
      vertexColors: false
    }),
    inactive: new THREE.MeshPhongMaterial({
      color: 0x666666,
      opacity: 0.3,
      transparent: true,
      flatShading: true,
      vertexColors: false
    })
  };

  // Create cortex
  const cortex = new THREE.Mesh(cortexGeometry, materials.active);
  regions.push(cortex);

  return regions;
}