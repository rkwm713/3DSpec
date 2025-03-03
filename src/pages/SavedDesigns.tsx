import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Trash2, Edit, Eye, Copy, Calendar, Clock, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedDesigns: React.FC = () => {
  const poleDesigns = useAppStore(state => state.poleDesigns);
  const setActivePoleDesign = useAppStore(state => state.setActivePoleDesign);
  const deleteDesign = useAppStore(state => state.deleteDesign);
  const duplicateDesign = useAppStore(state => state.duplicateDesign);
  const toggleBuilderMode = useAppStore(state => state.toggleBuilderMode);
  const isBuilderMode = useAppStore(state => state.isBuilderMode);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const navigate = useNavigate();
  
  // Filter designs based on search term
  const filteredDesigns = poleDesigns.filter(design => 
    design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    design.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort designs
  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === 'asc'
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
  
  const handleViewDesign = (designId: string) => {
    setActivePoleDesign(designId);
    
    // If in builder mode, stay there, otherwise go to viewer
    if (!isBuilderMode) {
      toggleBuilderMode();
    }
    
    navigate('/');
  };
  
  const handleEditDesign = (designId: string) => {
    setActivePoleDesign(designId);
    
    // Make sure we're in builder mode
    if (!isBuilderMode) {
      toggleBuilderMode();
    }
    
    navigate('/');
  };
  
  const handleDeleteDesign = (designId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      deleteDesign(designId);
    }
  };
  
  const handleDuplicateDesign = (designId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    duplicateDesign(designId);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Saved Designs</h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Back to Viewer
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search designs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'name') {
                  toggleSortOrder();
                } else {
                  setSortBy('name');
                  setSortOrder('asc');
                }
              }}
              className={`px-3 py-1 rounded ${
                sortBy === 'name' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'date') {
                  toggleSortOrder();
                } else {
                  setSortBy('date');
                  setSortOrder('desc');
                }
              }}
              className={`px-3 py-1 rounded ${
                sortBy === 'date' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
        
        {sortedDesigns.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600">No designs found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? 'Try a different search term' : 'Create a new design to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {sortedDesigns.map(design => (
              <div
                key={design.id}
                className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDesign(design.id)}
              >
                <div className="h-48 bg-slate-200 flex items-center justify-center relative">
                  {/* Design preview/thumbnail */}
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    <span className="text-sm text-slate-500 mt-2">
                      {design.components.length} components
                    </span>
                  </div>
                  
                  {/* Quick action buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={(e) => handleDuplicateDesign(design.id, e)}
                      className="p-1.5 bg-white rounded-full hover:bg-slate-100"
                      title="Duplicate Design"
                    >
                      <Copy className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteDesign(design.id, e)}
                      className="p-1.5 bg-white rounded-full hover:bg-red-100"
                      title="Delete Design"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-1">{design.name}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">{design.description}</p>
                  
                  <div className="flex items-center text-xs text-slate-500 mb-4">
                    <div className="flex items-center mr-4">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(design.updatedAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{formatTime(design.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDesign(design.id);
                      }}
                      className="flex-1 flex items-center justify-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDesign(design.id);
                      }}
                      className="flex-1 flex items-center justify-center py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300"
                    >
                      <Wrench className="h-4 w-4 mr-1.5" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedDesigns;