import { create } from 'zustand';
import { ComponentSpec, Configuration, PoleDesign, ComponentTemplate, ComponentCategory, AttachmentPoint } from '../types';
import { mockConfiguration } from '../data/mockData';
import { componentTemplates } from '../data/componentTemplates';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  configurations: Configuration[];
  activeConfigId: string | null;
  selectedComponentId: string | null;
  isDetailsPanelOpen: boolean;
  isAssembledView: boolean;
  
  // Pole Builder
  componentTemplates: ComponentTemplate[];
  poleDesigns: PoleDesign[];
  activePoleDesignId: string | null;
  selectedTemplateId: string | null;
  isBuilderMode: boolean;
  
  // Actions
  setActiveConfig: (configId: string) => void;
  selectComponent: (componentId: string | null) => void;
  toggleDetailsPanel: () => void;
  toggleViewMode: () => void;
  
  // Builder Actions
  toggleBuilderMode: () => void;
  selectTemplate: (templateId: string | null) => void;
  createNewDesign: () => void;
  updateDesign: (design: Partial<PoleDesign>) => void;
  addComponentToDesign: (templateId: string, position: [number, number, number], attachedToId?: string) => void;
  removeComponentFromDesign: (componentId: string) => void;
  updateComponentPosition: (componentId: string, position: [number, number, number]) => void;
  updateComponentRotation: (componentId: string, rotation: [number, number, number]) => void;
  updateComponentScale: (componentId: string, scale: [number, number, number]) => void;
  updateComponentAttachment: (componentId: string, attachedToId: string | undefined) => void;
  setActivePoleDesign: (designId: string) => void;
  deleteDesign: (designId: string) => void;
  duplicateDesign: (designId: string) => void;
  
  // Computed
  getActiveConfig: () => Configuration | undefined;
  getSelectedComponent: () => ComponentSpec | undefined;
  getActivePoleDesign: () => PoleDesign | undefined;
  getComponentTemplate: (templateId: string) => ComponentTemplate | undefined;
  getValidAttachmentPoints: (componentId: string) => { id: string; name: string; category: ComponentCategory }[];
  validateComponentPosition: (componentId: string, position: [number, number, number]) => [number, number, number];
}

