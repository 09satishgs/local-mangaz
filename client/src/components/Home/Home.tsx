import React from 'react';
import { useViewMode } from '../../context/ViewModeContext';
import { useHome } from './hooks';
import Web from './views/Web';
import Mobile from './views/Mobile';

export default function Home() {
  const { isMobileView } = useViewMode();
  const home = useHome();

  if (isMobileView) {
    return <Mobile home={home} />;
  }
  return <Web home={home} />;
}
