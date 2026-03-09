'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Antigravity = dynamic(() => import('./Antigravity'), {
  ssr: false,
});

export function AntigravityBackground() {
  return (
    <div 
      className="fixed inset-0" 
      style={{ 
        zIndex: 1,
        pointerEvents: 'none'
      }}
    >
      <Suspense fallback={null}>
        <Antigravity
          count={150}
          magnetRadius={20}
          ringRadius={15}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={1.5}
          lerpSpeed={0.08}
          color="#a855f7"
          autoAnimate={true}
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={3}
          particleShape="sphere"
          fieldStrength={10}
        />
      </Suspense>
    </div>
  );
}
