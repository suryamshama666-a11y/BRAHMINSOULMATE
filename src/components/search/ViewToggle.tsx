import React from 'react';
import { Grid, Map } from 'lucide-react';

export type ViewMode = 'grid' | 'map';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  return (
    <div className={`flex overflow-hidden border border-[#FF4500] rounded-md ${className}`}>
      <button
        type="button"
        onClick={() => onViewChange('grid')}
        className={`
          flex items-center px-3 py-1.5
          ${currentView === 'grid' 
            ? 'bg-[#FF4500] text-white' 
            : 'bg-white text-gray-700'}
        `}
      >
        <Grid className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Grid</span>
      </button>
      <button
        type="button"
        onClick={() => onViewChange('map')}
        className={`
          flex items-center px-3 py-1.5
          ${currentView === 'map' 
            ? 'bg-[#FF4500] text-white' 
            : 'bg-white text-gray-700'}
        `}
      >
        <Map className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Map</span>
      </button>
    </div>
  );
};

export default ViewToggle; 