import React from 'react';
import { useAppStore } from '../store';
import { ComponentCategory } from '../types';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit, Save } from 'lucide-react';

const categoryLabels: Record<ComponentCategory, string> = {
  [ComponentCategory.POLE]: 'Poles',
  [ComponentCategory.CROSSARM]: 'Crossarms',
  [ComponentCategory.INSULATOR]: 'Insulators',
  [ComponentCategory.TRANSFORMER]: 'Transformers',
  [ComponentCategory.CONDUCTOR]: 'Conductors',
  [ComponentCategory.HARDWARE]: 'Hardware',
  [ComponentCategory.GROUNDING]: 'Grounding',
  [ComponentCategory.OTHER]: 'Other Components'
};

const categoryColors: Record<ComponentCategory, string> = {
  [ComponentCategory.POLE]: 'bg-amber-600',
  [ComponentCategory.CROSSARM]: 'bg-emerald-600',
  [ComponentCategory.INSULATOR]: 'bg-sky-600',
  [ComponentCategory.TRANSFORMER]: 'bg-purple-600',
  [ComponentCategory.CONDUCTOR]: 'bg-red-600',
  [ComponentCategory.HARDWARE]: 'bg-gray-600',
  [ComponentCategory.GROUNDING]: 'bg-green-600',
  [ComponentCategory.OTHER]: 'bg-blue-600'
};

