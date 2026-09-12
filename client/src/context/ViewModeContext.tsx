import React, { createContext, useContext, useState, useEffect } from 'react';

export type ViewMode = 'web' | 'mobile';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isMobileView: boolean;
  isWebView: boolean;
}

export const ViewModeContext = createContext<ViewModeContextType | null>(null);

const STORAGE_KEY = 'homeMangaViewMode';

export const ViewModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (saved === 'web' || saved === 'mobile') {
      return saved;
    }
    return window.innerWidth < 768 ? 'mobile' : 'web';
  });

  const setViewMode = (mode: ViewMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setViewModeState(mode);
  };

  useEffect(() => {
    const handleResize = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setViewModeState(window.innerWidth < 768 ? 'mobile' : 'web');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value: ViewModeContextType = {
    viewMode,
    setViewMode,
    isMobileView: viewMode === 'mobile',
    isWebView: viewMode === 'web'
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
