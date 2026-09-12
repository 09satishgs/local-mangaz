import React from 'react';
import { useViewMode } from '../../context/ViewModeContext';
import { useCbz } from './hooks';
import Web from './views/Web';
import Mobile from './views/Mobile';

export default function CBZ() {
  const { isMobileView } = useViewMode();
  const cbz = useCbz();

  if (isMobileView) {
    return <Mobile cbz={cbz} />;
  }
  return <Web cbz={cbz} />;
}