const ViewerSidebar: React.FC = () => {
  const activeConfig = useAppStore(state => state.getActiveConfig());
  const selectComponent = useAppStore(state => state.selectComponent);
  const selectedComponentId = useAppStore(state => state.selectedComponentId);
  
  const [expandedCategories, setExpandedCategories] = React.useState<Set<ComponentCategory>>(
    new Set(Object.values(ComponentCategory))
  );
  
  const toggleCategory = (category: ComponentCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  // Group components by category
  const componentsByCategory = React.useMemo(() => {
    if (!activeConfig) return {};
    
    return activeConfig.components.reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = [];
      }
      acc[component.category].push(component);
      return acc;
    }, {} as Record<ComponentCategory, typeof activeConfig.components>);
  }, [activeConfig]);
  
  if (!activeConfig) return <div>No configuration loaded</div>;
  
  return (
    <div className="bg-slate-100 w-64 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Components</h2>
        
        {Object.entries(componentsByCategory).map(([category, components]) => (
          <div key={category} className="mb-2">
            <div 
              className="flex items-center p-2 bg-white rounded cursor-pointer hover:bg-slate-200"
              onClick={() => toggleCategory(category as ComponentCategory)}
            >
              {expandedCategories.has(category as ComponentCategory) ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              <span className="font-medium">{categoryLabels[category as ComponentCategory]}</span>
              <span className="ml-auto text-xs text-slate-500">{components.length}</span>
            </div>
            
            {expandedCategories.has(category as ComponentCategory) && (
              <div className="ml-4 mt-1 space-y-1">
                {components.map(component => (
                  <div 
                    key={component.id}
                    className={`flex items-center p-2 rounded cursor-pointer ${
                      selectedComponentId === component.id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-slate-200'
                    }`}
                    onClick={() => selectComponent(component.id)}
                  >
                    <div className={`h-3 w-3 rounded-full mr-2 ${categoryColors[component.category]}`} />
                    <span className="text-sm">{component.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BuilderSidebar: React.FC = () => {
  const componentTemplates = useAppStore(state => state.componentTemplates);
  const selectTemplate = useAppStore(state => state.selectTemplate);
  const selectedTemplateId = useAppStore(state => state.selectedTemplateId);
  const poleDesigns = useAppStore(state => state.poleDesigns);
  const activePoleDesignId = useAppStore(state => state.activePoleDesignId);
  const setActivePoleDesign = useAppStore(state => state.setActivePoleDesign);
  const createNewDesign = useAppStore(state => state.createNewDesign);
  const updateDesign = useAppStore(state => state.updateDesign);
  
  const [expandedCategories, setExpandedCategories] = React.useState<Set<ComponentCategory>>(
    new Set(Object.values(ComponentCategory))
  );
  
  const [isEditingDesign, setIsEditingDesign] = React.useState(false);
  const [designName, setDesignName] = React.useState('');
  const [designDescription, setDesignDescription] = React.useState('');
  
  // Group templates by category
  const templatesByCategory = React.useMemo(() => {
    return componentTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<ComponentCategory, typeof componentTemplates>);
  }, [componentTemplates]);
  
  const toggleCategory = (category: ComponentCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  const handleEditDesign = () => {
    const activeDesign = poleDesigns.find(d => d.id === activePoleDesignId);
    if (activeDesign) {
      setDesignName(activeDesign.name);
      setDesignDescription(activeDesign.description);
      setIsEditingDesign(true);
    }
  };
  
  const handleSaveDesign = () => {
    updateDesign({
      name: designName,
      description: designDescription
    });
    setIsEditingDesign(false);
  };
  
  return (
    <div className="bg-slate-100 w-64 h-full overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">My Designs</h2>
            <button
              onClick={createNewDesign}
              className="p-1 rounded-full hover:bg-slate-200"
              title="Create New Design"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {isEditingDesign ? (
            <div className="bg-white p-3 rounded-md shadow-sm mb-3">
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="w-full mb-2 px-2 py-1 border rounded"
                placeholder="Design name"
              />
              <textarea
                value={designDescription}
                onChange={(e) => setDesignDescription(e.target.value)}
                className="w-full mb-2 px-2 py-1 border rounded"
                placeholder="Description"
                rows={2}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditingDesign(false)}
                  className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDesign}
                  className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {poleDesigns.map(design => (
                <div 
                  key={design.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    activePoleDesignId === design.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-white hover:bg-slate-200'
                  }`}
                  onClick={() => setActivePoleDesign(design.id)}
                >
                  <div className="flex-1 truncate">
                    <div className="font-medium">{design.name}</div>
                    <div className="text-xs text-gray-500 truncate">{design.description}</div>
                  </div>
                  {activePoleDesignId === design.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDesign();
                      }}
                      className="p-1 rounded-full hover:bg-slate-300"
                      title="Edit Design"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <h2 className="text-lg font-semibold mb-2">Component Library</h2>
        <p className="text-sm text-gray-600 mb-4">Drag components to the canvas to build your pole</p>
        
        {Object.entries(templatesByCategory).map(([category, templates]) => (
          <div key={category} className="mb-2">
            <div 
              className="flex items-center p-2 bg-white rounded cursor-pointer hover:bg-slate-200"
              onClick={() => toggleCategory(category as ComponentCategory)}
            >
              {expandedCategories.has(category as ComponentCategory) ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              <span className="font-medium">{categoryLabels[category as ComponentCategory]}</span>
              <span className="ml-auto text-xs text-slate-500">{templates.length}</span>
            </div>
            
            {expandedCategories.has(category as ComponentCategory) && (
              <div className="ml-4 mt-1 grid grid-cols-1 gap-2">
                {templates.map(template => (
                  <div 
                    key={template.id}
                    className={`p-2 rounded cursor-pointer ${
                      selectedTemplateId === template.id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-white hover:bg-slate-200'
                    }`}
                    onClick={() => selectTemplate(template.id)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify({
                        templateId: template.id
                      }));
                      selectTemplate(template.id);
                    }}
                  >
                    <div className="flex items-center mb-1">
                      <div className={`h-3 w-3 rounded-full mr-2 ${categoryColors[template.category]}`} />
                      <span className="text-sm font-medium">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{template.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const isBuilderMode = useAppStore(state => state.isBuilderMode);
  
  return isBuilderMode ? <BuilderSidebar /> : <ViewerSidebar />;
};

export default Sidebar;