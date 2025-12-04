import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import ChristmasTree from './ChristmasTree';
import IntroSnowflakes from './IntroSnowflakes';
import HandTracker from './HandTracker';
import { HandData, AppPhase } from '../types';

// Fix for TypeScript not recognizing R3F elements in JSX.IntrinsicElements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface SceneProps {
  colors: string[];
  handDataRef: React.MutableRefObject<HandData | null>;
  phase: AppPhase;
  setPhase: (phase: AppPhase) => void;
}

const InteractionHandler = ({ handDataRef, phase, setPhase }: { handDataRef: React.MutableRefObject<HandData | null>, phase: AppPhase, setPhase: (p: AppPhase) => void }) => {
  const { mouse } = useThree();
  
  useFrame(() => {
    // Fallback for mouse if no hand tracking or specific phase logic
    if (handDataRef.current) {
        if (!handDataRef.current.isTracking) {
             handDataRef.current.rawX = (mouse.x + 1) / 2;
             handDataRef.current.rawY = (mouse.y + 1) / 2;
        }

        // Logic Loop for Phases
        const gesture = handDataRef.current.gesture;

        if (phase === 'SNOW') {
            if (gesture === 'OPEN') {
                setPhase('GATHER');
            }
        } else if (phase === 'GATHER') {
            if (gesture === 'FIST') {
                setPhase('TREE');
            } else if (gesture === 'NONE') {
                // If they lose tracking or stop, maybe go back to snow? 
                // Let's keep it sticky for better UX, or revert slowly?
                // For now, let's allow reverting if they stop 'Opening' but haven't 'Fisted'
                // Actually, sticky GATHER is nicer, but let's see.
                setPhase('SNOW'); 
            }
        }
    }
  });
  return null;
};

const SceneContainer: React.FC<SceneProps> = ({ colors, handDataRef, phase, setPhase }) => {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-quantum-dark">
      {/* Hand Tracker runs outside canvas (it manages DOM video) but updates ref */}
      <HandTracker handDataRef={handDataRef} />

      <Canvas 
        camera={{ position: [0, 2, 12], fov: 45 }} 
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050510']} />
        
        <Suspense fallback={null}>
            <Environment preset="night" />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            <ambientLight intensity={0.5} color="#00F0FF" />
            <pointLight position={[10, 10, 10]} intensity={1} color="#FF0066" />
            <spotLight position={[0, 10, 0]} intensity={2} angle={0.5} penumbra={1} color="#FFFFFF" />

            <IntroSnowflakes handDataRef={handDataRef} phase={phase} />
            <ChristmasTree visible={phase === 'TREE'} colors={colors} handDataRef={handDataRef} />
            
            <InteractionHandler handDataRef={handDataRef} phase={phase} setPhase={setPhase} />
        </Suspense>

        <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
            minDistance={5}
            maxDistance={20}
        />
      </Canvas>
    </div>
  );
};

export default SceneContainer;