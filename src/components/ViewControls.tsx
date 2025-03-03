import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Grid3X3, Tag, Layers, Layers3 } from 'lucide-react';
import { useAppStore } from '../store';

interface ViewControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
  onToggleLabels: () => void;
  showGrid: boolean;
  showLabels: boolean;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  onReset,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onToggleLabels,
  showGrid,
  showLabels
}) => {
  const isAssembledView = useAppStore(state => state.isAssembledView);
  const toggleViewMode = useAppStore(state => state.toggleViewMode);
  
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-1 flex items-center">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-slate-100 rounded-full"
        title="Zoom In"
      >
        <ZoomIn className="h-5 w-5" />
      </button>
      
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-slate-100 rounded-full"
        title="Zoom Out"
      >
        <ZoomOut className="h-5 w-5" />
      </button>
      
      <div className="h-6 w-px bg-slate-200 mx-1"></div>
      
      <button
        onClick={onReset}
        className="p-2 hover:bg-slate-100 rounded-full"
        title="Reset View"
      >
        <RotateCcw className="h-5 w-5" />
      </button>
      
      <button
        onClick={onToggleGrid}
        className={`p-2 rounded-full ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100'}`}
        title="Toggle Grid"
      >
        <Grid3X3 className="h-5 w-5" />
      </button>
      
      <button
        onClick={onToggleLabels}
        className={`p-2 rounded-full ${showLabels ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100'}`}
        title="Toggle Labels"
      >
        <Tag className="h-5 w-5" />
      </button>
      
      <div className="h-6 w-px bg-slate-200 mx-1"></div>
      
      <button
        onClick={toggleViewMode}
        className={`p-2 rounded-full ${isAssembledView ? 'bg-purple-100 text-purple-600' : 'hover:bg-slate-100'}`}
        title={isAssembledView ? "Switch to Exploded View" : "Switch to Assembled View"}
      >
        {isAssembledView ? (
          <Layers3 className="h-5 w-5" />
        ) : (
          <Layers className="h-5 w-5" />
        )}
      </button>
      
      <div className="h-6 w-px bg-slate-200 mx-1"></div>
      
      <button
        className="p-2 hover:bg-slate-100 rounded-full"
        title="Fullscreen"
      >
        <Maximize className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ViewControls;