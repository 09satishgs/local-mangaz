import { useState, useEffect, useCallback } from 'react';

export type RouteType = 'home' | 'progress' | 'read' | 'cbz';

const VALID_ROUTES: RouteType[] = ['home', 'progress', 'read', 'cbz'];

function getRouteFromHash(): RouteType {
  const cleanHash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  const routeName = cleanHash.split('?')[0].split('/')[0];
  if (VALID_ROUTES.includes(routeName as RouteType)) {
    return routeName as RouteType;
  }
  return 'home';
}

export function useHashRouter(defaultRoute: RouteType = 'home') {
  const [currentRoute, setCurrentRouteState] = useState<RouteType>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return getRouteFromHash();
    }
    return defaultRoute;
  });

  const navigate = useCallback((route: RouteType) => {
    if (window.location.hash !== `#/${route}`) {
      window.location.hash = `#/${route}`;
    }
    setCurrentRouteState(route);
  }, []);

  useEffect(() => {
    // Ensure initial URL hash matches the state if none was set
    if (!window.location.hash) {
      window.location.replace(`#/${currentRoute}`);
    }

    const handleHashChange = () => {
      const nextRoute = getRouteFromHash();
      setCurrentRouteState(nextRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoute]);

  return {
    currentRoute,
    navigate
  };
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        const docEl = document.documentElement as any;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen({ navigationUI: 'hide' });
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        const doc = document as any;
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
}

