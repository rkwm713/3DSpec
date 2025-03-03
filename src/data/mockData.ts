import { ComponentCategory, ComponentSpec, Configuration } from '../types';

// Mock component specifications
export const mockComponents: ComponentSpec[] = [
  {
    id: 'pole-1',
    name: 'Class 4 Wood Pole',
    description: 'Standard 40ft wooden utility pole',
    purpose: 'Primary support structure for overhead electrical distribution',
    specBookReference: 'Section 2.1, Page 14',
    edgeCases: [
      'Not suitable for high wind areas without guying',
      'Requires special treatment in termite-prone regions'
    ],
    cuNumber: 'DM4-7-0',
    katapultExamples: [
      'https://example.com/katapult/job123',
      'https://example.com/katapult/job456'
    ],
    category: ComponentCategory.POLE,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/pole.glb'
  },
  {
    id: 'crossarm-1',
    name: '8ft Pin-type Crossarm',
    description: 'Standard wooden crossarm for distribution lines',
    purpose: 'Supports insulators and conductors away from the pole',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Requires double arms for corner poles',
      'Not suitable for transmission voltages',
      'See DM2-2.0 Maximum Angles for Crossarm Construction'
    ],
    cuNumber: 'DS-1-3-0',
    katapultExamples: [
      'https://example.com/katapult/job789',
      'https://example.com/katapult/job012'
    ],
    category: ComponentCategory.CROSSARM,
    position: [0, 10, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/crossarm.glb'
  },
  {
    id: 'insulator-1',
    name: 'Pin-Type Insulator',
    description: 'Standard porcelain pin-type insulator',
    purpose: 'Provides electrical isolation between conductors and crossarm',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Not suitable for voltages above 15kV',
      'Requires special mounting in coastal areas'
    ],
    cuNumber: 'DS-1-3-0',
    katapultExamples: [
      'https://example.com/katapult/job345',
      'https://example.com/katapult/job678'
    ],
    category: ComponentCategory.INSULATOR,
    position: [-1.8, 10, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/insulator.glb'
  },
  {
    id: 'insulator-2',
    name: 'Pin-Type Insulator',
    description: 'Standard porcelain pin-type insulator',
    purpose: 'Provides electrical isolation between conductors and crossarm',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Not suitable for voltages above 15kV',
      'Requires special mounting in coastal areas'
    ],
    cuNumber: 'DS-1-3-0',
    katapultExamples: [
      'https://example.com/katapult/job345',
      'https://example.com/katapult/job678'
    ],
    category: ComponentCategory.INSULATOR,
    position: [1.8, 10, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/insulator.glb'
  },
  {
    id: 'transformer-1',
    name: '25kVA Transformer',
    description: 'Standard single-phase distribution transformer',
    purpose: 'Steps down primary voltage to utilization voltage',
    specBookReference: 'Section 5.3, Page 67',
    edgeCases: [
      'Requires additional support for poles with multiple transformers',
      'Special mounting needed in flood-prone areas'
    ],
    cuNumber: 'T-25-1',
    katapultExamples: [
      'https://example.com/katapult/job901',
      'https://example.com/katapult/job234'
    ],
    category: ComponentCategory.TRANSFORMER,
    position: [0, 8, 1],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/transformer.glb'
  },
  {
    id: 'conductor-1',
    name: '1/0 ACSR Conductor',
    description: 'Aluminum conductor steel reinforced',
    purpose: 'Primary conductor for power distribution',
    specBookReference: 'Section 6.2, Page 83',
    edgeCases: [
      'Requires special tensioning in extreme temperature areas',
      'Not suitable for spans exceeding 300ft without special considerations',
      'For raptor protection use ES-15-1.0'
    ],
    cuNumber: '537S',
    katapultExamples: [
      'https://example.com/katapult/job567',
      'https://example.com/katapult/job890'
    ],
    category: ComponentCategory.CONDUCTOR,
    position: [-1.8, 10, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/conductor.glb'
  },
  {
    id: 'conductor-2',
    name: '1/0 ACSR Conductor',
    description: 'Aluminum conductor steel reinforced',
    purpose: 'Primary conductor for power distribution',
    specBookReference: 'Section 6.2, Page 83',
    edgeCases: [
      'Requires special tensioning in extreme temperature areas',
      'Not suitable for spans exceeding 300ft without special considerations',
      'For raptor protection use ES-15-1.0'
    ],
    cuNumber: '537S',
    katapultExamples: [
      'https://example.com/katapult/job567',
      'https://example.com/katapult/job890'
    ],
    category: ComponentCategory.CONDUCTOR,
    position: [1.8, 10, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/conductor.glb'
  },
  {
    id: 'hardware-1',
    name: 'Solid Pin Insulator Arm',
    description: 'Steel pin with crossarm attachment',
    purpose: 'Secures insulators to crossarm',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Must be properly torqued to prevent loosening',
      'Requires periodic inspection for corrosion'
    ],
    cuNumber: 'DS-1-3-0',
    katapultExamples: [
      'https://example.com/katapult/job111',
      'https://example.com/katapult/job222'
    ],
    category: ComponentCategory.HARDWARE,
    position: [-1.8, 10.2, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/pin.glb'
  },
  {
    id: 'hardware-2',
    name: 'Solid Pin Insulator Arm',
    description: 'Steel pin with crossarm attachment',
    purpose: 'Secures insulators to crossarm',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Must be properly torqued to prevent loosening',
      'Requires periodic inspection for corrosion'
    ],
    cuNumber: 'DS-1-3-0',
    katapultExamples: [
      'https://example.com/katapult/job111',
      'https://example.com/katapult/job222'
    ],
    category: ComponentCategory.HARDWARE,
    position: [1.8, 10.2, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/pin.glb'
  },
  {
    id: 'hardware-3',
    name: 'One Wrap Binder',
    description: 'Secures conductor to insulator',
    purpose: 'Provides mechanical connection between conductor and insulator',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Must be properly installed to prevent slippage',
      'Not suitable for high tension applications'
    ],
    cuNumber: 'DS-1-3-0',
    katapultExamples: [
      'https://example.com/katapult/job333',
      'https://example.com/katapult/job444'
    ],
    category: ComponentCategory.HARDWARE,
    position: [-1.8, 10.3, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/binder.glb'
  },
  {
    id: 'hardware-4',
    name: 'One Wrap Binder',
    description: 'Secures conductor to insulator',
    purpose: 'Provides mechanical connection between conductor and insulator',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Must be properly installed to prevent slippage',
      'Not suitable for high tension applications'
    ],
    cuNumber: 'DS-1-3-0',
    katapultExamples: [
      'https://example.com/katapult/job333',
      'https://example.com/katapult/job444'
    ],
    category: ComponentCategory.HARDWARE,
    position: [1.8, 10.3, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/binder.glb'
  },
  {
    id: 'hardware-5',
    name: 'Line Ties',
    description: 'Secures conductor to insulator',
    purpose: 'Provides additional mechanical security for conductor attachment',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Must be properly tensioned',
      'Requires inspection after severe weather events'
    ],
    cuNumber: '537S',
    katapultExamples: [
      'https://example.com/katapult/job555',
      'https://example.com/katapult/job666'
    ],
    category: ComponentCategory.HARDWARE,
    position: [-1.8, 10.4, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/ties.glb'
  },
  {
    id: 'hardware-6',
    name: 'Line Ties',
    description: 'Secures conductor to insulator',
    purpose: 'Provides additional mechanical security for conductor attachment',
    specBookReference: 'DS-1-3-0',
    edgeCases: [
      'Must be properly tensioned',
      'Requires inspection after severe weather events'
    ],
    cuNumber: '537S',
    katapultExamples: [
      'https://example.com/katapult/job555',
      'https://example.com/katapult/job666'
    ],
    category: ComponentCategory.HARDWARE,
    position: [1.8, 10.4, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    modelPath: '/models/ties.glb'
  }
];

// Mock configuration
export const mockConfiguration: Configuration = {
  id: 'config-1',
  name: 'Three-Phase Tangent and Small Angles (MOT1Axy)',
  description: 'Standard configuration for three-phase distribution on tangent and small angle structures',
  components: mockComponents,
  specReference: 'DS-2-4.0',
  macroCode: 'MOT1Axy',
  notes: [
    'For raptor protection use ES-15-1.0',
    'See DM2-2.0 Maximum Angles for Crossarm Construction',
    'See DS-1-6-0.0 Length of Bolts',
    'See section 18 for Initial/Final Details'
  ],
  materialList: [
    { item: 'A', quantity: 1, description: 'Wood Pole', stock: 'DM4-7-0' },
    { item: 'B', quantity: 1, description: 'Pin-type Pin with Crossarm', stock: 'DS-1-3-0' },
    { item: 'C', quantity: 2, description: 'Solid Pin Insulator Arm', stock: 'DS-1-3-0' },
    { item: 'D', quantity: 3, description: 'One Wrap Binder', stock: 'DS-1-3-0' },
    { item: 'E', quantity: 3, description: 'Line Ties', stock: '537S' },
    { item: 'F', quantity: 1, description: 'Spool/Line Tie', stock: '537S' }
  ]
};