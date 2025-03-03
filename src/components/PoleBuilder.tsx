import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  Text, 
  Environment, 
  ContactShadows,
  useHelper,
  Sky,
  Html,
  TransformControls,
  Line
} from '@react-three/drei';
import { useAppStore } from '../store';
import { ComponentCategory, AttachmentPoint } from '../types';
import { Trash2, RotateCw, ZoomIn, ZoomOut, Save, Layers, Layers3, Link, Eye } from 'lucide-react';
import * as THREE from 'three';
import { DirectionalLightHelper } from 'three';

// Enhanced lighting setup
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

// Camera controls component
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
      <Sky 
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

// Component category colors
const categoryColors: Record<ComponentCategory, string> = {
  [ComponentCategory.POLE]: '#B8976F',
  [ComponentCategory.CROSSARM]: '#A0522D',
  [ComponentCategory.INSULATOR]: '#E0E0E0',
  [ComponentCategory.TRANSFORMER]: '#4A4A4A',
  [ComponentCategory.CONDUCTOR]: '#111111',
  [ComponentCategory.HARDWARE]: '#696969',
  [ComponentCategory.GROUNDING]: '#B87333',
  [ComponentCategory.GUY_ANCHOR]: '#555555',
  [ComponentCategory.GUY_WIRE]: '#AAAAAA',
  [ComponentCategory.OTHER]: '#CCCCCC'
};

// Selectable 3D component
const SelectableComponent: React.FC<{
  id: string;
  templateId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  attachedTo?: string;
  onSelect: (id: string) => void;
  isSelected: boolean;
}> = ({ 
  id, 
  templateId, 
  position, 
  rotation, 
  scale, 
  attachedTo, 
  onSelect, 
  isSelected 
}) => {
  const getComponentTemplate = useAppStore(state => state.getComponentTemplate);
  const template = getComponentTemplate(templateId);
  const [hovered, setHovered] = useState(false);
  
  if (!template) return null;
  
  // Determine geometry and color based on component category
  let geometry;
  let color = categoryColors[template.category];
  
  switch (template.category) {
    case ComponentCategory.POLE:
      geometry = <cylinderGeometry args={[0.15, 0.2, 12, 16]} />;
      break;
    case ComponentCategory.CROSSARM:
      geometry = <boxGeometry args={[4, 0.2, 0.2]} />;
      break;
    case ComponentCategory.INSULATOR:
      geometry = <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />;
      break;
    case ComponentCategory.TRANSFORMER:
      geometry = <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />;
      break;
    case ComponentCategory.CONDUCTOR:
      geometry = <cylinderGeometry args={[0.03, 0.03, 2, 8]} rotation={[0, 0, Math.PI / 2]} />;
      break;
    case ComponentCategory.HARDWARE:
      geometry = <boxGeometry args={[0.1, 0.1, 0.1]} />;
      break;
    case ComponentCategory.GROUNDING:
      geometry = <cylinderGeometry args={[0.02, 0.02, 3, 8]} />;
      break;
    case ComponentCategory.GUY_ANCHOR:
      geometry = <coneGeometry args={[0.2, 0.4, 16]} rotation={[Math.PI, 0, 0]} />;
      break;
    case ComponentCategory.GUY_WIRE:
      geometry = <cylinderGeometry args={[0.01, 0.01, 2, 8]} />;
      break;
    default:
      geometry = <sphereGeometry args={[0.2, 16, 16]} />;
  }
  
  return (
    <group 
      position={position} 
      rotation={rotation} 
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
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
      <mesh castShadow>
        {geometry}
        <meshStandardMaterial 
          color={color} 
          emissive={hovered || isSelected ? "#444444" : "#000000"}
          emissiveIntensity={hovered ? 0.5 : isSelected ? 0.3 : 0}
        />
      </mesh>
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#4285F4" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Component label */}
      <Html position={[0, 0.5, 0]} center>
        <div className={`px-2 py-1 rounded text-xs ${isSelected ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-800'} shadow-sm`}>
          {template.name}
        </div>
      </Html>
    </group>
  );
};

