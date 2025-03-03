import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  PerspectiveCamera, 
  Text, 
  Environment, 
  ContactShadows,
  useHelper,
  Sky as DreiSky,
  Html
} from '@react-three/drei';
import { useAppStore } from '../store';
import ViewControls from './ViewControls';
import * as THREE from 'three';
import { DirectionalLightHelper } from 'three';
import { useSpring, animated } from '@react-spring/three';

// Animated component wrapper
const AnimatedComponent: React.FC<{
  id: string;
  children: React.ReactNode;
  isAssembledView: boolean;
  position: [number, number, number];
}> = ({ id, children, isAssembledView, position }) => {
  // Calculate exploded position - move components outward from center
  const explodedPos: [number, number, number] = [
    position[0] * 1.5,
    position[1] * 1.2,
    position[2] * 1.5
  ];
  
  const props = useSpring({
    position: isAssembledView ? position : explodedPos,
    config: { mass: 1, tension: 170, friction: 26 }
  });
  
  return (
    <animated.group {...props}>
      {children}
    </animated.group>
  );
};

// Improved utility pole with more realistic shape
const UtilityPole: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Main pole */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 12, 16]} />
        <meshStandardMaterial 
          color="#B8976F" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Ground reinforcement */}
      <mesh position={[0, -5.9, 0]} receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Improved crossarm with procedural texture
const Crossarm: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Main crossarm */}
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.2, 0.2]} />
        <meshStandardMaterial 
          color="#A0522D" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Mounting bracket */}
      <mesh position={[0, -0.15, 0.15]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshStandardMaterial color="#5A5A5A" roughness={0.5} metalness={0.7} />
      </mesh>
      
      {/* Mounting bolts */}
      <mesh position={[0, -0.15, 0.25]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#777777" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// Improved insulator with glass-like material
const Insulator: React.FC<{ 
  position: [number, number, number],
  rotation?: [number, number, number]
}> = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Metal pin/base that attaches to crossarm */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#777777" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
        <meshPhysicalMaterial 
          color="#E0E0E0" 
          roughness={0.2} 
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Middle section */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.1, 16]} />
        <meshPhysicalMaterial 
          color="#D0D0D0" 
          roughness={0.2} 
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Top section */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.1, 16]} />
        <meshPhysicalMaterial 
          color="#E0E0E0" 
          roughness={0.2} 
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>
      
      {/* Metal cap on top */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.04, 0.05, 8]} />
        <meshStandardMaterial color="#777777" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
};

// Improved transformer with metallic material
const Transformer: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Main transformer body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />
        <meshStandardMaterial 
          color="#4A4A4A" 
          roughness={0.5} 
          metalness={0.7} 
        />
      </mesh>
      
      {/* Top cap */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshStandardMaterial 
          color="#333333" 
          roughness={0.4} 
          metalness={0.8} 
        />
      </mesh>
      
      {/* Cooling fins */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            0.4 * Math.cos(i * Math.PI / 4), 
            0, 
            0.4 * Math.sin(i * Math.PI / 4)
          ]}
          rotation={[0, i * Math.PI / 4, 0]}
          castShadow
        >
          <boxGeometry args={[0.01, 0.7, 0.2]} />
          <meshStandardMaterial 
            color="#555555" 
            roughness={0.5} 
            metalness={0.6} 
          />
        </mesh>
      ))}
      
      {/* Mounting bracket */}
      <mesh position={[0, 0, 0.4]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.2]} />
        <meshStandardMaterial 
          color="#555555" 
          roughness={0.5} 
          metalness={0.7} 
        />
      </mesh>
    </group>
  );
};

// Improved hardware component with metallic material
const Hardware: React.FC<{ 
  position: [number, number, number], 
  size?: [number, number, number], 
  color?: string,
  rotation?: [number, number, number]
}> = ({ 
  position, 
  size = [0.1, 0.1, 0.1], 
  color = "#696969",
  rotation = [0, 0, 0]
}) => {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.5} 
        metalness={0.7} 
      />
    </mesh>
  );
};

// Animated conductor component
const AnimatedConductor: React.FC<{
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  droop?: number;
  segments?: number;
  thickness?: number;
  color?: string;
  isAssembledView: boolean;
}> = ({
  startPosition,
  endPosition,
  droop = 0.5,
  segments = 20,
  thickness = 0.03,
  color = "#111111",
  isAssembledView
}) => {
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  
  useEffect(() => {
    // Calculate exploded positions
    const explodedStart: [number, number, number] = [
      startPosition[0] * 1.5,
      startPosition[1] * 1.2,
      startPosition[2] * 1.5
    ];
    
    const explodedEnd: [number, number, number] = [
      endPosition[0] * 1.5,
      endPosition[1] * 1.2,
      endPosition[2] * 1.5
    ];
    
    const startPos = isAssembledView ? startPosition : explodedStart;
    const endPos = isAssembledView ? endPosition : explodedEnd;
    
    const newPoints = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startPos[0] + (endPos[0] - startPos[0]) * t;
      const z = startPos[2] + (endPos[2] - startPos[2]) * t;
      
      // Catenary curve formula: y = a * cosh(x/a) - a
      // Simplified for our needs with the droop parameter
      const normalizedX = (t - 0.5) * 2; // -1 to 1
      const y = startPos[1] - droop * (1 - Math.cos(Math.PI * normalizedX));
      
      newPoints.push(new THREE.Vector3(x, y, z));
    }
    
    setPoints(newPoints);
  }, [startPosition, endPosition, segments, droop, isAssembledView]);
  
  if (points.length === 0) return null;
  
  const curve = new THREE.CatmullRomCurve3(points);
  
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, segments, thickness, 8, false]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.6} 
        metalness={0.4} 
      />
    </mesh>
  );
};

