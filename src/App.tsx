import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Scene3D from './components/Scene3D';
import DetailsPanel from './components/DetailsPanel';
import PoleBuilder from './components/PoleBuilder';
import SavedDesigns from './pages/SavedDesigns';
import { useAppStore } from './store';

function App() {
  const isBuilderMode = useAppStore(state => state.isBuilderMode);
  
  return (
    <Router>
      <Routes>
        <Route path="/designs" element={<SavedDesigns />} />
        <Route path="/" element={
          <div className="flex flex-col h-screen">
            <Navbar />
            
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              
              <main className="flex-1 relative bg-slate-200">
                {isBuilderMode ? <PoleBuilder /> : <Scene3D />}
              </main>
              
              <DetailsPanel />
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;