// Transform controls for selected component
const ComponentTransformControls: React.FC<{
  componentId: string;
  mode: 'translate' | 'rotate' | 'scale';
  enabled: boolean;
}> = ({ componentId, mode, enabled }) => {
  const activePoleDesign = useAppStore(state => state.getActivePoleDesign());
  const updateComponentPosition = useAppStore(state => state.updateComponentPosition);
  const updateComponentRotation = useAppStore(state => state.updateComponentRotation);
  const updateComponentScale = useAppStore(state => state.updateComponentScale);
  const getComponentTemplate = useAppStore(state => state.getComponentTemplate);
  
  if (!activePoleDesign || !enabled) return null;
  
  const component = activePoleDesign.components.find(c => c.id === componentId);
  if (!component) return null;
  
  // Get the template to check constraints
  const template = getComponentTemplate(component.templateId);
  if (!template) return null;
  
  // Check if this component can be transformed
  if (template.constraints.fixedPosition) return null;
  
  // For attached components, check movement restrictions
  if (component.attachedTo) {
    if (mode === 'translate' && !template.constraints.movementRestrictions.horizontal && 
        !template.constraints.movementRestrictions.vertical) {
      return null;
    }
    if (mode === 'rotate' && !template.constraints.movementRestrictions.rotation) {
      return null;
    }
  }
  
  const handleTransform = (e: THREE.Event) => {
    const object = e.target.object;
    
    if (mode === 'translate') {
      updateComponentPosition(componentId, [
        object.position.x,
        object.position.y,
        object.position.z
      ]);
    } else if (mode === 'rotate') {
      updateComponentRotation(componentId, [
        object.rotation.x,
        object.rotation.y,
        object.rotation.z
      ]);
    } else if (mode === 'scale') {
      updateComponentScale(componentId, [
        object.scale.x,
        object.scale.y,
        object.scale.z
      ]);
    }
  };
  
  return (
    <TransformControls
      object={new THREE.Object3D()} // This is a placeholder, the actual object is set by the position prop
      position={component.position}
      rotation={component.rotation}
      scale={component.scale}
      mode={mode}
      size={0.75}
      onObjectChange={handleTransform}
      showX={mode === 'translate' ? template.constraints.movementRestrictions.horizontal : true}
      showY={mode === 'translate' ? template.constraints.movementRestrictions.vertical : true}
      showZ={mode === 'translate' ? template.constraints.movementRestrictions.horizontal : true}
    />
  );
};

// Attachment lines between components
const AttachmentLines: React.FC = () => {
  const activePoleDesign = useAppStore(state => state.getActivePoleDesign());
  
  if (!activePoleDesign) return null;
  
  return (
    <>
      {activePoleDesign.components
        .filter(component => component.attachedTo)
        .map(component => {
          const attachedTo = activePoleDesign.components.find(c => c.id === component.attachedTo);
          if (!attachedTo) return null;
          
          return (
            <Line
              key={`${component.id}-${attachedTo.id}`}
              points={[
                new THREE.Vector3(...component.position),
                new THREE.Vector3(...attachedTo.position)
              ]}
              color="#3b82f6"
              lineWidth={1}
              dashed
              dashSize={0.2}
              dashScale={1}
              dashOffset={0}
            />
          );
        })}
    </>
  );
};

