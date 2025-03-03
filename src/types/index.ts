export interface ComponentSpec {
  id: string;
  name: string;
  description: string;
  purpose: string;
  specBookReference: string;
  edgeCases: string[];
  cuNumber: string;
  katapultExamples: string[];
  category: ComponentCategory;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelPath: string;
}

export enum ComponentCategory {
  POLE = 'pole',
  CROSSARM = 'crossarm',
  INSULATOR = 'insulator',
  TRANSFORMER = 'transformer',
  CONDUCTOR = 'conductor',
  HARDWARE = 'hardware',
  GROUNDING = 'grounding',
  GUY_ANCHOR = 'guy_anchor',
  GUY_WIRE = 'guy_wire',
  OTHER = 'other'
}

export enum AttachmentPoint {
  POLE = 'pole',
  CROSSARM = 'crossarm',
  GROUND = 'ground',
  INSULATOR = 'insulator'
}

export interface ComponentConstraints {
  attachesTo: AttachmentPoint[];
  movementRestrictions: {
    vertical: boolean;
    horizontal: boolean;
    rotation: boolean;
    offset: boolean;
  };
  fixedPosition: boolean;
  minHeight?: number;
  maxHeight?: number;
  minDistance?: number;
  maxDistance?: number;
}

export interface MaterialItem {
  item: string;
  quantity: number;
  description: string;
  stock: string;
}

export interface Configuration {
  id: string;
  name: string;
  description: string;
  components: ComponentSpec[];
  specReference?: string;
  macroCode?: string;
  notes?: string[];
  materialList?: MaterialItem[];
}

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  thumbnail: string;
  defaultPosition?: [number, number, number];
  defaultRotation?: [number, number, number];
  defaultScale?: [number, number, number];
  constraints: ComponentConstraints;
}

export interface PoleDesign {
  id: string;
  name: string;
  description: string;
  components: {
    id: string;
    templateId: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    attachedTo?: string; // ID of the component this is attached to
  }[];
  createdAt: string;
  updatedAt: string;
}