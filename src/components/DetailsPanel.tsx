import React from 'react';
import { useAppStore } from '../store';
import { X, ExternalLink, FileText, AlertTriangle, Tag, List, Info, Wrench, Sliders, RotateCw, Maximize, Link, Link2Off } from 'lucide-react';
import { ComponentCategory, AttachmentPoint } from '../types';

const categoryColors: Record<ComponentCategory, string> = {
  [ComponentCategory.POLE]: 'bg-amber-600',
  [ComponentCategory.CROSSARM]: 'bg-emerald-600',
  [ComponentCategory.INSULATOR]: 'bg-sky-600',
  [ComponentCategory.TRANSFORMER]: 'bg-purple-600',
  [ComponentCategory.CONDUCTOR]: 'bg-red-600',
  [ComponentCategory.HARDWARE]: 'bg-gray-600',
  [ComponentCategory.GROUNDING]: 'bg-green-600',
  [ComponentCategory.GUY_ANCHOR]: 'bg-orange-600',
  [ComponentCategory.GUY_WIRE]: 'bg-yellow-600',
  [ComponentCategory.OTHER]: 'bg-blue-600'
};

const ViewerDetailsPanel: React.FC = () => {
  const isOpen = useAppStore(state => state.isDetailsPanelOpen);
  const selectedComponent = useAppStore(state => state.getSelectedComponent());
  const activeConfig = useAppStore(state => state.getActiveConfig());
  const togglePanel = useAppStore(state => state.toggleDetailsPanel);
  const selectComponent = useAppStore(state => state.selectComponent);
  
  const [showConfigInfo, setShowConfigInfo] = React.useState(false);
  
  const handleClose = () => {
    togglePanel();
    selectComponent(null);
  };
  
  if (!isOpen) return null;
  
  if (showConfigInfo && activeConfig) {
    return (
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-10 overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold">Configuration Details</h2>
            <div className="flex items-center">
              <button 
                onClick={() => setShowConfigInfo(false)}
                className="p-1 rounded hover:bg-slate-200 mr-2"
                title="Back to component"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold">{activeConfig.name}</h3>
            {activeConfig.macroCode && (
              <div className="mt-1 text-sm font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                Macro Code: {activeConfig.macroCode}
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-slate-600">{activeConfig.description}</p>
          </div>
          
          <div className="space-y-6">
            {activeConfig.specReference && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Spec Reference
                  </div>
                </h4>
                <p className="bg-blue-50 p-3 rounded text-blue-800 font-medium">
                  {activeConfig.specReference}
                </p>
              </div>
            )}
            
            {activeConfig.notes && activeConfig.notes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Notes
                  </div>
                </h4>
                <ul className="list-disc pl-5 space-y-1">
                  {activeConfig.notes.map((note, index) => (
                    <li key={index} className="text-slate-700">{note}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeConfig.materialList && activeConfig.materialList.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                  <div className="flex items-center">
                    <List className="h-4 w-4 mr-1" />
                    Material List
                  </div>
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 uppercase">Qty</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 uppercase">Stock #</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeConfig.materialList.map((material, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2 px-3 text-sm">{material.item}</td>
                          <td className="py-2 px-3 text-sm">{material.quantity}</td>
                          <td className="py-2 px-3 text-sm">{material.description}</td>
                          <td className="py-2 px-3 text-sm font-mono">{material.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Components</h4>
              <div className="space-y-2">
                {activeConfig.components.map((component) => (
                  <div 
                    key={component.id}
                    className="flex items-center p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100"
                    onClick={() => {
                      selectComponent(component.id);
                      setShowConfigInfo(false);
                    }}
                  >
                    <div className={`h-3 w-3 rounded-full mr-2 ${categoryColors[component.category]}`} />
                    <span>{component.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!selectedComponent) {
    return (
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-10 overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold">Details</h2>
            <button 
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-slate-500">Select a component to view details</p>
          
          {activeConfig && (
            <button
              onClick={() => setShowConfigInfo(true)}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              View Configuration Details
            </button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-10 overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 border-b">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-semibold">Component Details</h2>
          <div className="flex items-center">
            {activeConfig && (
              <button 
                onClick={() => setShowConfigInfo(true)}
                className="p-1 rounded hover:bg-slate-200 mr-2"
                title="View configuration details"
              >
                <Info className="h-5 w-5" />
              </button>
            )}
            <button 
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`h-4 w-4 rounded-full mr-2 ${categoryColors[selectedComponent.category]}`} />
          <h3 className="text-2xl font-bold">{selectedComponent.name}</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-600">{selectedComponent.description}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">Purpose</h4>
            <p>{selectedComponent.purpose}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Spec Book Reference
              </div>
            </h4>
            <p className="bg-blue-50 p-3 rounded text-blue-800 font-medium">
              {selectedComponent.specBookReference}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                CU Number
              </div>
            </h4>
            <p className="bg-purple-50 p-3 rounded text-purple-800 font-medium">
              {selectedComponent.cuNumber}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Edge Cases
              </div>
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {selectedComponent.edgeCases.map((edgeCase, index) => (
                <li key={index} className="text-slate-700">{edgeCase}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2">
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                Katapult Examples
              </div>
            </h4>
            <ul className="space-y-2">
              {selectedComponent.katapultExamples.map((example, index) => (
                <li key={index}>
                  <a 
                    href={example} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    Example {index + 1}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuilderDetailsPanel: React.FC = () => {
  const isOpen = useAppStore(state => state.isDetailsPanelOpen);
  const selectedComponentId = useAppStore(state => state.selectedComponentId);
  const activePoleDesign = useAppStore(state => state.getActivePoleDesign());
  const togglePanel = useAppStore(state => state.toggleDetailsPanel);
  const selectComponent = useAppStore(state => state.selectComponent);
  const getComponentTemplate = useAppStore(state => state.getComponentTemplate);
  const updateComponentPosition = useAppStore(state => state.updateComponentPosition);
  const updateComponentRotation = useAppStore(state => state.updateComponentRotation);
  const updateComponentScale = useAppStore(state => state.updateComponentScale);
  const updateComponentAttachment = useAppStore(state => state.updateComponentAttachment);
  const getValidAttachmentPoints = useAppStore(state => state.getValidAttachmentPoints);
  
  const handleClose = () => {
    togglePanel();
    selectComponent(null);
  };
  
  if (!isOpen) return null;
  
  // Get the selected component from the design
  const selectedComponent = activePoleDesign?.components.find(c => c.id === selectedComponentId);
  
  if (!selectedComponent) {
    return (
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-10 overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold">Component Properties</h2>
            <button 
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-slate-500">Select a component to view and edit properties</p>
        </div>
      </div>
    );
  }
  
  // Get the template for this component
  const template = getComponentTemplate(selectedComponent.templateId);
  
  if (!template) {
    return (
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-10 overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold">Component Properties</h2>
            <button 
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <p className="text-slate-500">Template not found for this component</p>
        </div>
      </div>
    );
  }
  
  // Get valid attachment points for this component
  const validAttachmentPoints = getValidAttachmentPoints(selectedComponent.id);
  
  // Handle position changes
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition: [number, number, number] = [...selectedComponent.position];
    
    switch (axis) {
      case 'x':
        newPosition[0] = value;
        break;
      case 'y':
        newPosition[1] = value;
        break;
      case 'z':
        newPosition[2] = value;
        break;
    }
    
    updateComponentPosition(selectedComponent.id, newPosition);
  };
  
  // Handle rotation changes
  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newRotation: [number, number, number] = [...selectedComponent.rotation];
    
    switch (axis) {
      case 'x':
        newRotation[0] = value * Math.PI / 180; // Convert to radians
        break;
      case 'y':
        newRotation[1] = value * Math.PI / 180;
        break;
      case 'z':
        newRotation[2] = value * Math.PI / 180;
        break;
    }
    
    updateComponentRotation(selectedComponent.id, newRotation);
  };
  
  // Handle scale changes
  const handleScaleChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newScale: [number, number, number] = [...selectedComponent.scale];
    
    switch (axis) {
      case 'x':
        newScale[0] = value;
        break;
      case 'y':
        newScale[1] = value;
        break;
      case 'z':
        newScale[2] = value;
        break;
    }
    
    updateComponentScale(selectedComponent.id, newScale);
  };
  
  // Handle attachment changes
  const handleAttachmentChange = (attachedToId: string | undefined) => {
    updateComponentAttachment(selectedComponent.id, attachedToId);
  };
  
  // Get the name of the component this is attached to
  const getAttachedToName = () => {
    if (!selectedComponent.attachedTo || !activePoleDesign) return "None";
    
    const attachedTo = activePoleDesign.components.find(c => c.id === selectedComponent.attachedTo);
    if (!attachedTo) return "None";
    
    const attachedTemplate = getComponentTemplate(attachedTo.templateId);
    return attachedTemplate ? attachedTemplate.name : "Unknown";
  };
  
  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-lg z-10 overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 border-b">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-semibold">Component Properties</h2>
          <button 
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`h-4 w-4 rounded-full mr-2 ${categoryColors[template.category]}`} />
          <h3 className="text-xl font-bold">{template.name}</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-600">{template.description}</p>
        </div>
        
        <div className="space-y-6">
          {/* Attachment Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center">
              <Link className="h-4 w-4 mr-1" />
              Attachment
            </h4>
            
            <div className="bg-slate-50 p-3 rounded-md mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Currently attached to:</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {getAttachedToName()}
                </span>
              </div>
            </div>
            
            {validAttachmentPoints.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach to:
                </label>
                <select
                  value={selectedComponent.attachedTo || ""}
                  onChange={(e) => handleAttachmentChange(e.target.value || undefined)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Detach)</option>
                  {validAttachmentPoints.map(point => (
                    <option key={point.id} value={point.id}>
                      {point.name} ({point.category})
                    </option>
                  ))}
                </select>
                
                {selectedComponent.attachedTo && (
                  <button
                    onClick={() => handleAttachmentChange(undefined)}
                    className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Link2Off className="h-3.5 w-3.5 mr-1" />
                    Detach component
                  </button>
                )}
              </div>
            )}
            
            {validAttachmentPoints.length === 0 && !selectedComponent.attachedTo && (
              <p className="text-sm text-gray-500">
                This component cannot be attached to any other components in the current design.
              </p>
            )}
            
            {/* Component constraints info */}
            <div className="mt-3 text-xs text-gray-500">
              <p className="font-medium mb-1">Attachment constraints:</p>
              <ul className="list-disc pl-4 space-y-1">
                {template.constraints.attachesTo.map(point => (
                  <li key={point}>Can attach to: {point}</li>
                ))}
                {template.constraints.fixedPosition && (
                  <li>Fixed position (cannot be moved)</li>
                )}
                {template.constraints.minHeight !== undefined && (
                  <li>Minimum height: {template.constraints.minHeight} units</li>
                )}
                {template.constraints.maxHeight !== undefined && (
                  <li>Maximum height: {template.constraints.maxHeight} units</li>
                )}
                {template.constraints.minDistance !== undefined && (
                  <li>Minimum distance: {template.constraints.minDistance} units</li>
                )}
                {template.constraints.maxDistance !== undefined && (
                  <li>Maximum distance: {template.constraints.maxDistance} units</li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Position Section - only show if not fixed position */}
          {!template.constraints.fixedPosition && (
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center">
                <Sliders className="h-4 w-4 mr-1" />
                Position
              </h4>
              
              <div className="space-y-3">
                {/* X Position - only show if horizontal movement allowed */}
                {(!selectedComponent.attachedTo || template.constraints.movementRestrictions.horizontal) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={selectedComponent.position[0]}
                      onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>-10</span>
                      <span>{selectedComponent.position[0]}</span>
                      <span>10</span>
                    </div>
                  </div>
                )}
                
                {/* Y Position - only show if vertical movement allowed */}
                {(!selectedComponent.attachedTo || template.constraints.movementRestrictions.vertical) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={selectedComponent.position[1]}
                      onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>{selectedComponent.position[1]}</span>
                      <span>20</span>
                    </div>
                  </div>
                )}
                
                {/* Z Position - only show if horizontal movement allowed */}
                {(!selectedComponent.attachedTo || template.constraints.movementRestrictions.horizontal) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Z Position</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={selectedComponent.position[2]}
                      onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>-10</span>
                      <span>{selectedComponent.position[2]}</span>
                      <span>10</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Rotation Section - only show if rotation allowed */}
          {template.constraints.movementRestrictions.rotation && (
            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center">
                <RotateCw className="h-4 w-4 mr-1" />
                Rotation (degrees)
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Y Rotation</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={Math.round(selectedComponent.rotation[1] * 180 / Math.PI)}
                    onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0°</span>
                    <span>{Math.round(selectedComponent.rotation[1] * 180 / Math.PI)}°</span>
                    <span>360°</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scale Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center">
              <Maximize className="h-4 w-4 mr-1" />
              Scale
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overall Scale</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={selectedComponent.scale[0]}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    handleScaleChange('x', value);
                    handleScaleChange('y', value);
                    handleScaleChange('z', value);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.5</span>
                  <span>{selectedComponent.scale[0].toFixed(1)}</span>
                  <span>1.5</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Movement Restrictions Info */}
          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
            <h5 className="font-medium mb-1">Movement Restrictions:</h5>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              {template.constraints.movementRestrictions.vertical && (
                <li>Can move vertically (up/down)</li>
              )}
              {template.constraints.movementRestrictions.horizontal && (
                <li>Can move horizontally</li>
              )}
              {template.constraints.movementRestrictions.rotation && (
                <li>Can rotate around pole axis</li>
              )}
              {template.constraints.movementRestrictions.offset && (
                <li>Can be offset from attachment point</li>
              )}
              {template.constraints.fixedPosition && (
                <li>Fixed position (cannot be moved)</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsPanel: React.FC = () => {
  const isBuilderMode = useAppStore(state => state.isBuilderMode);
  
  return isBuilderMode ? <BuilderDetailsPanel /> : <ViewerDetailsPanel />;
};

export default DetailsPanel;