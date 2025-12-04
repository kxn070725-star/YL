import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, Vector3, Color, AdditiveBlending, MathUtils } from 'three';
import { HandData, AppPhase } from '../types';

interface IntroSnowflakesProps {
    handDataRef: React.MutableRefObject<HandData | null>;
    phase: AppPhase;
}

const IntroSnowflakes: React.FC<IntroSnowflakesProps> = ({ handDataRef, phase }) => {
    const count = 3000;
    const meshRef = useRef<Points>(null);

    // Initial random positions and velocities
    const initialData = useMemo(() => {
        const p = new Float32Array(count * 3);
        const v = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            p[i*3] = (Math.random() - 0.5) * 25; 
            p[i*3+1] = (Math.random() - 0.5) * 25;   
            p[i*3+2] = (Math.random() - 0.5) * 10; 
            
            v[i*3] = (Math.random() - 0.5) * 0.02;
            v[i*3+1] = (Math.random() - 0.5) * 0.02;
            v[i*3+2] = (Math.random() - 0.5) * 0.02;
        }
        return { positions: p, velocities: v };
    }, [count]);

    // Target positions for the "Blue Snowflake" shape
    const targetPositions = useMemo(() => {
        const t = new Float32Array(count * 3);
        const arms = 6;
        for(let i=0; i<count; i++) {
            // Assign each particle to an arm
            const armIndex = i % arms;
            const angle = (armIndex / arms) * Math.PI * 2;
            
            // Distance from center along the arm
            const dist = Math.random() * 6; // Radius size
            
            // Add some width to the arm (branching)
            const widthOffset = (Math.random() - 0.5) * (dist * 0.5); // Wider at tips
            
            // Fractal-ish branching simulation
            // Rotate the widthOffset by the arm angle + 90 deg
            const px = Math.cos(angle) * dist + Math.cos(angle + Math.PI/2) * widthOffset;
            const py = Math.sin(angle) * dist + Math.sin(angle + Math.PI/2) * widthOffset;
            
            t[i*3] = px;
            t[i*3+1] = py;
            t[i*3+2] = (Math.random() - 0.5) * 0.5; // Flat z-plane
        }
        return t;
    }, [count]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        
        const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
        const colors = meshRef.current.geometry.attributes.color.array as Float32Array;
        
        // Lerp factor
        const lerpSpeed = delta * 2.5;

        // Colors
        const white = new Color('#E0FFFF');
        const blue = new Color('#0088FF');
        
        const currentTime = state.clock.elapsedTime;

        for(let i=0; i<count; i++) {
            let cx = positions[i*3];
            let cy = positions[i*3+1];
            let cz = positions[i*3+2];

            if (phase === 'SNOW') {
                // Random drift behavior
                cx += initialData.velocities[i*3] + Math.sin(currentTime + cy) * 0.01;
                cy += initialData.velocities[i*3+1] - 0.01; // Gravity
                cz += initialData.velocities[i*3+2];

                // Respawn if too low
                if (cy < -10) cy = 10;
                
                // Color is whiteish
                colors[i*3] = white.r;
                colors[i*3+1] = white.g;
                colors[i*3+2] = white.b;

            } else if (phase === 'GATHER') {
                // Move towards target position (Blue Snowflake)
                const tx = targetPositions[i*3];
                const ty = targetPositions[i*3+1];
                const tz = targetPositions[i*3+2];

                cx = MathUtils.lerp(cx, tx, lerpSpeed);
                cy = MathUtils.lerp(cy, ty, lerpSpeed);
                cz = MathUtils.lerp(cz, tz, lerpSpeed);
                
                // Swirl effect while gathering
                const swirlStrength = 0.5 * (1 - Math.min(1, lerpSpeed)); // Less swirl as it settles
                const angle = 2 * delta;
                const nx = cx * Math.cos(angle) - cz * Math.sin(angle);
                const nz = cx * Math.sin(angle) + cz * Math.cos(angle);
                // Actually, let's just rotate the whole group, but here we do simple drift correction
                
                // Color shifts to Blue
                colors[i*3] = MathUtils.lerp(colors[i*3], blue.r, lerpSpeed);
                colors[i*3+1] = MathUtils.lerp(colors[i*3+1], blue.g, lerpSpeed);
                colors[i*3+2] = MathUtils.lerp(colors[i*3+2], blue.b, lerpSpeed);

            } else if (phase === 'TREE') {
                // Explosion / Fall down
                // Move away from center rapidly then down
                const dist = Math.sqrt(cx*cx + cz*cz);
                cx += (cx / (dist+0.1)) * 0.1; // Explode out
                cz += (cz / (dist+0.1)) * 0.1;
                
                cy -= 0.2 + (Math.random() * 0.2); // Fall fast
                
                // Fade to transparent (via y position hack or opacity logic in shader, here strictly position)
                if (cy < -10) cy = -100; // Hide
            }

            positions[i*3] = cx;
            positions[i*3+1] = cy;
            positions[i*3+2] = cz;
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true;
        meshRef.current.geometry.attributes.color.needsUpdate = true;
        
        // Gentle rotation of the whole system
        if (phase === 'GATHER') {
             meshRef.current.rotation.z += delta * 0.2;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={initialData.positions.slice()} // Copy initial
                    itemSize={3}
                />
                 <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={new Float32Array(count * 3).fill(1)} // Start white
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default IntroSnowflakes;