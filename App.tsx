import React, { useState, useRef, useEffect } from 'react';
import SceneContainer from './components/SceneContainer';
import { HandData, AppState, AppPhase } from './types';
import { Share2, Volume2, VolumeX, Hand, Camera } from 'lucide-react';

const App: React.FC = () => {
  // Hand Data Ref is passed down to be mutable without re-renders
  const handDataRef = useRef<HandData | null>({ 
      rawX: 0.5, 
      rawY: 0.5, 
      gesture: 'NONE', 
      isTracking: false 
  });
  
  const [state, setState] = useState<AppState>({
    colors: ['#00F0FF', '#7000FF', '#FF0066', '#FFD700', '#FFFFFF'],
    greeting: "Welcome to the Quantum Holiday experience.",
    loading: false,
    themeName: "Default Quantum",
    musicMood: "Ethereal",
    isPlayingMusic: false,
    phase: 'SNOW'
  });
  
  // Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Update audio when colors change if playing
  useEffect(() => {
    if (state.isPlayingMusic) {
      updateAudioDrone();
    }
  }, [state.colors]);

  const hexToFreq = (hex: string, base: number = 200) => {
     const val = parseInt(hex.replace('#', ''), 16);
     const offset = val % 300;
     return base + offset;
  };

  const startAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2); 
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    updateAudioDrone();
    
    setState(prev => ({ ...prev, isPlayingMusic: true }));
  };

  const stopAudio = () => {
    if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
        gainRef.current.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 1);
        
        setTimeout(() => {
            oscillatorsRef.current.forEach(osc => osc.stop());
            oscillatorsRef.current = [];
            audioCtxRef.current?.close();
            audioCtxRef.current = null;
            gainRef.current = null;
        }, 1000);
    }
    setState(prev => ({ ...prev, isPlayingMusic: false }));
  };

  const updateAudioDrone = () => {
     if (!audioCtxRef.current || !gainRef.current) return;
     
     const ctx = audioCtxRef.current;
     const now = ctx.currentTime;

     oscillatorsRef.current.forEach(osc => {
         try {
            // @ts-ignore
             const g = osc.tempGain; 
             if(g) g.gain.exponentialRampToValueAtTime(0.001, now + 1);
             osc.stop(now + 1.1);
         } catch(e) {}
     });
     oscillatorsRef.current = [];

     state.colors.slice(0, 3).forEach((color, i) => {
        const freq = hexToFreq(color, 150 + (i * 100));
        
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.3, now + 2);
        
        osc.detune.value = (Math.random() - 0.5) * 10;

        osc.connect(oscGain);
        oscGain.connect(gainRef.current!);
        osc.start();
        
        // @ts-ignore
        osc.tempGain = oscGain;
        oscillatorsRef.current.push(osc);
     });
  };

  const toggleAmbiance = () => {
      if (state.isPlayingMusic) {
          stopAudio();
      } else {
          startAudio();
      }
  };

  const setPhase = (p: AppPhase) => {
      setState(prev => ({ ...prev, phase: p }));
  };

  // Helper to get status text based on phase
  const getStatusText = () => {
      if (state.phase === 'SNOW') return "SHOW OPEN HAND TO GATHER ENERGY";
      if (state.phase === 'GATHER') return "MAKE A FIST TO RELEASE";
      if (state.phase === 'TREE') return "QUANTUM TREE STABILIZED";
      return "INITIALIZING...";
  };

  return (
    <div className="w-full h-screen relative font-sans overflow-hidden bg-black text-white selection:bg-cyan-500 selection:text-black">
      
      {/* 3D Scene Background */}
      <SceneContainer 
        colors={state.colors} 
        handDataRef={handDataRef} 
        phase={state.phase}
        setPhase={setPhase}
      />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h1 className="text-4xl font-mono font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]">
            QUANTUM<br/>TREE
          </h1>
          <p className="mt-2 text-sm text-cyan-200/70 max-w-xs font-light">
            Interactive Holographic Display<br/>
            Status: <span className="text-green-400 animate-pulse">{getStatusText()}</span>
          </p>
        </div>
      </div>

      {/* Main Controls Bottom */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-10 pointer-events-none flex flex-col items-center justify-end h-auto">
        
        <div className="w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto transition-all">
          
          {/* Interaction Hints */}
          <div className="flex justify-between items-center text-xs text-white/50 font-mono">
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <Camera size={14} className="text-cyan-400"/>
                    <span>CAMERA REQUIRED</span>
                 </div>
                 <div className={`flex items-center gap-2 transition-colors ${state.phase === 'SNOW' ? 'text-white' : ''}`}>
                    <Hand size={14}/>
                    <span>OPEN HAND: GATHER</span>
                 </div>
                 <div className={`flex items-center gap-2 transition-colors ${state.phase === 'GATHER' ? 'text-white' : ''}`}>
                    <div className="w-3 h-3 rounded-full border border-current bg-current"></div>
                    <span>FIST: RELEASE</span>
                 </div>
             </div>
             
             <div className="flex gap-4">
                <button 
                    onClick={toggleAmbiance}
                    className={`flex items-center gap-1 cursor-pointer transition-colors ${state.isPlayingMusic ? 'text-cyan-400 animate-pulse' : 'hover:text-cyan-400'}`}
                >
                    {state.isPlayingMusic ? <Volume2 size={12}/> : <VolumeX size={12}/>}
                    AMBIANCE {state.isPlayingMusic ? 'ON' : 'OFF'}
                </button>
                <span className="flex items-center gap-1 hover:text-cyan-400 cursor-pointer transition-colors"><Share2 size={12}/> SHARE</span>
             </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default App;