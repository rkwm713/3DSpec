import React from 'react';
import { Search, Menu, Info, Download, Settings, FileText, Wrench, Eye, Save, List } from 'lucide-react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const activeConfig = useAppStore(state => state.getActiveConfig());
  const isBuilderMode = useAppStore(state => state.isBuilderMode);
  const toggleBuilderMode = useAppStore(state => state.toggleBuilderMode);
  const activePoleDesign = useAppStore(state => state.getActivePoleDesign());
  
  const navigate = useNavigate();
  
  return (
    <nav className="bg-slate-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Menu className="h-6 w-6 cursor-pointer" />
        <h1 className="text-xl font-bold">TechServ 3D Spec Visualizer</h1>
      </div>
      
      <div className="flex-1 mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search components or macro codes..."
            className="w-full bg-slate-700 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/designs')}
          className="flex items-center px-3 py-1.5 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600"
          title="View Saved Designs"
        >
          <List className="h-4 w-4 mr-1.5" />
          <span>Designs</span>
        </button>
        
        <button
          onClick={toggleBuilderMode}
          className={`flex items-center px-3 py-1.5 rounded-md ${
            isBuilderMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
          title={isBuilderMode ? "Switch to Viewer Mode" : "Switch to Builder Mode"}
        >
          {isBuilderMode ? (
            <>
              <Eye className="h-4 w-4 mr-1.5" />
              <span>View Mode</span>
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-1.5" />
              <span>Builder Mode</span>
            </>
          )}
        </button>
        
        <div className="flex items-center text-sm text-slate-300">
          {isBuilderMode ? (
            <span>{activePoleDesign?.name || 'No design loaded'}</span>
          ) : (
            <>
              {activeConfig?.specReference && (
                <div className="flex items-center mr-3">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{activeConfig.specReference}</span>
                </div>
              )}
              <span>{activeConfig?.name || 'No configuration loaded'}</span>
            </>
          )}
        </div>
        <Info className="h-5 w-5 cursor-pointer text-slate-300 hover:text-white" />
        <Download className="h-5 w-5 cursor-pointer text-slate-300 hover:text-white" />
        <Settings className="h-5 w-5 cursor-pointer text-slate-300 hover:text-white" />
      </div>
    </nav>
  );
};

export default Navbar;