// Component placement preview
const PlacementPreview: React.FC<{
  templateId: string | null;
  position: [number, number, number];
}> = ({ templateId, position }) => {
  const getComponentTemplate = useAppStore(state => state.getComponentTemplate);
  
  if (!templateId) return null;
  
  const template = getComponentTemplate(templateId);
  if (!template) return null;
  
  // Determine color based on component category
  const color = categoryColors[template.category];
  
  // Determine geometry based on component category
  let geometry;
  
  switch (template.category) {
    case ComponentCategory.POLE:
      geometry = <cylinderGeometry args={[0.15, 0.2, 12, 16]} />;
      break;
    case ComponentCategory.CROSSARM:
      geometry = <boxGeometry args={[4, 0.2, 0.2]} />;
      break;
    case ComponentCategory.INSULATOR:
      geometry = <cylinderGeometry args={[0.08, 0.1, 0.3, 16]} />;
      break;
    case ComponentCategory.TRANSFORMER:
      geometry = <cylinderGeometry args={[0.4, 0.4, 0.8, 16]} />;
      break;
    case ComponentCategory.CONDUCTOR:
      geometry = <cylinderGeometry args={[0.03, 0.03, 2, 8]} rotation={[0, 0, Math.PI / 2]} />;
      break;
    case ComponentCategory.HARDWARE:
      geometry = <boxGeometry args={[0.1, 0.1, 0.1]} />;
      break;
    case ComponentCategory.GROUNDING:
      geometry = <cylinderGeometry args={[0.02, 0.02, 3, 8]} />;
      break;
    case ComponentCategory.GUY_ANCHOR:
      geometry = <coneGeometry args={[0.2, 0.4, 16]} rotation={[Math.PI, 0, 0]} />;
      break;
    case ComponentCategory.GUY_WIRE:
      geometry = <cylinderGeometry args={[0.01, 0.01, 2, 8]} />;
      break;
    default:
      geometry = <sphereGeometry args={[0.2, 16, 16]} />;
  }
  
  return (
    <mesh position={position} castShadow>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.5} 
        wireframe={true}
      />
    </mesh>
  );
};

