'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, MapPinHouseIcon, RotateCcw } from "lucide-react";
import useDeviceOrientation from "@/lib/heading";

// Number of readings to track for stability analysis
const READING_HISTORY_SIZE = 10;
// Threshold for average variation that triggers calibration warning (in degrees)
const VARIATION_THRESHOLD = 15;

const DEBUG : "default" | "calibrate" | null = "default"

const status = [
    "Qiblat accuracy relies on your device's compass.",
    "Move away from any electronic devices to minimize interference.",
    "Accuracy is low if you are inside a building or in a moving car."
]

interface CalibrateCompassProps {
    updateReading: (reading: number) => void;
}

export default function CalibrateCompass({ updateReading }: CalibrateCompassProps) {
    const { orientation, isSupported, isPermissionGranted } = useDeviceOrientation();
    const [readings, setReadings] = useState<number[]>([]);
    const [isCalibrationNeeded, setCalibrationNeeded] = useState(false);
    const [calibrationConfidence, setCalibrationConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
    const [showCalibrationGuide, setShowCalibrationGuide] = useState(false);
    const [lastCheckedTime, setLastCheckedTime] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [visibleStatus, setVisibleStatus] = useState(status[0]);

useEffect(() => {
    const statusInterval = setInterval(() => {
        // Start fade out
        setIsTransitioning(true);
        
        // After fade out completes, change content and fade back in
        setTimeout(() => {
            const nextIndex = (statusIndex + 1) % status.length;
            setStatusIndex(nextIndex);
            setVisibleStatus(status[nextIndex]);
            
            // Start fade in
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 300); // This duration should match the fade-out transition time
    }, 10000);
    
    return () => clearInterval(statusInterval);
}, [statusIndex]);

    // Track compass readings over time
    useEffect(() => {
        // Don't run if compass isn't available or we don't have permission
        if (!isSupported || isPermissionGranted !== true || !orientation.alpha) {
            return;
        }

        // Throttle updates to once per 200ms to avoid excessive updates
        const now = Date.now();
        if (now - lastCheckedTime < 200) {
            return;
        }
        setLastCheckedTime(now);

        // Add current reading to history
        const currentReading = Math.round(orientation.alpha);
        setReadings(prev => {
            // Keep the last N readings
            const newReadings = [...prev, currentReading].slice(-READING_HISTORY_SIZE);

            // Only analyze if we have enough readings
            if (newReadings.length >= 5) {
                analyzeCompassStability(newReadings);
            }

            return newReadings;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orientation.alpha, isSupported, isPermissionGranted, lastCheckedTime]);

    // Analyze compass readings for stability
    const analyzeCompassStability = (readingHistory: number[]) => {
        const variations = [];

        // Calculate differences between consecutive readings
        for (let i = 1; i < readingHistory.length; i++) {
            // Handle the case of crossing the 0°/360° boundary
            let diff = Math.abs(readingHistory[i] - readingHistory[i - 1]);
            if (diff > 180) {
                diff = 360 - diff; // Get the smaller angle
            }
            variations.push(diff);
        }

        // Calculate average variation
        const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;

        // Check if readings are stable enough
        if (avgVariation > VARIATION_THRESHOLD) {
            setCalibrationNeeded(true);

            // Set confidence level based on variation
            if (avgVariation > 30) {
                setCalibrationConfidence('low');
            } else if (avgVariation > 20) {
                setCalibrationConfidence('medium');
            } else {
                setCalibrationConfidence('high');
            }
        } else {
            setCalibrationNeeded(false);
            setCalibrationConfidence('high');
            updateReading(360 - (readingHistory[readingHistory.length - 1]));
        }
    };

    // Reset detection and close dialog when user says they're done calibrating
    const handleCalibrationComplete = () => {
        setShowCalibrationGuide(false);
        setReadings([]); // Reset readings to start fresh
        setCalibrationNeeded(false);
    };

    // If compass isn't supported or permission not granted, don't show anything
    if (!isSupported || isPermissionGranted !== true) {
        return null;
    }

    return (
        <>
            {(isCalibrationNeeded || (DEBUG == "calibrate")) && (
                <div className="p-4 mt-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-3">
                    <AlertTriangle className="text-yellow-600 shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-yellow-800">Compass Calibration Needed</h3>
                        <p className="text-sm mt-1 text-yellow-700">
                            Your compass readings appear to be unstable
                            ({calibrationConfidence === 'low'
                                ? 'low accuracy'
                                : calibrationConfidence === 'medium'
                                    ? 'moderate accuracy'
                                    : 'needs minor adjustment'}).
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCalibrationGuide(true)}
                        className="shrink-0"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Calibrate
                    </Button>
                </div>
            )}

            {((!isCalibrationNeeded && calibrationConfidence === 'high' && readings.length >= 5) || (DEBUG == "default")) && (
                <div className="px-4 p-2 mt-2 bg-grey-50 border border-grey-200 rounded-md flex items-center gap-3">
                    <div className="flex items-center justify-center gap-2">
                    <div 
  className={`flex flex-row  gap-2 text-xs text-grey-500 transition-opacity duration-300 ease-in-out ${
    isTransitioning ? 'opacity-0' : 'opacity-100'
  }`}
>
<MapPinHouseIcon className="text-grey-500 h-4 w-4 shrink-0" />
{visibleStatus}
</div>                    </div>
                </div>
            )}

            <Dialog open={showCalibrationGuide} onOpenChange={setShowCalibrationGuide}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>How to Calibrate Your Compass</DialogTitle>
                        <DialogDescription>
                            Follow these steps to improve your compass accuracy.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-semibold">1</div>
                                <span>Move away from electronic devices and metal objects</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-semibold">2</div>
                                <span>Hold your phone and trace a figure-8 pattern in the air several times</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-semibold">3</div>
                                <span>Rotate your device in all three axes</span>
                            </div>
                        </div>

                        <div className="relative border rounded-lg p-4 mt-2">
                            <div className="flex justify-center items-center flex-col">
                                <div className="text-4xl mb-3">∞</div>
                                <div className="text-sm text-center text-gray-500">
                                    Figure-8 pattern is most effective for compass calibration
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={handleCalibrationComplete}>
                            I Have Done This
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}