import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  PerspectiveCamera, 
  Text, 
  Environment, 
  ContactShadows,
  useHelper,
  Sky as DreiSky,
  Html,
  Line
} from '@react-three/drei';
import { useAppStore } from '../store';
import * as THREE from 'three';
import { DirectionalLightHelper } from 'three';
import { useSpring, animated } from '@react-spring/three';
import { ComponentCategory } from '../types';

// Enhanced lighting setup with helpers
const SceneLighting: React.FC = () => {
  const mainLightRef = useRef<THREE.DirectionalLight>(null);
  const debug = false; // Set to true to see light helpers
  
  // Show helper in development mode
  useHelper(debug && mainLightRef, DirectionalLightHelper, 1, 'red');
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        ref={mainLightRef}
        position={[10, 20, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight intensity={0.3} color="#ffffff" groundColor="#8BA446" />
    </>
  );
};

// Camera controls component with enhanced features
const CameraController: React.FC<{
  controlsRef: React.RefObject<any>;
}> = ({ controlsRef }) => {
  const { camera } = useThree();
  
  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 5, 0);
  }, [camera]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      minDistance={3}
      maxDistance={30}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
      target={[0, 5, 0]}
    />
  );
};

// Enhanced sky and environment
const SkyAndEnvironment: React.FC = () => {
  return (
    <>
      <DreiSky 
        distance={450} 
        sunPosition={[10, 20, 5]} 
        inclination={0.5} 
        azimuth={0.25} 
      />
      <Environment preset="sunset" />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#8BA446" />
      </mesh>
      
      {/* Contact shadows for better grounding */}
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={40} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />
    </>
  );
};

// Loading indicator
const Loader: React.FC = () => {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    </Html>
  );
};

// Component for rendering a 3D preview of the pole design
const Scene3DBuilder: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const activePoleDesign = useAppStore(state => state.getActivePoleDesign());
  const getComponentTemplate = useAppStore(state => state.getComponentTemplate);
  const isAssembledView = useAppStore(state => state.isAssembledView);
  
  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };
  
  if (!activePoleDesign) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg text-gray-600">No pole design selected</p>
          <p className="text-sm text-gray-500 mt-2">Create a new design to get started</p>
        </div>
      </div>
    );
  }
  
  // Create a map of component positions for attachment lines
  const componentPositions = new Map<string, THREE.Vector3>();
  activePoleDesign.components.forEach(component => {
    const position = isAssembledView 
      ? new THREE.Vector3(...component.position)
      : new THREE.Vector3(
          component.position[0] * 1.5,
          component.position[1] * 1.2,
          component.position[2] * 1.5
        );
    
    componentPositions.set(component.id, position);
  });
  
  // Create attachment lines
  const attachmentLines: { points: THREE.Vector3[]; key: string }[] = [];
  activePoleDesign.components.forEach(component => {
    if (component.attachedTo) {
      const startPos = componentPositions.get(component.id);
      const endPos = componentPositions.get(component.attachedTo);
      
      if (startPos && endPos) {
        attachmentLines.push({
          points: [startPos, endPos],
          key: `${component.id}-${component.attachedTo}`
        });
      }
    }
  });
  
  return (
    <div className="relative w-full h-full">
      <Canvas 
        shadows 
        camera={{ position: [10, 10, 10], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]} // Responsive rendering for different device pixel ratios
      >
        <Suspense fallback={<Loader />}>
          <CameraController controlsRef={controlsRef} />
          
          {/* Lighting */}
          <SceneLighting />
          
          {/* Sky and environment */}
          <SkyAndEnvironment />
          
          {/* Grid */}
          <Grid 
            args={[100, 100]} 
            cellSize={1} 
            cellThickness={0.5} 
            cellColor="#6F6F6F" 
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9D9D9D"
            fadeDistance={50}
            position={[0, 0.01, 0]}
          />
          
          {/* Attachment lines */}
          {attachmentLines.map(line => (
            <Line
              key={line.key}
              points={line.points}
              color="#3b82f6"
              lineWidth={1}
              dashed
              dashSize={0.2}
              dashScale={1}
              dashOffset={0}
            />
          ))}
          
          {/* Components */}
          {activePoleDesign.components.map(component => {
            const template = getComponentTemplate(component.templateId);
            if (!template) return null;
            
            // Determine position based on view mode
            const position = isAssembledView 
              ? component.position
              : [component.position[0] * 1.5, component.position[1] * 1.2, component.position[2] * 1.5];
            
            // Create a simple representation based on component category
            switch (template.category) {
              case ComponentCategory.POLE:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <cylinderGeometry args={[0.15, 0.2, 12, 16]} />
                      <meshStandardMaterial color="#B8976F" roughness={0.8} metalness={0.1} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 6, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.CROSSARM:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
                      <boxGeometry args={[4, 0.2, 0.2]} />
                      <meshStandardMaterial color="#A0522D" roughness={0.7} metalness={0.1} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.5, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.INSULATOR:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />
                      <meshPhysicalMaterial color="#E0E0E0" roughness={0.2} clearcoat={0.5} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.5, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.TRANSFORMER:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
                      <meshStandardMaterial color="#4A4A4A" roughness={0.5} metalness={0.7} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.8, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.CONDUCTOR:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <cylinderGeometry args={[0.03, 0.03, 2, 8]} rotation={[0, 0, Math.PI / 2]} />
                      <meshStandardMaterial color="#111111" roughness={0.6} metalness={0.4} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.3, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.HARDWARE:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <boxGeometry args={[0.1, 0.1, 0.1]} />
                      <meshStandardMaterial color="#696969" roughness={0.5} metalness={0.7} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.3, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.GROUNDING:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
                      <meshStandardMaterial color="#B87333" roughness={0.4} metalness={0.8} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 1.5, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.GUY_ANCHOR:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <coneGeometry args={[0.2, 0.4, 16]} rotation={[Math.PI, 0, 0]} />
                      <meshStandardMaterial color="#555555" roughness={0.5} metalness={0.7} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.3, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              case ComponentCategory.GUY_WIRE:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <cylinderGeometry args={[0.01, 0.01, 2, 8]} />
                      <meshStandardMaterial color="#AAAAAA" roughness={0.3} metalness={0.9} />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.3, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
              default:
                return (
                  <group 
                    key={component.id}
                    position={position}
                    rotation={component.rotation}
                    scale={component.scale}
                  >
                    <mesh castShadow>
                      <sphereGeometry args={[0.2, 16, 16]} />
                      <meshStandardMaterial color="#CCCCCC" />
                    </mesh>
                    
                    {/* Label */}
                    <Html position={[0, 0.3, 0]} center>
                      <div className="bg-white px-2 py-1 rounded shadow text-xs">
                        {template.name}
                      </div>
                    </Html>
                  </group>
                );
            }
          })}
        </Suspense>
      </Canvas>
      
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-3 rounded-md shadow-md">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${isAssembledView ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
          <span className="font-medium">{isAssembledView ? '3D Assembled View' : '3D Exploded View'}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          This is a 3D preview of your design
        </p>
      </div>
      
      <button
        onClick={handleReset}
        className="absolute bottom-6 right-4 bg-white rounded-full shadow-lg p-2 hover:bg-slate-100"
        title="Reset View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      </button>
    </div>
  );
};

export default Scene3DBuilder;