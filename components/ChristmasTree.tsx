import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader, ThreeElements } from '@react-three/fiber';
import { Group, MathUtils, TextureLoader, AdditiveBlending, Vector3, Color, Points, CatmullRomCurve3, TubeGeometry, Mesh } from 'three';
import { HandData } from '../types';

// Fix for TypeScript not recognizing R3F elements in JSX.IntrinsicElements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// HSR / Quantum Palette - Dimmed White
const HSR_PALETTE = [
    '#00F0FF', // Seele Cyan
    '#7000FF', // Quantum Violet
    '#FF0066', // Silver Wolf Magenta
    '#FFD700', // Imaginary Gold
    '#D0D0FF', // Starlight White (Dimmed from #FFFFFF)
];

interface Props {
  visible: boolean;
  colors: string[]; // specific theme colors passed from API
  handDataRef: React.MutableRefObject<HandData | null>;
}

// --- Decoration Components ---

const PhotoOrnament = ({ position, rotation, url }: { position: [number, number, number], rotation: [number, number, number], url: string }) => {
   const texture = useLoader(TextureLoader, url);
   return (
     <group position={position} rotation={rotation}>
       {/* Energy Tether */}
       <mesh position={[0, 0.6, 0]}>
         <cylinderGeometry args={[0.01, 0.01, 1.2]} />
         <meshBasicMaterial color={HSR_PALETTE[0]} transparent opacity={0.3} blending={AdditiveBlending} />
       </mesh>
       {/* Holographic Frame */}
       <mesh>
         <planeGeometry args={[1.2, 1.5]} />
         <meshBasicMaterial map={texture} side={2} transparent opacity={0.7} />
         <mesh position={[0,0,-0.02]}>
            <boxGeometry args={[1.3, 1.6, 0.05]} />
            <meshBasicMaterial color={HSR_PALETTE[0]} wireframe opacity={0.4} transparent />
         </mesh>
       </mesh>
     </group>
   )
}

const HolographicBell = ({ position, color, size = 1 }: { position: [number, number, number], color: string, size?: number }) => {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if(ref.current) {
        // Gentle swing
        ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
        ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5 + position[2]) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position}>
       <group scale={size}>
          {/* Bell Body */}
          <mesh position={[0, -0.25, 0]}>
             <cylinderGeometry args={[0.05, 0.35, 0.5, 16, 4, true]} />
             <meshBasicMaterial color={color} wireframe transparent opacity={0.4} blending={AdditiveBlending} side={2} />
          </mesh>
          {/* Inner Glow */}
          <mesh position={[0, -0.25, 0]}>
             <cylinderGeometry args={[0.04, 0.3, 0.48, 16]} />
             <meshBasicMaterial color={color} transparent opacity={0.08} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* Clapper - Dimmed */}
          <mesh position={[0, -0.4, 0]}>
             <sphereGeometry args={[0.08]} />
             <meshBasicMaterial color="#E0E0E0" opacity={0.5} transparent />
          </mesh>
          {/* Ring/Hook */}
          <mesh position={[0, 0.05, 0]} rotation={[0,0,Math.PI/2]}>
             <torusGeometry args={[0.08, 0.02, 8, 16]} />
             <meshBasicMaterial color={color} opacity={0.5} transparent />
          </mesh>
       </group>
    </group>
  )
}

const SpinningStar = ({ position, color, size = 1 }: { position: [number, number, number], color: string, size?: number }) => {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) {
      // Complex multi-axis rotation
      ref.current.rotation.y += 0.03;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      ref.current.rotation.z += 0.01;
    }
  });

  return (
    <group ref={ref} position={position} scale={size}>
       {/* Main Star Body */}
       <mesh>
         <octahedronGeometry args={[0.25, 0]} />
         <meshBasicMaterial color={color} wireframe transparent opacity={0.4} blending={AdditiveBlending} />
       </mesh>
       {/* Intersecting Geometry for 'Merkaba' look */}
       <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
         <octahedronGeometry args={[0.25, 0]} />
         <meshBasicMaterial color={color} wireframe transparent opacity={0.25} blending={AdditiveBlending} />
       </mesh>
       {/* Bright Core - Significantly Dimmed */}
       <mesh scale={0.4}>
         <octahedronGeometry args={[0.25, 0]} />
         <meshBasicMaterial color="#E0E0FF" transparent opacity={0.4} blending={AdditiveBlending} />
       </mesh>
    </group>
  )
}

