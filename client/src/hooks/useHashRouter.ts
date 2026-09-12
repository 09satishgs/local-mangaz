import { useState, useEffect, useCallback } from 'react';

export type RouteType = 'home' | 'progress' | 'read' | 'cbz';

const VALID_ROUTES: RouteType[] = ['home', 'progress', 'read', 'cbz'];

function getRouteFromHash(): RouteType {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  if (VALID_ROUTES.includes(hash as RouteType)) {
    return hash as RouteType;
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
