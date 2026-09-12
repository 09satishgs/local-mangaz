import React from 'react';
import { useViewMode } from '../../context/ViewModeContext';
import { useRead } from './hooks';
import Web from './views/Web';
import Mobile from './views/Mobile';

export default function Read() {
  const { isMobileView } = useViewMode();
  const read = useRead();

  if (isMobileView) {
    return <Mobile read={read} />;
  }
  return <Web read={read} />;
}