const TwinklingBauble = ({ position, color, size = 1 }: { position: [number, number, number], color: string, size?: number }) => {
  const ref = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  
  // Random phase to prevent synchronized blinking
  const phase = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
        // Slow rotation
        ref.current.rotation.y += 0.01;
    }
    if (glowRef.current) {
        // Twinkle effect on scale and opacity
        const pulse = Math.sin(t * 6 + phase);
        const opacity = 0.3 + pulse * 0.15; // Reduced max opacity
        // @ts-ignore
        glowRef.current.material.opacity = opacity;
        glowRef.current.scale.setScalar(0.7 + pulse * 0.1);
    }
  });

  return (
    <group position={position} scale={size}>
       {/* Wireframe Shell */}
       <mesh ref={ref}>
         <sphereGeometry args={[0.22, 12, 12]} />
         <meshBasicMaterial color={color} wireframe transparent opacity={0.2} blending={AdditiveBlending} />
       </mesh>
       {/* Glowing Pulsing Core */}
       <mesh ref={glowRef}>
         <sphereGeometry args={[0.18, 16, 16]} />
         <meshBasicMaterial color={color} transparent blending={AdditiveBlending} depthWrite={false} />
       </mesh>
    </group>
  )
}

const QuantumBauble = ({ position, color, size = 1 }: { position: [number, number, number], color: string, size?: number }) => {
    const ref = useRef<Group>(null);
    
    useFrame((state) => {
        if(ref.current) {
            ref.current.rotation.y += 0.02;
            ref.current.rotation.z += 0.01;
            // Pulse
            const s = 1 + Math.sin(state.clock.elapsedTime * 3 + position[1]) * 0.1;
            ref.current.scale.setScalar(s * size);
        }
    });

  return (
    <group ref={ref} position={position}>
      {/* Outer Shell */}
      <mesh>
        <icosahedronGeometry args={[0.25, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.25} blending={AdditiveBlending} />
      </mesh>
      {/* Inner Core - Dimmed */}
      <mesh scale={[0.6, 0.6, 0.6]}>
         <dodecahedronGeometry args={[0.25, 0]} />
         <meshBasicMaterial color="#D0D0FF" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

const ShiningTopStar = ({ position }: { position: [number, number, number] }) => {
    const ref = useRef<Group>(null);
    const glowRef = useRef<Mesh>(null);
    const rayGroupRef = useRef<Group>(null);
    
    const GOLD = "#FFD700";
    const GLOW = "#FFA500";

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if(ref.current) {
            // Complex rotation for the star body
            ref.current.rotation.y = t * 0.5;
            ref.current.rotation.z = Math.sin(t * 0.5) * 0.1;
        }
        if(glowRef.current) {
            // Pulsing halo
            const s = 1.5 + Math.sin(t * 4) * 0.2;
            glowRef.current.scale.setScalar(s);
            // @ts-ignore
            if (glowRef.current.material) glowRef.current.material.opacity = 0.15 + Math.sin(t * 3) * 0.05;
        }
        if (rayGroupRef.current) {
             // Slowly rotate the rays
             rayGroupRef.current.rotation.z = -t * 0.1;
        }
    });

    return (
        <group position={position} scale={0.4}>
            {/* Bright Point Light casting gold light */}
            <pointLight distance={25} intensity={3} color={GOLD} decay={2} />

            {/* Main Star Structure */}
            <group ref={ref}>
                {/* Center Core */}
                <mesh>
                    <dodecahedronGeometry args={[0.4, 0]} />
                    <meshBasicMaterial color={GOLD} />
                </mesh>
                
                {/* Long Spikes (Compass Star Shape) */}
                {/* Vertical */}
                <mesh scale={[0.4, 3, 0.4]}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color={GOLD} />
                </mesh>
                {/* Horizontal */}
                <mesh scale={[3, 0.4, 0.4]}>
                     <octahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color={GOLD} />
                </mesh>
                 {/* Z-Axis */}
                <mesh scale={[0.4, 0.4, 3]}>
                     <octahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color={GOLD} />
                </mesh>

                {/* Diagonal Fillers */}
                <mesh rotation={[0,0,Math.PI/4]} scale={1.2}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color={GLOW} wireframe transparent opacity={0.5} blending={AdditiveBlending} />
                </mesh>
            </group>

            {/* Radiating Light Beams (Static but glowing) */}
            <group ref={rayGroupRef}>
                {[...Array(16)].map((_, i) => (
                    <mesh key={i} rotation={[0, 0, (i/16) * Math.PI * 2]}>
                         <planeGeometry args={[0.08, 6]} />
                         <meshBasicMaterial color={GOLD} transparent opacity={0.12} blending={AdditiveBlending} side={2} depthWrite={false} />
                    </mesh>
                ))}
            </group>

            {/* Pulsing Halo Sphere */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshBasicMaterial color={GOLD} transparent opacity={0.15} blending={AdditiveBlending} depthWrite={false} />
            </mesh>
        </group>
    )
}

const HelixRibbon = ({ radius, height, turns, color, speed, width }: { radius: number, height: number, turns: number, color: string, speed: number, width: number }) => {
    const meshRef = useRef<Mesh>(null);
    
    const geometry = useMemo(() => {
        const points = [];
        const count = 100;
        for (let i = 0; i <= count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 2 * turns;
            // Tapered radius (Cone shape)
            const r = (1 - t) * radius; 
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const y = (t * height) - (height * 0.2); // Start slightly lower
            points.push(new Vector3(x, y, z));
        }
        const curve = new CatmullRomCurve3(points);
        return new TubeGeometry(curve, 64, width, 3, false); // 3 radial segments for crystal look
    }, [radius, height, turns, width]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * speed;
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshBasicMaterial color={color} transparent opacity={0.25} wireframe={true} blending={AdditiveBlending} />
        </mesh>
    );
};

// --- Tree Generation Logic ---

interface TreeData {
    positions: Float32Array;
    colors: Float32Array;
    decorations: DecorationData[];
}

interface DecorationData {
    type: 'photo' | 'bell' | 'spinning_star' | 'twinkling_bauble' | 'bauble';
    position: [number, number, number];
    rotation?: [number, number, number];
    color?: string;
    id: string;
    size?: number;
    url?: string;
}

const useTreeData = (colors: string[]): TreeData => {
    return useMemo(() => {
        const points: number[] = [];
        const pointColors: number[] = [];
        const decorations: DecorationData[] = [];
        
        const combinedPalette = [...colors, ...HSR_PALETTE];
        
        // Tree Parameters
        const treeHeight = 11;
        const trunkBaseY = -3.5;
        const maxRadius = 5.5; // Slightly wider for majesty
        const totalBranches = 140; // Increased density for fuller look
        
        // Helper to add a point
        const addPoint = (x: number, y: number, z: number, colorHex: string, brightnessMod = 1.0) => {
            // Cap brightness to avoid overexposure
            // If color is white/light, reduce it further
            let mod = Math.min(brightnessMod, 0.9);
            if (colorHex.toLowerCase() === '#ffffff' || colorHex.toLowerCase() === '#fff') {
                mod *= 0.7; 
            }
            const c = new Color(colorHex).multiplyScalar(mod);
            points.push(x, y, z);
            pointColors.push(c.r, c.g, c.b);
        };

        // Recursive/Fractal Branch Generator
        const generateBranch = (
            startX: number, startY: number, startZ: number, 
            directionAngle: number, length: number, 
            droopFactor: number, 
            depth: number
        ) => {
            const segments = 15; // Smooth long branches
            let currentX = startX;
            let currentY = startY;
            let currentZ = startZ;
            
            // Calculate direction vector
            let dirX = Math.cos(directionAngle);
            let dirZ = Math.sin(directionAngle);
            let dirY = 0.25; // Initial upward perk

            for (let s = 0; s < segments; s++) {
                const progress = s / segments;
                const stepSize = length / segments;

                // Physics: Droop increases with distance
                dirY -= droopFactor * 0.12 * progress; 
                
                // Move "turtle"
                currentX += dirX * stepSize;
                currentY += dirY * stepSize;
                currentZ += dirZ * stepSize;

                // --- Foliage Generation ---
                // Add volume around this segment
                const volumeSpread = (1.0 - progress) * (depth === 0 ? 0.7 : 0.4);
                
                // Density of points at this segment - High Density
                const density = depth === 0 ? 20 : 8; 

                for (let p = 0; p < density; p++) {
                    // Random scatter within volume
                    const px = currentX + (Math.random() - 0.5) * volumeSpread;
                    const py = currentY + (Math.random() - 0.5) * volumeSpread * 0.8;
                    const pz = currentZ + (Math.random() - 0.5) * volumeSpread;

                    const col = combinedPalette[Math.floor(Math.random() * combinedPalette.length)];
                    // Tips are slightly brighter, but base is dimmer
                    addPoint(px, py, pz, col, 0.4 + progress * 0.3);
                }

                // --- Sub-branching (Irregularity) ---
                // Random chance to spawn a spur - Increased probability and variety
                if (depth === 0 && Math.random() < 0.45 && s > 1) {
                    const spurAngle = directionAngle + (Math.random() - 0.5) * 2.5; // Chaotic angles
                    const spurLength = length * 0.4 * (1 - progress);
                    // Chaotic droop: some go straight up, some hang
                    const spurDroop = Math.random() > 0.4 ? -0.2 : 0.3; 
                    
                    generateBranch(currentX, currentY, currentZ, spurAngle, spurLength, spurDroop, depth + 1);
                }
            }

            // --- Decoration Placement (Tip of Main Branches) ---
            if (depth === 0) {
                 const rand = Math.random();
                 const id = `deco-${startX}-${startY}-${Math.random()}`;
                 
                 // Push decoration out slightly past the tip
                 const tipX = currentX + dirX * 0.2;
                 const tipY = currentY - 0.2; // Hang below
                 const tipZ = currentZ + dirZ * 0.2;

                 // Only use the darker/richer colors for ornaments to avoid white explosion
                 const richPalette = colors.filter(c => c !== '#FFFFFF' && c !== '#ffffff');
                 // Fallback if palette is empty
                 if (richPalette.length === 0) richPalette.push(HSR_PALETTE[2]); 
                 
                 const colorPool = [...richPalette, HSR_PALETTE[2], HSR_PALETTE[3]]; 

                 // Adjusted probabilities for variety
                 if (rand > 0.96) { // Reduced photo probability
                    decorations.push({
                        type: 'photo',
                        position: [tipX, tipY - 0.3, tipZ],
                        rotation: [0, -directionAngle + Math.PI / 2, 0],
                        id,
                        url: `https://picsum.photos/200/300?random=${id}`
                    });
                 } else if (rand > 0.8) {
                    decorations.push({
                        type: 'bell',
                        position: [tipX, tipY, tipZ],
                        color: HSR_PALETTE[Math.floor(Math.random() * HSR_PALETTE.length)],
                        id,
                        size: 0.6 + Math.random() * 0.4
                    });
                 } else if (rand > 0.6) {
                    decorations.push({
                        type: 'spinning_star',
                        position: [tipX, tipY + 0.1, tipZ], // Sit on top
                        color: colorPool[Math.floor(Math.random() * colorPool.length)],
                        id,
                        size: 0.5 + Math.random() * 0.5
                    });
                 } else if (rand > 0.4) {
                    decorations.push({
                        type: 'twinkling_bauble',
                        position: [tipX, tipY, tipZ],
                        color: colorPool[Math.floor(Math.random() * colorPool.length)],
                        id,
                        size: 0.6 + Math.random() * 0.3
                    });
                 } else {
                     decorations.push({
                        type: 'bauble',
                        position: [tipX, tipY, tipZ],
                        color: colorPool[Math.floor(Math.random() * colorPool.length)],
                        id,
                        size: 0.5 + Math.random() * 0.8
                    });
                 }
            }
        };

        // Main Loop: Phyllotaxis (Golden Angle) Spirals
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.399 radians

        for (let i = 0; i < totalBranches; i++) {
            const t = i / totalBranches; // 0 (bottom) to 1 (top)
            
            // Height along trunk
            const y = trunkBaseY + (t * treeHeight);
            
            // Radius tapers as we go up
            const r = maxRadius * (1 - t) + 0.3;
            
            // Angle
            const theta = i * goldenAngle;
            
            // Random variance to break the perfect spiral look - Significantly increased for natural messiness
            const variance = (Math.random() - 0.5) * 1.2; 
            const angle = theta + variance;

            // Length variance ("Wabi-sabi" unevenness) - Range widened
            const length = r * (0.5 + Math.random() * 0.9);

            // Droop increases near bottom, upper branches reach up more
            // t=0 (bottom) -> high droop. t=1 (top) -> negative droop (pointing up)
            const droop = 0.6 - (t * 0.9); 

            generateBranch(0, y, 0, angle, length, droop, 0);
        }

        return {
            positions: new Float32Array(points),
            colors: new Float32Array(pointColors),
            decorations
        };
    }, [colors]);
};

// --- Main Component ---

const EmanatingParticles = ({ handDataRef, colors }: { handDataRef: React.MutableRefObject<HandData | null>, colors: string[] }) => {
    // Reduced count for less visual noise, focusing on the tree
    const count = 800; 
    const meshRef = useRef<Points>(null);
    
    // Store metadata for simulation
    const metaData = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            velocity: Math.random() * 0.03 + 0.01, // Slower ambient movement
            angle: Math.random() * Math.PI * 2,
            radius: Math.random() * 4.5,
            y: Math.random() * 10 - 4
        }));
    }, [count]);

    const positions = useMemo(() => new Float32Array(count * 3), [count]);
    const colorArray = useMemo(() => {
        const c = new Float32Array(count * 3);
        const _color = new Color();
        const combinedPalette = [...colors, ...HSR_PALETTE];
        for(let i=0; i<count; i++) {
            _color.set(combinedPalette[Math.floor(Math.random() * combinedPalette.length)]);
            // Fainter ambient particles
            _color.multiplyScalar(0.5); // Dimmed
            c[i*3] = _color.r;
            c[i*3+1] = _color.g;
            c[i*3+2] = _color.b;
        }
        return c;
    }, [count, colors]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        
        const handData = handDataRef.current;
        let speedMultiplier = 1;
        let rotationForce = 0.5;

        // Hand control
        if (handData && handData.gesture === 'NONE') {
            speedMultiplier = 0.5 + ((1 - handData.rawY) * 2); 
            rotationForce = (handData.rawX - 0.5) * 4; 
        }

        const positionsAttribute = meshRef.current.geometry.attributes.position;

        for(let i=0; i<count; i++) {
            const particle = metaData[i];

            // Move Up
            particle.y += particle.velocity * speedMultiplier * (delta * 60);

            // Rotate around center (Vortex)
            particle.angle += rotationForce * 0.01;

            const heightFactor = Math.max(0, (10 - (particle.y + 2)) / 10);
            const currentRadius = particle.radius * heightFactor;

            // Respawn
            if (particle.y > 8) {
                particle.y = -4;
                particle.radius = Math.random() * 5.0; 
            }

            const x = Math.cos(particle.angle) * currentRadius;
            const z = Math.sin(particle.angle) * currentRadius;

            positionsAttribute.setXYZ(i, x, particle.y, z);
        }

        positionsAttribute.needsUpdate = true;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colorArray}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                vertexColors
                transparent
                opacity={0.15} // Significantly reduced from 0.25
                sizeAttenuation
                blending={AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

const ChristmasTree: React.FC<Props> = ({ visible, colors, handDataRef }) => {
  const groupRef = useRef<Group>(null);

  // Generate tree data with the new unified hook
  const { positions, colors: pointColors, decorations } = useTreeData(colors);
  
  // Track animation time for reveal
  const revealTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const handData = handDataRef.current;
    
    let scaleControl = 0.5;
    let rotationSpeed = 0.2; 

    if (handData && visible && handData.gesture === 'NONE') {
        scaleControl = 1 - handData.rawY;
        rotationSpeed = handData.rawX * 0.3; // Lower sensitivity
    }

    if (visible) {
        // Animation logic: "Grow" effect
        revealTimeRef.current = MathUtils.lerp(revealTimeRef.current, 1, delta * 0.5);
    } else {
        revealTimeRef.current = 0;
    }

    const dynamicScale = 0.5 + scaleControl; 
    const finalScale = visible ? dynamicScale * revealTimeRef.current : 0;
    
    const lerpedScale = MathUtils.lerp(groupRef.current.scale.x, finalScale, 0.05);
    groupRef.current.scale.set(lerpedScale, lerpedScale, lerpedScale);

    if (visible) {
      const rot = (rotationSpeed - 0.15) * 0.02; // Slower interaction
      groupRef.current.rotation.y += rot + 0.0008; // Ultra slow majestic rotation
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, 0]} scale={[0,0,0]}>
      {/* Dynamic Emanating Particles */}
      <EmanatingParticles handDataRef={handDataRef} colors={colors} />

      {/* Wrapping Helix Ribbons */}
      <HelixRibbon radius={3.5} height={9} turns={3} color={HSR_PALETTE[0]} speed={0.05} width={0.05} />
      <HelixRibbon radius={3.8} height={9} turns={2.5} color={HSR_PALETTE[2]} speed={-0.03} width={0.03} />

      {/* Main Fractal Tree Points */}
      <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={pointColors.length / 3}
                    array={pointColors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.06} // Slightly reduced from 0.07
                vertexColors
                transparent
                opacity={0.3} // Reduced from 0.45 to prevent exposure blowout
                sizeAttenuation
                blending={AdditiveBlending}
                depthWrite={false}
            />
      </points>
      
      {/* Central Beam/Trunk */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.1, 0.5, 8, 8]} />
        <meshBasicMaterial color={HSR_PALETTE[1]} transparent opacity={0.3} blending={AdditiveBlending} />
      </mesh>

      {/* Top Star */}
      <ShiningTopStar position={[0, 7.8, 0]} />

      {/* Decorations */}
      {decorations.map((deco) => {
        if (deco.type === 'photo') {
            return (
             <PhotoOrnament 
                key={deco.id} 
                position={deco.position} 
                rotation={deco.rotation || [0,0,0]}
                url={deco.url!}
            />
            );
        } else if (deco.type === 'bell') {
             return (
             <HolographicBell 
                key={deco.id} 
                position={deco.position} 
                color={deco.color!} 
                size={deco.size}
             />
             );
        } else if (deco.type === 'spinning_star') {
             return (
             <SpinningStar 
                key={deco.id} 
                position={deco.position} 
                color={deco.color!} 
                size={deco.size}
             />
             );
        } else if (deco.type === 'twinkling_bauble') {
             return (
             <TwinklingBauble 
                key={deco.id} 
                position={deco.position} 
                color={deco.color!} 
                size={deco.size}
             />
             );
        } else {
             return (
             <QuantumBauble 
                key={deco.id} 
                position={deco.position} 
                color={deco.color!} 
                size={deco.size}
             />
             );
        }
      })}
    </group>
  );
};

export default ChristmasTree;