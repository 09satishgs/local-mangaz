import React from 'react';
import Layout from './layouts';
import Home from './components/Home';
import Progress from './components/Progress';
import Read from './components/Read';
import CBZ from './components/CBZ';
import { BookmarkProvider } from './context/BookmarkContext';
import { DownloadProvider } from './context/DownloadContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { ResumeProvider } from './context/ResumeContext';
import { useHashRouter } from './hooks/useHashRouter';

export default function App() {
  const { currentRoute, navigate } = useHashRouter('home');

  return (
    <ViewModeProvider>
      <DownloadProvider>
        <BookmarkProvider>
          <ResumeProvider>
            <Layout currentRoute={currentRoute} onRouteChange={navigate}>
              {currentRoute === 'home' && <Home />}
              {currentRoute === 'progress' && <Progress />}
              {currentRoute === 'read' && <Read />}
              {currentRoute === 'cbz' && <CBZ />}
            </Layout>
          </ResumeProvider>
        </BookmarkProvider>
      </DownloadProvider>
    </ViewModeProvider>
  );
}