// Component for handling component selection with enhanced hover effects
const SelectableComponent: React.FC<{
  id: string;
  children: React.ReactNode;
  label?: string;
  position?: [number, number, number];
  name?: string;
  description?: string;
  isAssembledView: boolean;
}> = ({ id, children, label, position, name, description, isAssembledView }) => {
  const selectComponent = useAppStore(state => state.selectComponent);
  const selectedComponentId = useAppStore(state => state.selectedComponentId);
  const isSelected = selectedComponentId === id;
  const [hovered, setHovered] = useState(false);
  
  // Adjust label position based on view mode
  const labelPosition = position ? [...position] : [0, 0, 0];
  if (isAssembledView && position) {
    // Move labels slightly outward in assembled view to avoid overlap
    if (position[0] < 0) labelPosition[0] -= 0.5;
    else if (position[0] > 0) labelPosition[0] += 0.5;
    
    if (position[2] < 0) labelPosition[2] -= 0.5;
    else if (position[2] > 0) labelPosition[2] += 0.5;
  }
  
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <group>
        {React.Children.map(children, child => 
          React.cloneElement(child as React.ReactElement, {
            material: {
              ...(child as React.ReactElement).props.material,
              emissive: hovered ? "#444444" : "#000000",
              emissiveIntensity: hovered ? 0.5 : 0
            }
          })
        )}
      </group>
      
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#4285F4" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      
      {label && position && (
        <Text
          position={labelPosition}
          fontSize={0.2}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          depthTest={false}
        >
          {label}
        </Text>
      )}
      
      {isSelected && name && position && (
        <Html position={[position[0], position[1] + 0.5, position[2]]} center>
          <div className="bg-white p-3 rounded-lg shadow-lg" style={{ width: '200px' }}>
            <h3 className="text-lg font-bold">{name}</h3>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
        </Html>
      )}
      
      {hovered && !isSelected && name && position && (
        <Html position={[position[0], position[1] + 0.3, position[2]]} center>
          <div className="bg-white px-2 py-1 rounded shadow-sm">
            <span className="text-sm font-medium">{name}</span>
          </div>
        </Html>
      )}
    </group>
  );
};

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