// Create a default pole design
const defaultPoleDesign: PoleDesign = {
  id: uuidv4(),
  name: 'New Pole Design',
  description: 'A custom pole design',
  components: [
    {
      id: uuidv4(),
      templateId: 'pole-template-1',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const useAppStore = create<AppState>((set, get) => ({
  configurations: [mockConfiguration],
  activeConfigId: mockConfiguration.id,
  selectedComponentId: null,
  isDetailsPanelOpen: false,
  isAssembledView: false,
  
  // Pole Builder
  componentTemplates,
  poleDesigns: [defaultPoleDesign],
  activePoleDesignId: defaultPoleDesign.id,
  selectedTemplateId: null,
  isBuilderMode: false,
  
  setActiveConfig: (configId) => set({ activeConfigId: configId }),
  
  selectComponent: (componentId) => {
    set({ 
      selectedComponentId: componentId,
      isDetailsPanelOpen: componentId !== null
    });
  },
  
  toggleDetailsPanel: () => set(state => ({ 
    isDetailsPanelOpen: !state.isDetailsPanelOpen 
  })),
  
  toggleViewMode: () => set(state => ({
    isAssembledView: !state.isAssembledView
  })),
  
  // Builder Actions
  toggleBuilderMode: () => set(state => ({
    isBuilderMode: !state.isBuilderMode,
    // Reset selection when toggling modes
    selectedComponentId: null,
    selectedTemplateId: null
  })),
  
  selectTemplate: (templateId) => set({
    selectedTemplateId: templateId
  }),
  
  createNewDesign: () => {
    const newDesign: PoleDesign = {
      id: uuidv4(),
      name: 'New Pole Design',
      description: 'A custom pole design',
      components: [
        {
          id: uuidv4(),
          templateId: 'pole-template-1',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set(state => ({
      poleDesigns: [...state.poleDesigns, newDesign],
      activePoleDesignId: newDesign.id
    }));
  },
  
  updateDesign: (designUpdate) => {
    const { activePoleDesignId, poleDesigns } = get();
    if (!activePoleDesignId) return;
    
    set({
      poleDesigns: poleDesigns.map(design => 
        design.id === activePoleDesignId 
          ? { 
              ...design, 
              ...designUpdate, 
              updatedAt: new Date().toISOString() 
            } 
          : design
      )
    });
  },
  
  addComponentToDesign: (templateId, position, attachedToId) => {
    const { activePoleDesignId, poleDesigns, componentTemplates, validateComponentPosition } = get();
    if (!activePoleDesignId) return;
    
    const template = componentTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const newComponentId = uuidv4();
    
    // Validate and adjust position based on constraints
    const validatedPosition = validateComponentPosition(
      newComponentId, 
      position, 
      templateId, 
      attachedToId
    );
    
    const newComponent = {
      id: newComponentId,
      templateId,
      position: validatedPosition,
      rotation: template.defaultRotation || [0, 0, 0],
      scale: template.defaultScale || [1, 1, 1],
      attachedTo: attachedToId
    };
    
    set({
      poleDesigns: poleDesigns.map(design => 
        design.id === activePoleDesignId 
          ? { 
              ...design, 
              components: [...design.components, newComponent],
              updatedAt: new Date().toISOString() 
            } 
          : design
      ),
      selectedComponentId: newComponentId
    });
  },
  
  removeComponentFromDesign: (componentId) => {
    const { activePoleDesignId, poleDesigns } = get();
    if (!activePoleDesignId) return;
    
    // Get the active design
    const activeDesign = poleDesigns.find(d => d.id === activePoleDesignId);
    if (!activeDesign) return;
    
    // Check if any components are attached to this one
    const attachedComponents = activeDesign.components.filter(
      c => c.attachedTo === componentId
    );
    
    // If this is a pole, don't allow deletion if it's the only pole
    const componentToRemove = activeDesign.components.find(c => c.id === componentId);
    if (componentToRemove) {
      const template = get().getComponentTemplate(componentToRemove.templateId);
      if (template?.category === ComponentCategory.POLE) {
        const poleComponents = activeDesign.components.filter(c => {
          const t = get().getComponentTemplate(c.templateId);
          return t?.category === ComponentCategory.POLE;
        });
        
        if (poleComponents.length <= 1) {
          alert("Cannot remove the only pole in the design.");
          return;
        }
      }
    }
    
    // If components are attached to this one, either delete them too or detach them
    if (attachedComponents.length > 0) {
      const shouldDeleteAttached = window.confirm(
        `This component has ${attachedComponents.length} attached component(s). Delete them as well?`
      );
      
      if (shouldDeleteAttached) {
        // Get all IDs to delete (including nested attachments)
        const getAllAttachedIds = (id: string, components: PoleDesign['components']): string[] => {
          const directlyAttached = components.filter(c => c.attachedTo === id).map(c => c.id);
          const nestedAttached = directlyAttached.flatMap(attachedId => 
            getAllAttachedIds(attachedId, components)
          );
          return [...directlyAttached, ...nestedAttached];
        };
        
        const idsToDelete = [componentId, ...getAllAttachedIds(componentId, activeDesign.components)];
        
        set({
          poleDesigns: poleDesigns.map(design => 
            design.id === activePoleDesignId 
              ? { 
                  ...design, 
                  components: design.components.filter(c => !idsToDelete.includes(c.id)),
                  updatedAt: new Date().toISOString() 
                } 
              : design
          ),
          selectedComponentId: null
        });
      } else {
        // Just detach the components
        set({
          poleDesigns: poleDesigns.map(design => 
            design.id === activePoleDesignId 
              ? { 
                  ...design, 
                  components: design.components.map(c => 
                    c.attachedTo === componentId 
                      ? { ...c, attachedTo: undefined } 
                      : c
                  ).filter(c => c.id !== componentId),
                  updatedAt: new Date().toISOString() 
                } 
              : design
          ),
          selectedComponentId: null
        });
      }
    } else {
      // No attached components, just remove this one
      set({
        poleDesigns: poleDesigns.map(design => 
          design.id === activePoleDesignId 
            ? { 
                ...design, 
                components: design.components.filter(c => c.id !== componentId),
                updatedAt: new Date().toISOString() 
              } 
            : design
        ),
        selectedComponentId: null
      });
    }
  },
  
  updateComponentPosition: (componentId, position) => {
    const { activePoleDesignId, poleDesigns, validateComponentPosition } = get();
    if (!activePoleDesignId) return;
    
    // Get the active design
    const activeDesign = poleDesigns.find(d => d.id === activePoleDesignId);
    if (!activeDesign) return;
    
    // Find the component
    const component = activeDesign.components.find(c => c.id === componentId);
    if (!component) return;
    
    // Validate and adjust position based on constraints
    const validatedPosition = validateComponentPosition(
      componentId, 
      position, 
      component.templateId, 
      component.attachedTo
    );
    
    // Update the component position
    set({
      poleDesigns: poleDesigns.map(design => 
        design.id === activePoleDesignId 
          ? { 
              ...design, 
              components: design.components.map(c => 
                c.id === componentId 
                  ? { ...c, position: validatedPosition } 
                  : c
              ),
              updatedAt: new Date().toISOString() 
            } 
          : design
      )
    });
    
    // Update positions of attached components
    const updateAttachedPositions = (parentId: string, parentPosition: [number, number, number]) => {
      const design = get().poleDesigns.find(d => d.id === get().activePoleDesignId);
      if (!design) return;
      
      const attachedComponents = design.components.filter(c => c.attachedTo === parentId);
      
      if (attachedComponents.length === 0) return;
      
      // For each attached component, update its position relative to the parent
      attachedComponents.forEach(attached => {
        const template = get().getComponentTemplate(attached.templateId);
        if (!template) return;
        
        // Calculate new position based on attachment type and constraints
        let newPosition: [number, number, number] = [...attached.position];
        
        // Adjust based on parent movement
        const offsetX = parentPosition[0] - component.position[0];
        const offsetY = parentPosition[1] - component.position[1];
        const offsetZ = parentPosition[2] - component.position[2];
        
        // Apply offsets based on constraints
        if (template.constraints.movementRestrictions.vertical) {
          newPosition[1] += offsetY;
        }
        
        if (template.constraints.movementRestrictions.horizontal) {
          newPosition[0] += offsetX;
          newPosition[2] += offsetZ;
        }
        
        // Validate the new position
        const validPos = get().validateComponentPosition(
          attached.id, 
          newPosition, 
          attached.templateId, 
          attached.attachedTo
        );
        
        // Update this component's position
        set({
          poleDesigns: get().poleDesigns.map(d => 
            d.id === get().activePoleDesignId 
              ? { 
                  ...d, 
                  components: d.components.map(c => 
                    c.id === attached.id 
                      ? { ...c, position: validPos } 
                      : c
                  )
                } 
              : d
          )
        });
        
        // Recursively update components attached to this one
        updateAttachedPositions(attached.id, validPos);
      });
    };
    
    // Start the recursive update
    updateAttachedPositions(componentId, validatedPosition);
  },
  
  updateComponentRotation: (componentId, rotation) => {
    const { activePoleDesignId, poleDesigns } = get();
    if (!activePoleDesignId) return;
    
    // Get the active design
    const activeDesign = poleDesigns.find(d => d.id === activePoleDesignId);
    if (!activeDesign) return;
    
    // Find the component
    const component = activeDesign.components.find(c => c.id === componentId);
    if (!component) return;
    
    // Get the template to check constraints
    const template = get().getComponentTemplate(component.templateId);
    if (!template) return;
    
    // Check if rotation is allowed
    if (!template.constraints.movementRestrictions.rotation) {
      console.warn("Rotation not allowed for this component type");
      return;
    }
    
    // Update the component rotation
    set({
      poleDesigns: poleDesigns.map(design => 
        design.id === activePoleDesignId 
          ? { 
              ...design, 
              components: design.components.map(c => 
                c.id === componentId 
                  ? { ...c, rotation } 
                  : c
              ),
              updatedAt: new Date().toISOString() 
            } 
          : design
      )
    });
    
    // Update rotations of attached components if needed
    const updateAttachedRotations = (parentId: string, parentRotation: [number, number, number]) => {
      const design = get().poleDesigns.find(d => d.id === get().activePoleDesignId);
      if (!design) return;
      
      const attachedComponents = design.components.filter(c => c.attachedTo === parentId);
      
      if (attachedComponents.length === 0) return;
      
      // For each attached component, update its rotation relative to the parent if needed
      attachedComponents.forEach(attached => {
        const template = get().getComponentTemplate(attached.templateId);
        if (!template || !template.constraints.movementRestrictions.rotation) return;
        
        // For components that should rotate with their parent
        const newRotation: [number, number, number] = [
          attached.rotation[0],
          parentRotation[1], // Only sync Y rotation (around vertical axis)
          attached.rotation[2]
        ];
        
        // Update this component's rotation
        set({
          poleDesigns: get().poleDesigns.map(d => 
            d.id === get().activePoleDesignId 
              ? { 
                  ...d, 
                  components: d.components.map(c => 
                    c.id === attached.id 
                      ? { ...c, rotation: newRotation } 
                      : c
                  )
                } 
              : d
          )
        });
        
        // Recursively update components attached to this one
        updateAttachedRotations(attached.id, newRotation);
      });
    };
    
    // Start the recursive update
    updateAttachedRotations(componentId, rotation);
  },
  
  updateComponentScale: (componentId, scale) => {
    const { activePoleDesignId, poleDesigns } = get();
    if (!activePoleDesignId) return;
    
    set({
      poleDesigns: poleDesigns.map(design => 
        design.id === activePoleDesignId 
          ? { 
              ...design, 
              components: design.components.map(c => 
                c.id === componentId 
                  ? { ...c, scale } 
                  : c
              ),
              updatedAt: new Date().toISOString() 
            } 
          : design
      )
    });
  },
  
  updateComponentAttachment: (componentId, attachedToId) => {
    const { activePoleDesignId, poleDesigns, validateComponentPosition } = get();
    if (!activePoleDesignId) return;
    
    // Get the active design
    const activeDesign = poleDesigns.find(d => d.id === activePoleDesignId);
    if (!activeDesign) return;
    
    // Find the component
    const component = activeDesign.components.find(c => c.id === componentId);
    if (!component) return;
    
    // If attaching to a new component, adjust position
    let newPosition = [...component.position] as [number, number, number];
    
    if (attachedToId) {
      const attachTo = activeDesign.components.find(c => c.id === attachedToId);
      if (attachTo) {
        // Adjust position based on what we're attaching to
        const template = get().getComponentTemplate(component.templateId);
        const attachToTemplate = get().getComponentTemplate(attachTo.templateId);
        
        if (template && attachToTemplate) {
          // Different positioning logic based on component types
          if (attachToTemplate.category === ComponentCategory.POLE) {
            // Attaching to pole - position at same X/Z, adjust Y based on component type
            newPosition = [
              attachTo.position[0],
              template.category === ComponentCategory.CROSSARM ? 10 : 8,
              attachTo.position[2]
            ];
          } else if (attachToTemplate.category === ComponentCategory.CROSSARM) {
            // Attaching to crossarm - position at ends or middle based on component type
            if (template.category === ComponentCategory.INSULATOR) {
              // Insulators go at the ends of crossarms
              newPosition = [
                attachTo.position[0] + (Math.random() > 0.5 ? 1.8 : -1.8),
                attachTo.position[1],
                attachTo.position[2]
              ];
            } else {
              // Other components go in the middle
              newPosition = [...attachTo.position];
            }
          }
        }
      }
    }
    
    // Validate the new position
    const validatedPosition = validateComponentPosition(
      componentId, 
      newPosition, 
      component.templateId, 
      attachedToId
    );
    
    // Update the component
    set({
      poleDesigns: poleDesigns.map(design => 
        design.id === activePoleDesignId 
          ? { 
              ...design, 
              components: design.components.map(c => 
                c.id === componentId 
                  ? { 
                      ...c, 
                      attachedTo: attachedToId,
                      position: validatedPosition
                    } 
                  : c
              ),
              updatedAt: new Date().toISOString() 
            } 
          : design
      )
    });
  },
  
  setActivePoleDesign: (designId) => set({
    activePoleDesignId: designId
  }),
  
  deleteDesign: (designId) => {
    const { poleDesigns, activePoleDesignId } = get();
    
    // Don't delete if it's the only design
    if (poleDesigns.length <= 1) return;
    
    // Update active design if we're deleting the active one
    let newActiveId = activePoleDesignId;
    if (activePoleDesignId === designId) {
      const otherDesign = poleDesigns.find(d => d.id !== designId);
      newActiveId = otherDesign ? otherDesign.id : null;
    }
    
    set({
      poleDesigns: poleDesigns.filter(design => design.id !== designId),
      activePoleDesignId: newActiveId
    });
  },
  
  duplicateDesign: (designId) => {
    const { poleDesigns } = get();
    const designToDuplicate = poleDesigns.find(design => design.id === designId);
    
    if (!designToDuplicate) return;
    
    const duplicatedDesign: PoleDesign = {
      ...designToDuplicate,
      id: uuidv4(),
      name: `${designToDuplicate.name} (Copy)`,
      components: designToDuplicate.components.map(component => ({
        ...component,
        id: uuidv4()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set({
      poleDesigns: [...poleDesigns, duplicatedDesign]
    });
  },
  
  getActiveConfig: () => {
    const { configurations, activeConfigId } = get();
    return configurations.find(config => config.id === activeConfigId);
  },
  
  getSelectedComponent: () => {
    const { selectedComponentId } = get();
    const activeConfig = get().getActiveConfig();
    
    if (!activeConfig || !selectedComponentId) return undefined;
    
    return activeConfig.components.find(
      component => component.id === selectedComponentId
    );
  },
  
  getActivePoleDesign: () => {
    const { poleDesigns, activePoleDesignId } = get();
    return poleDesigns.find(design => design.id === activePoleDesignId);
  },
  
  getComponentTemplate: (templateId) => {
    const { componentTemplates } = get();
    return componentTemplates.find(template => template.id === templateId);
  },
  
  getValidAttachmentPoints: (componentId) => {
    const { activePoleDesignId, poleDesigns, componentTemplates } = get();
    if (!activePoleDesignId) return [];
    
    // Get the active design
    const activeDesign = poleDesigns.find(d => d.id === activePoleDesignId);
    if (!activeDesign) return [];
    
    // Find the component
    const component = activeDesign.components.find(c => c.id === componentId);
    if (!component) return [];
    
    // Get the template to check constraints
    const template = componentTemplates.find(t => t.id === component.templateId);
    if (!template) return [];
    
    // Get valid attachment points based on the component's constraints
    const validAttachmentPoints: { id: string; name: string; category: ComponentCategory }[] = [];
    
    // Don't allow attachment to self or to components already attached to this one
    const getAttachedIds = (id: string): string[] => {
      const directlyAttached = activeDesign.components
        .filter(c => c.attachedTo === id)
        .map(c => c.id);
      
      const nestedAttached = directlyAttached.flatMap(attachedId => 
        getAttachedIds(attachedId)
      );
      
      return [id, ...directlyAttached, ...nestedAttached];
    };
    
    const invalidIds = getAttachedIds(componentId);
    
    // Find components that this component can attach to
    activeDesign.components.forEach(c => {
      if (invalidIds.includes(c.id)) return;
      
      const t = componentTemplates.find(temp => temp.id === c.templateId);
      if (!t) return;
      
      // Check if this component type can attach to the other component type
      if (template.constraints.attachesTo.includes(AttachmentPoint.POLE) && 
          t.category === ComponentCategory.POLE) {
        validAttachmentPoints.push({
          id: c.id,
          name: t.name,
          category: t.category
        });
      }
      
      if (template.constraints.attachesTo.includes(AttachmentPoint.CROSSARM) && 
          t.category === ComponentCategory.CROSSARM) {
        validAttachmentPoints.push({
          id: c.id,
          name: t.name,
          category: t.category
        });
      }
      
      if (template.constraints.attachesTo.includes(AttachmentPoint.INSULATOR) && 
          t.category === ComponentCategory.INSULATOR) {
        validAttachmentPoints.push({
          id: c.id,
          name: t.name,
          category: t.category
        });
      }
      
      if (template.constraints.attachesTo.includes(AttachmentPoint.GROUND) && 
          t.category === ComponentCategory.GUY_ANCHOR) {
        validAttachmentPoints.push({
          id: c.id,
          name: t.name,
          category: t.category
        });
      }
    });
    
    return validAttachmentPoints;
  },
  
  validateComponentPosition: (componentId, position, templateId, attachedToId) => {
    // If templateId is provided, use it, otherwise look up from the component
    let template: ComponentTemplate | undefined;
    let attachedToComponent: any = undefined;
    
    const { activePoleDesignId, poleDesigns, componentTemplates } = get();
    if (!activePoleDesignId) return position;
    
    // Get the active design
    const activeDesign = poleDesigns.find(d => d.id === activePoleDesignId);
    if (!activeDesign) return position;
    
    // If templateId is provided directly, use it
    if (templateId) {
      template = componentTemplates.find(t => t.id === templateId);
    } else {
      // Otherwise, look up the component and get its template
      const component = activeDesign.components.find(c => c.id === componentId);
      if (component) {
        template = componentTemplates.find(t => t.id === component.templateId);
      }
    }
    
    if (!template) return position;
    
    // If attached to another component, get that component
    if (attachedToId) {
      attachedToComponent = activeDesign.components.find(c => c.id === attachedToId);
    }
    
    // Create a copy of the position to modify
    let validatedPosition: [number, number, number] = [...position];
    
    // Apply constraints based on component type and attachment
    if (template.constraints.fixedPosition) {
      // For fixed position components like poles, enforce their default position
      return template.defaultPosition || [0, 0, 0];
    }
    
    if (attachedToComponent) {
      const attachedToTemplate = componentTemplates.find(t => t.id === attachedToComponent.templateId);
      
      if (attachedToTemplate) {
        // Apply constraints based on what we're attached to
        if (attachedToTemplate.category === ComponentCategory.POLE) {
          // Components attached to poles
          if (!template.constraints.movementRestrictions.offset) {
            // If no offset allowed, keep X and Z the same as the pole
            validatedPosition[0] = attachedToComponent.position[0];
            validatedPosition[2] = attachedToComponent.position[2];
          } else {
            // If offset allowed, limit the distance from the pole
            const dx = validatedPosition[0] - attachedToComponent.position[0];
            const dz = validatedPosition[2] - attachedToComponent.position[2];
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // Limit maximum offset distance
            const maxOffset = 2.0;
            if (distance > maxOffset) {
              const ratio = maxOffset / distance;
              validatedPosition[0] = attachedToComponent.position[0] + dx * ratio;
              validatedPosition[2] = attachedToComponent.position[2] + dz * ratio;
            }
          }
          
          // Enforce height constraints
          if (template.constraints.minHeight !== undefined) {
            validatedPosition[1] = Math.max(validatedPosition[1], template.constraints.minHeight);
          }
          
          if (template.constraints.maxHeight !== undefined) {
            validatedPosition[1] = Math.min(validatedPosition[1], template.constraints.maxHeight);
          }
        } else if (attachedToTemplate.category === ComponentCategory.CROSSARM) {
          // Components attached to crossarms
          if (template.category === ComponentCategory.INSULATOR) {
            // Insulators can only be at specific positions on crossarms
            // Snap to the nearest valid position
            const validXPositions = [
              attachedToComponent.position[0] - 1.8,
              attachedToComponent.position[0] + 1.8
            ];
            
            // Find the closest valid X position
            let closestX = validXPositions[0];
            let minDistance = Math.abs(validatedPosition[0] - validXPositions[0]);
            
            for (let i = 1; i < validXPositions.length; i++) {
              const distance = Math.abs(validatedPosition[0] - validXPositions[i]);
              if (distance < minDistance) {
                minDistance = distance;
                closestX = validXPositions[i];
              }
            }
            
            validatedPosition[0] = closestX;
            validatedPosition[1] = attachedToComponent.position[1];
            validatedPosition[2] = attachedToComponent.position[2];
          } else {
            // Other components attached to crossarms
            validatedPosition[1] = attachedToComponent.position[1];
            
            if (!template.constraints.movementRestrictions.offset) {
              validatedPosition[0] = attachedToComponent.position[0];
              validatedPosition[2] = attachedToComponent.position[2];
            }
          }
        }
      }
    } else {
      // Not attached to anything, apply general constraints
      
      // For ground-based components, keep Y at 0
      if (template.constraints.attachesTo.includes(AttachmentPoint.GROUND)) {
        validatedPosition[1] = 0;
      }
      
      // Apply min/max height constraints
      if (template.constraints.minHeight !== undefined) {
        validatedPosition[1] = Math.max(validatedPosition[1], template.constraints.minHeight);
      }
      
      if (template.constraints.maxHeight !== undefined) {
        validatedPosition[1] = Math.min(validatedPosition[1], template.constraints.maxHeight);
      }
      
      // Apply min/max distance constraints for guy anchors
      if (template.category === ComponentCategory.GUY_ANCHOR) {
        // Find the nearest pole
        const poles = activeDesign.components.filter(c => {
          const t = componentTemplates.find(temp => temp.id === c.templateId);
          return t?.category === ComponentCategory.POLE;
        });
        
        if (poles.length > 0) {
          let nearestPole = poles[0];
          let minDistance = Number.MAX_VALUE;
          
          poles.forEach(pole => {
            const dx = validatedPosition[0] - pole.position[0];
            const dz = validatedPosition[2] - pole.position[2];
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestPole = pole;
            }
          });
          
          // Apply min/max distance constraints
          const dx = validatedPosition[0] - nearestPole.position[0];
          const dz = validatedPosition[2] - nearestPole.position[2];
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (template.constraints.minDistance !== undefined && distance < template.constraints.minDistance) {
            const ratio = template.constraints.minDistance / distance;
            validatedPosition[0] = nearestPole.position[0] + dx * ratio;
            validatedPosition[2] = nearestPole.position[2] + dz * ratio;
          }
          
          if (template.constraints.maxDistance !== undefined && distance > template.constraints.maxDistance) {
            const ratio = template.constraints.maxDistance / distance;
            validatedPosition[0] = nearestPole.position[0] + dx * ratio;
            validatedPosition[2] = nearestPole.position[2] + dz * ratio;
          }
        }
      }
    }
    
    return validatedPosition;
  }
}));