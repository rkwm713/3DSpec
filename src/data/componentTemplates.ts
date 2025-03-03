import { ComponentCategory, ComponentTemplate, AttachmentPoint } from '../types';

export const componentTemplates: ComponentTemplate[] = [
  {
    id: 'pole-template-1',
    name: 'Class 4 Wood Pole',
    description: 'Standard 40ft wooden utility pole',
    category: ComponentCategory.POLE,
    thumbnail: '/thumbnails/pole.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.GROUND],
      movementRestrictions: {
        vertical: false,
        horizontal: false,
        rotation: false,
        offset: false
      },
      fixedPosition: true
    }
  },
  {
    id: 'crossarm-template-1',
    name: '8ft Pin-type Crossarm',
    description: 'Standard wooden crossarm for distribution lines',
    category: ComponentCategory.CROSSARM,
    thumbnail: '/thumbnails/crossarm.png',
    defaultPosition: [0, 10, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.POLE],
      movementRestrictions: {
        vertical: true,
        horizontal: false,
        rotation: true,
        offset: false
      },
      fixedPosition: false,
      minHeight: 8,
      maxHeight: 12
    }
  },
  {
    id: 'insulator-template-1',
    name: 'Pin-Type Insulator',
    description: 'Standard porcelain pin-type insulator',
    category: ComponentCategory.INSULATOR,
    thumbnail: '/thumbnails/insulator.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.POLE, AttachmentPoint.CROSSARM],
      movementRestrictions: {
        vertical: true,
        horizontal: false,
        rotation: true,
        offset: true
      },
      fixedPosition: false
    }
  },
  {
    id: 'transformer-template-1',
    name: '25kVA Transformer',
    description: 'Standard single-phase distribution transformer',
    category: ComponentCategory.TRANSFORMER,
    thumbnail: '/thumbnails/transformer.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.POLE],
      movementRestrictions: {
        vertical: true,
        horizontal: false,
        rotation: true,
        offset: false
      },
      fixedPosition: false,
      minHeight: 6,
      maxHeight: 9
    }
  },
  {
    id: 'conductor-template-1',
    name: '1/0 ACSR Conductor',
    description: 'Aluminum conductor steel reinforced',
    category: ComponentCategory.CONDUCTOR,
    thumbnail: '/thumbnails/conductor.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.INSULATOR],
      movementRestrictions: {
        vertical: false,
        horizontal: false,
        rotation: false,
        offset: false
      },
      fixedPosition: false
    }
  },
  {
    id: 'hardware-template-1',
    name: 'Solid Pin Insulator Arm',
    description: 'Steel pin with crossarm attachment',
    category: ComponentCategory.HARDWARE,
    thumbnail: '/thumbnails/pin.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.CROSSARM],
      movementRestrictions: {
        vertical: false,
        horizontal: false,
        rotation: false,
        offset: true
      },
      fixedPosition: false
    }
  },
  {
    id: 'hardware-template-2',
    name: 'One Wrap Binder',
    description: 'Secures conductor to insulator',
    category: ComponentCategory.HARDWARE,
    thumbnail: '/thumbnails/binder.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.INSULATOR],
      movementRestrictions: {
        vertical: false,
        horizontal: false,
        rotation: false,
        offset: false
      },
      fixedPosition: false
    }
  },
  {
    id: 'hardware-template-3',
    name: 'Line Ties',
    description: 'Secures conductor to insulator',
    category: ComponentCategory.HARDWARE,
    thumbnail: '/thumbnails/ties.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.INSULATOR],
      movementRestrictions: {
        vertical: false,
        horizontal: false,
        rotation: false,
        offset: false
      },
      fixedPosition: false
    }
  },
  {
    id: 'grounding-template-1',
    name: 'Ground Rod',
    description: 'Copper-clad steel ground rod',
    category: ComponentCategory.GROUNDING,
    thumbnail: '/thumbnails/ground-rod.png',
    defaultPosition: [0, 0, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.GROUND],
      movementRestrictions: {
        vertical: false,
        horizontal: true,
        rotation: false,
        offset: false
      },
      fixedPosition: false,
      minDistance: 1,
      maxDistance: 3
    }
  },
  {
    id: 'guy-anchor-template-1',
    name: 'Guy Anchor',
    description: 'Anchor for guy wires',
    category: ComponentCategory.GUY_ANCHOR,
    thumbnail: '/thumbnails/guy-anchor.png',
    defaultPosition: [3, 0, 3],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.GROUND],
      movementRestrictions: {
        vertical: false,
        horizontal: true,
        rotation: false,
        offset: false
      },
      fixedPosition: false,
      minDistance: 5,
      maxDistance: 15
    }
  },
  {
    id: 'guy-wire-template-1',
    name: 'Guy Wire',
    description: 'Steel wire for pole support',
    category: ComponentCategory.GUY_WIRE,
    thumbnail: '/thumbnails/guy-wire.png',
    defaultPosition: [0, 8, 0],
    defaultRotation: [0, 0, 0],
    defaultScale: [1, 1, 1],
    constraints: {
      attachesTo: [AttachmentPoint.POLE, AttachmentPoint.GUY_ANCHOR],
      movementRestrictions: {
        vertical: true,
        horizontal: false,
        rotation: false,
        offset: false
      },
      fixedPosition: false,
      minHeight: 6,
      maxHeight: 12
    }
  }
];