// View mode indicator
const ViewModeIndicator: React.FC<{ isAssembledView: boolean }> = ({ isAssembledView }) => {
  return (
    <Html position={[0, 15, 0]} center>
      <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
        isAssembledView ? 'bg-purple-600' : 'bg-blue-600'
      }`}>
        {isAssembledView ? 'Assembled View' : 'Exploded View'}
      </div>
    </Html>
  );
};

// Main 3D scene component
const Scene3D: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const activeConfig = useAppStore(state => state.getActiveConfig());
  const selectComponent = useAppStore(state => state.selectComponent);
  const isAssembledView = useAppStore(state => state.isAssembledView);
  
  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };
  
  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.zoomIn(1.2);
    }
  };
  
  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.zoomOut(1.2);
    }
  };
  
  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };
  
  const handleToggleLabels = () => {
    setShowLabels(!showLabels);
  };
  
  const handleCanvasClick = () => {
    selectComponent(null);
  };
  
  // Get component data from the store
  const getComponentData = (id: string) => {
    if (!activeConfig) return null;
    return activeConfig.components.find(comp => comp.id === id);
  };
  
  // Group components by type for rendering
  const componentsByType = React.useMemo(() => {
    if (!activeConfig) return {};
    
    const result: Record<string, any[]> = {
      poles: [],
      crossarms: [],
      insulators: [],
      transformers: [],
      hardware: [],
      conductors: []
    };
    
    activeConfig.components.forEach(component => {
      switch (component.category) {
        case 'pole':
          result.poles.push(component);
          break;
        case 'crossarm':
          result.crossarms.push(component);
          break;
        case 'insulator':
          result.insulators.push(component);
          break;
        case 'transformer':
          result.transformers.push(component);
          break;
        case 'hardware':
          result.hardware.push(component);
          break;
        case 'conductor':
          result.conductors.push(component);
          break;
        default:
          // Other components
          break;
      }
    });
    
    return result;
  }, [activeConfig]);
  
  if (!activeConfig) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Configuration Loaded</h2>
          <p className="text-gray-600">Please select a configuration to view or create a new one.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <Canvas 
        onClick={handleCanvasClick} 
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
          
          {/* View mode indicator */}
          <ViewModeIndicator isAssembledView={isAssembledView} />
          
          {/* Grid */}
          {showGrid && (
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
          )}
          
          {/* Render poles */}
          {componentsByType.poles.map(component => (
            <AnimatedComponent 
              key={component.id} 
              id={component.id} 
              isAssembledView={isAssembledView}
              position={component.position}
            >
              <SelectableComponent 
                id={component.id} 
                label={showLabels ? "A" : undefined}
                position={[0.5, 6, 0]}
                name={component.name}
                description={component.description}
                isAssembledView={isAssembledView}
              >
                <UtilityPole position={[0, 0, 0]} />
              </SelectableComponent>
            </AnimatedComponent>
          ))}
          
          {/* Render crossarms */}
          {componentsByType.crossarms.map(component => (
            <AnimatedComponent 
              key={component.id} 
              id={component.id} 
              isAssembledView={isAssembledView}
              position={component.position}
            >
              <SelectableComponent 
                id={component.id}
                label={showLabels ? "B" : undefined}
                position={[0, 0.5, 0]}
                name={component.name}
                description={component.description}
                isAssembledView={isAssembledView}
              >
                <Crossarm position={[0, 0, 0]} />
              </SelectableComponent>
            </AnimatedComponent>
          ))}
          
          {/* Render insulators */}
          {componentsByType.insulators.map(component => (
            <AnimatedComponent 
              key={component.id} 
              id={component.id} 
              isAssembledView={isAssembledView}
              position={component.position}
            >
              <SelectableComponent 
                id={component.id}
                label={showLabels ? "C" : undefined}
                position={[0, 0.5, 0]}
                name={component.name}
                description={component.description}
                isAssembledView={isAssembledView}
              >
                <Insulator 
                  position={[0, 0, 0]} 
                  rotation={component.rotation}
                />
              </SelectableComponent>
            </AnimatedComponent>
          ))}
          
          {/* Render transformers */}
          {componentsByType.transformers.map(component => (
            <AnimatedComponent 
              key={component.id} 
              id={component.id} 
              isAssembledView={isAssembledView}
              position={component.position}
            >
              <SelectableComponent 
                id={component.id}
                label={showLabels ? "F" : undefined}
                position={[0, 1, 0.5]}
                name={component.name}
                description={component.description}
                isAssembledView={isAssembledView}
              >
                <Transformer position={[0, 0, 0]} />
              </SelectableComponent>
            </AnimatedComponent>
          ))}
          
          {/* Render hardware */}
          {componentsByType.hardware.map(component => (
            <AnimatedComponent 
              key={component.id} 
              id={component.id} 
              isAssembledView={isAssembledView}
              position={component.position}
            >
              <SelectableComponent 
                id={component.id}
                name={component.name}
                description={component.description}
                isAssembledView={isAssembledView}
              >
                <Hardware 
                  position={[0, 0, 0]} 
                  size={[0.05, 0.1, 0.05]} 
                  rotation={component.rotation}
                />
              </SelectableComponent>
            </AnimatedComponent>
          ))}
          
          {/* Render conductors */}
          {componentsByType.conductors.map((component, index) => {
            // For conductors, we need to determine start and end points
            // This is simplified - in a real app, you'd have more sophisticated logic
            const startPosition = component.position;
            const endPosition: [number, number, number] = [
              startPosition[0] < 0 ? -10 : 10, // Extend left or right based on position
              startPosition[1],
              startPosition[2]
            ];
            
            return (
              <SelectableComponent 
                key={component.id}
                id={component.id}
                label={showLabels ? (index === 0 ? "D" : "E") : undefined}
                position={[startPosition[0] < 0 ? -5 : 5, startPosition[1], startPosition[2]]}
                name={component.name}
                description={component.description}
                isAssembledView={isAssembledView}
              >
                <AnimatedConductor 
                  startPosition={startPosition}
                  endPosition={endPosition}
                  droop={0.7}
                  thickness={0.03}
                  isAssembledView={isAssembledView}
                />
              </SelectableComponent>
            );
          })}
        </Suspense>
      </Canvas>
      
      <ViewControls
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleGrid={handleToggleGrid}
        onToggleLabels={handleToggleLabels}
        showGrid={showGrid}
        showLabels={showLabels}
      />
      
      {activeConfig?.macroCode && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-80 px-3 py-2 rounded-md shadow-sm">
          <span className="font-mono text-sm font-medium">Macro Code: {activeConfig.macroCode}</span>
        </div>
      )}
      
      <div className="absolute bottom-20 left-4 bg-white bg-opacity-80 px-3 py-2 rounded-md shadow-sm">
        <span className="text-sm">Hover over components to see names, click for details</span>
      </div>
      
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-3 rounded-md shadow-md">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${isAssembledView ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
          <span className="font-medium">{isAssembledView ? 'Assembled View' : 'Exploded View'}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {isAssembledView 
            ? 'Components are positioned as they would be in the real world' 
            : 'Components are spaced out for better visibility'}
        </p>
      </div>
    </div>
  );
};

export default Scene3D;