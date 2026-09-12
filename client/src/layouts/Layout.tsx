import React from 'react';
import { useViewMode } from '../context/ViewModeContext';
import Web from './views/Web';
import Mobile from './views/Mobile';

export type RouteType = 'home' | 'progress' | 'read';

interface LayoutProps {
  currentRoute: RouteType;
  onRouteChange: (route: RouteType) => void;
  children: React.ReactNode;
}

export default function Layout({ currentRoute, onRouteChange, children }: LayoutProps) {
  const { isMobileView } = useViewMode();

  if (isMobileView) {
    return (
      <Mobile currentRoute={currentRoute} onRouteChange={onRouteChange}>
        {children}
      </Mobile>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Web Header Layout */}
      <Web currentRoute={currentRoute} onRouteChange={onRouteChange} />

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto flex flex-col">
        {children}
      </main>
    </div>
  );
}
