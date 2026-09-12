import React from 'react';
import { useViewMode } from '../../context/ViewModeContext';
import { useProgress } from './hooks';
import Web from './views/Web';
import Mobile from './views/Mobile';

export default function Progress() {
  const { isMobileView } = useViewMode();
  const progress = useProgress();

  if (isMobileView) {
    return <Mobile progress={progress} />;
  }
  return <Web progress={progress} />;
}
