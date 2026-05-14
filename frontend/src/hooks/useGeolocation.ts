import { useState, useEffect, useCallback, useRef } from "react";

export interface GeolocationState {
  loading: boolean;
  error: GeolocationError | null;
  position: GeolocationCoordinates | null;
}

export interface GeolocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export type GeolocationError =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNKNOWN";

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

function getErrorType(error: GeolocationPositionError): GeolocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "PERMISSION_DENIED";
    case error.POSITION_UNAVAILABLE:
      return "POSITION_UNAVAILABLE";
    case error.TIMEOUT:
      return "TIMEOUT";
    default:
      return "UNKNOWN";
  }
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const isWatchingRef = useRef(false);

  const getDefaultOptions = useCallback((): PositionOptions => ({
    enableHighAccuracy,
    timeout,
    maximumAge,
  }), [enableHighAccuracy, timeout, maximumAge]);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: "POSITION_UNAVAILABLE",
        position: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
          },
        });
      },
      (error) => {
        setState({
          loading: false,
          error: getErrorType(error),
          position: null,
        });
      },
      getDefaultOptions()
    );
  }, [getDefaultOptions]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      isWatchingRef.current = false;
    }
  }, []);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: "POSITION_UNAVAILABLE",
        position: null,
      });
      return;
    }

    if (isWatchingRef.current) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    isWatchingRef.current = true;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
          },
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorType(error),
        }));
        stopWatching();
      },
      getDefaultOptions()
    );
  }, [getDefaultOptions, stopWatching]);

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    stopWatching,
  };
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function isWithinRadius(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  radiusMeters: number
): boolean {
  return calculateDistance(userLat, userLng, targetLat, targetLng) <= radiusMeters;
}