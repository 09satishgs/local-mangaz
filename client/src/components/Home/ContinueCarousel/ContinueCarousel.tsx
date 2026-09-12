import React from 'react';
import { useViewMode } from '../../../context/ViewModeContext';
import { useContinueProgress } from './hooks';
import Web from './views/Web';
import Mobile from './views/Mobile';

export default function ContinueCarousel({ onNavigate }: { onNavigate?: (route: any) => void }) {
  const { isMobileView } = useViewMode();
  const { progressList, deleteSlide, resumeSlide } = useContinueProgress(onNavigate);

  if (!progressList || progressList.length === 0) {
    return null;
  }

  if (isMobileView) {
    return (
      <Mobile
        progressList={progressList}
        deleteSlide={deleteSlide}
        resumeSlide={resumeSlide}
      />
    );
  }

  return (
    <Web
      progressList={progressList}
      deleteSlide={deleteSlide}
      resumeSlide={resumeSlide}
    />
  );
}
