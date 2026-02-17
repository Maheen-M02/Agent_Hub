'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Antigravity = dynamic(() => import('./Antigravity'), {
  ssr: false,
});

export function AntigravityBackground() {
  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none" 
      style={{ 
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        mixBlendMode: 'screen'
      }}
    >
      <Suspense fallback={null}>
        <Antigravity
          count={200}
          magnetRadius={8}
          ringRadius={10}
          waveSpeed={0.4}
          waveAmplitude={1}
          particleSize={2.5}
          lerpSpeed={0.05}
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
