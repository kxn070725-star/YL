import React, { useEffect, useRef } from 'react';
import { HandData, GestureType } from '../types';

interface HandTrackerProps {
  handDataRef: React.MutableRefObject<HandData | null>;
}

// MediaPipe globals via script tags
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

const HandTracker: React.FC<HandTrackerProps> = ({ handDataRef }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!window.Hands || !window.Camera || !videoRef.current) {
      console.warn("MediaPipe scripts not loaded or video element missing");
      return;
    }

    const hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // 1. Calculate Cursor Position (Index Finger Tip)
        // MediaPipe coords: x (0 left - 1 right), y (0 top - 1 bottom)
        // Three.js often expects 0 to be center, but we map in SceneContainer
        const indexTip = landmarks[8];
        const wrist = landmarks[0];

        // 2. Gesture Recognition
        let gesture: GestureType = 'NONE';
        
        // Calculate distance of fingertips to wrist to detect Fist vs Open
        // Tips: 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
        const tips = [8, 12, 16, 20];
        let totalDist = 0;
        
        tips.forEach(idx => {
            const tip = landmarks[idx];
            const d = Math.sqrt(Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2));
            totalDist += d;
        });

        const avgDist = totalDist / 4;

        // Thresholds need tuning based on camera distance, but relative comparison works
        // Open hand usually has avgDist > 0.3 (approx)
        // Fist usually has avgDist < 0.15 (approx)
        
        // Let's use a simpler heuristic: Are fingers extended?
        // Check if tip is higher (lower y value) than PIP joint (knuckle)
        // This is tricky with rotation. Distance is more robust.
        
        if (avgDist > 0.25) {
            gesture = 'OPEN';
        } else if (avgDist < 0.15) {
            gesture = 'FIST';
        }

        // Update Ref
        if (handDataRef.current) {
            // Mirror X for intuitive feel
            handDataRef.current.rawX = 1 - indexTip.x;
            handDataRef.current.rawY = indexTip.y;
            handDataRef.current.gesture = gesture;
            handDataRef.current.isTracking = true;
        }
      } else {
          if (handDataRef.current) {
              handDataRef.current.isTracking = false;
              handDataRef.current.gesture = 'NONE';
          }
      }
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
       // Cleanup logic if needed, though Camera utils doesn't have a clear stop()
       // stopping the tracks manually
       if (videoRef.current && videoRef.current.srcObject) {
           const stream = videoRef.current.srcObject as MediaStream;
           stream.getTracks().forEach(track => track.stop());
       }
    };
  }, []);

  return (
    // Hidden video element for processing
    <video 
        ref={videoRef} 
        className="hidden" 
        style={{ display: 'none' }} 
        playsInline 
        muted // Adding muted is critical for autoplay policies
    />
  );
};

export default HandTracker;