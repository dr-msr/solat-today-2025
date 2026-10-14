'use client'

import { useCallback, useEffect, useState } from "react";

interface DeviceOrientationState {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
  // Compass heading in degrees clockwise from north, or null when the device gives no north reference
  heading: number | null;
}

// iOS Safari puts the north-referenced heading on the event itself
interface CompassOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}


export const isAlignedWithQiblat = ({ bearing, heading }: { bearing: number, heading: number }) => {
    const tolerance = 1; // degrees of tolerance
    
    const diff = Math.abs(heading - bearing);
    // Handle the case of angles near 0/360 boundary
    const normalizedDiff = Math.min(diff, 360 - diff);
    
    return normalizedDiff <= tolerance;
  };

// Define an extended interface for DeviceOrientationEvent including requestPermission
interface DeviceOrientationEventExtended extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<DeviceOrientationState>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false,
    heading: null,
  });
  
  const [error, setError] = useState<Error | null>(null);
  const [secureOriginError, setSecureOriginError] = useState<boolean>(false);

  // Check if code is running in browser environment first
  const isBrowser = typeof window !== "undefined";
  
  // Check if we're in a secure context (HTTPS or localhost)
  const isSecureContext = isBrowser && (window.isSecureContext === true);
  
  // Only check for DeviceOrientationEvent if in browser and secure context
  const isSupported = isBrowser && isSecureContext && 
    typeof window.DeviceOrientationEvent !== "undefined";

  // Determine if we need to request permission (for iOS 13+)
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);

  // Initialize permission state
  useEffect(() => {
    if (!isBrowser) return;
    
    // Check for secure context issues
    if (!isSecureContext) {
      setSecureOriginError(true);
      setError(new Error("Device orientation requires a secure context (HTTPS)"));
      return;
    }
    
    try {
      // Default to true for Android or older browsers that don't require permission
      const needsPermission = 
        typeof window.DeviceOrientationEvent !== "undefined" && 
        typeof (window.DeviceOrientationEvent as unknown as DeviceOrientationEventExtended)
          .requestPermission === "function";
          
      // If no permission needed, we're automatically granted
      if (!needsPermission) {
        setIsPermissionGranted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error checking device orientation permission'));
    }
  }, [isBrowser, isSecureContext]);

  // Chrome on Android reports a north-referenced alpha only on deviceorientationabsolute;
  // its plain deviceorientation alpha is relative to wherever the phone was at page load.
  const eventName = isBrowser && "ondeviceorientationabsolute" in window
    ? "deviceorientationabsolute"
    : "deviceorientation";

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    try {
      const compassEvent = event as CompassOrientationEvent;
      let heading: number | null = null;
      if (typeof compassEvent.webkitCompassHeading === "number") {
        heading = compassEvent.webkitCompassHeading;
      } else if (event.absolute && event.alpha != null) {
        heading = 360 - event.alpha;
      }
      if (heading != null) {
        // Correct for the screen being rotated to landscape
        const screenAngle = window.screen?.orientation?.angle ?? 0;
        heading = (((heading + screenAngle) % 360) + 360) % 360;
      }
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: !!event.absolute,
        heading,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error in orientation handler'));
    }
  }, []);

  useEffect(() => {
    if (!isBrowser || !isSupported || isPermissionGranted !== true) return;
    
    try {
      window.addEventListener(eventName, handleOrientation as EventListener);
      return () => {
        window.removeEventListener(eventName, handleOrientation as EventListener);
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set up device orientation event'));
    }
  }, [isBrowser, isSupported, isPermissionGranted, handleOrientation, eventName]);

  const requestPermission = useCallback(async () => {
    if (!isBrowser || !isSupported) return false;
    
    try {
      if (typeof window.DeviceOrientationEvent !== "undefined" &&
          typeof (window.DeviceOrientationEvent as unknown as DeviceOrientationEventExtended)
            .requestPermission === "function") {
            
        const permissionState = await (window.DeviceOrientationEvent as unknown as DeviceOrientationEventExtended)
          .requestPermission!();
        setIsPermissionGranted(permissionState === "granted");
        return permissionState === "granted";
      } else {
        // No permission needed, automatically granted
        setIsPermissionGranted(true);
        return true;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error requesting orientation permission');
      
      // Check specifically for secure origin errors
      if (error.message && error.message.includes('secure')) {
        setSecureOriginError(true);
      }
      
      setError(error);
      setIsPermissionGranted(false);
      return false;
    }
  }, [isBrowser, isSupported]);

  // Check if running on a mobile device
  const isMobile = isBrowser && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const needsPermission = isSupported &&
    typeof (window.DeviceOrientationEvent as unknown as DeviceOrientationEventExtended).requestPermission === "function";

  return { 
    orientation, 
    needsPermission,
    requestPermission, 
    isPermissionGranted, 
    isSupported,
    secureOriginError,
    isMobile,
    error
  };
}

export default useDeviceOrientation;