// Ground plane with grid for component placement
const GroundPlane: React.FC<{
  onPlaneClick: (position: [number, number, number]) => void;
}> = ({ onPlaneClick }) => {
  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    
    // Get the hit point in world coordinates
    const hitPoint = e.point;
    
    // Round to nearest 0.5 unit for better grid alignment
    const x = Math.round(hitPoint.x * 2) / 2;
    const z = Math.round(hitPoint.z * 2) / 2;
    
    // Call the callback with the position
    onPlaneClick([x, 0, z]);
  };
  
  return (
    <>
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
      
      {/* Invisible plane for click detection */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
};

// Main 3D pole builder component
const PoleBuilder: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [showTransformControls, setShowTransformControls] = useState(true);
  const [placementPosition, setPlacementPosition] = useState<[number, number, number] | null>(null);
  
  // Get state from store
  const activePoleDesign = useAppStore(state => state.getActivePoleDesign());
  const selectedComponentId = useAppStore(state => state.selectedComponentId);
  const selectedTemplateId = useAppStore(state => state.selectedTemplateId);
  const selectComponent = useAppStore(state => state.selectComponent);
  const addComponentToDesign = useAppStore(state => state.addComponentToDesign);
  const removeComponentFromDesign = useAppStore(state => state.removeComponentFromDesign);
  const isAssembledView = useAppStore(state => state.isAssembledView);
  const toggleViewMode = useAppStore(state => state.toggleViewMode);
  
  // Handle camera reset
  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };
  
  // Handle component selection
  const handleSelectComponent = (componentId: string) => {
    selectComponent(componentId);
  };
  
  // Handle component deletion
  const handleDeleteComponent = () => {
    if (selectedComponentId) {
      removeComponentFromDesign(selectedComponentId);
    }
  };
  
  // Handle ground plane click for component placement
  const handlePlaneClick = (position: [number, number, number]) => {
    if (selectedTemplateId) {
      // Add the component at the clicked position
      addComponentToDesign(selectedTemplateId, position);
      setPlacementPosition(null);
    } else {
      // Deselect if no template is selected
      selectComponent(null);
    }
  };
  
  // Handle mouse move for placement preview
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedTemplateId) return;
    
    // Get the canvas element
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate normalized device coordinates
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);
    
    // Get the camera
    const camera = controlsRef.current?.object;
    if (!camera) return;
    
    // Set the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Create a plane at y=0 for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    // Calculate the intersection point
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    
    if (intersectionPoint) {
      // Round to nearest 0.5 unit for better grid alignment
      const x = Math.round(intersectionPoint.x * 2) / 2;
      const z = Math.round(intersectionPoint.z * 2) / 2;
      
      setPlacementPosition([x, 0, z]);
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
  
  return (
    <div className="relative w-full h-full">
      <Canvas 
        shadows 
        camera={{ position: [10, 10, 10], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        onClick={() => selectComponent(null)}
        onMouseMove={handleMouseMove}
      >
        <Suspense fallback={<Loader />}>
          <CameraController controlsRef={controlsRef} />
          
          {/* Lighting */}
          <SceneLighting />
          
          {/* Sky and environment */}
          <SkyAndEnvironment />
          
          {/* Ground plane with grid */}
          <GroundPlane onPlaneClick={handlePlaneClick} />
          
          {/* Attachment lines */}
          <AttachmentLines />
          
          {/* Components */}
          {activePoleDesign.components.map(component => (
            <SelectableComponent
              key={component.id}
              id={component.id}
              templateId={component.templateId}
              position={component.position}
              rotation={component.rotation}
              scale={component.scale}
              attachedTo={component.attachedTo}
              onSelect={handleSelectComponent}
              isSelected={component.id === selectedComponentId}
            />
          ))}
          
          {/* Transform controls for selected component */}
          {selectedComponentId && showTransformControls && (
            <ComponentTransformControls
              componentId={selectedComponentId}
              mode={transformMode}
              enabled={true}
            />
          )}
          
          {/* Placement preview */}
          {selectedTemplateId && placementPosition && (
            <PlacementPreview
              templateId={selectedTemplateId}
              position={placementPosition}
            />
          )}
        </Suspense>
      </Canvas>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={handleReset}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-slate-100"
          title="Reset Camera"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        
        <div className="h-px bg-slate-200 mx-1"></div>
        
        <button
          onClick={() => setTransformMode('translate')}
          className={`w-10 h-10 flex items-center justify-center rounded ${
            transformMode === 'translate' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100'
          }`}
          title="Move Tool"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 9l4-4 4 4"></path>
            <path d="M5 15l4 4 4-4"></path>
            <path d="M9 5v14"></path>
          </svg>
        </button>
        
        <button
          onClick={() => setTransformMode('rotate')}
          className={`w-10 h-10 flex items-center justify-center rounded ${
            transformMode === 'rotate' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100'
          }`}
          title="Rotate Tool"
        >
          <RotateCw className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => setTransformMode('scale')}
          className={`w-10 h-10 flex items-center justify-center rounded ${
            transformMode === 'scale' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100'
          }`}
          title="Scale Tool"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 3L3 21"></path>
            <path d="M21 21L3 3"></path>
          </svg>
        </button>
        
        <button
          onClick={() => setShowTransformControls(!showTransformControls)}
          className={`w-10 h-10 flex items-center justify-center rounded ${
            showTransformControls ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}
          title={showTransformControls ? "Hide Transform Controls" : "Show Transform Controls"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6"></path>
            <path d="M9 21H3v-6"></path>
            <path d="M21 3l-7 7"></path>
            <path d="M3 21l7-7"></path>
          </svg>
        </button>
        
        <div className="h-px bg-slate-200 mx-1"></div>
        
        <button
          onClick={toggleViewMode}
          className={`w-10 h-10 flex items-center justify-center rounded ${
            isAssembledView ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100'
          }`}
          title={isAssembledView ? "Switch to Exploded View" : "Switch to Assembled View"}
        >
          {isAssembledView ? (
            <Layers3 className="h-5 w-5" />
          ) : (
            <Layers className="h-5 w-5" />
          )}
        </button>
        
        {selectedComponentId && (
          <>
            <div className="h-px bg-slate-200 mx-1"></div>
            
            <button
              onClick={handleDeleteComponent}
              className="w-10 h-10 flex items-center justify-center rounded hover:bg-red-100 text-red-600"
              title="Delete Component"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-6 right-4 bg-white bg-opacity-90 px-4 py-3 rounded-md shadow-md max-w-xs">
        <h3 className="font-medium text-sm mb-1">3D Builder Instructions</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Select a component from the sidebar</li>
          <li>• Click on the ground to place it</li>
          <li>• Select existing components to modify them</li>
          <li>• Use transform tools to position, rotate, and scale</li>
          <li>• Components follow their attachment rules and movement limitations</li>
        </ul>
      </div>
      
      {/* View mode indicator */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-md shadow-md">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${isAssembledView ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
          <span className="font-medium">{isAssembledView ? '3D Assembled View' : '3D Exploded View'}</span>
        </div>
      </div>
    </div>
  );
};

export default PoleBuilder;