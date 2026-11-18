import React from 'react';

interface GlowOrbProps {
  className?: string;
  variant?: 'orange' | 'amber' | 'crimson' | 'mesh';
}

export const GlowOrb: React.FC<GlowOrbProps> = ({ className = '', variant = 'orange' }) => {
  if (variant === 'mesh') {
    return (
      <div 
        className={`pointer-events-none absolute select-none opacity-40 blur-3xl mix-blend-screen overflow-hidden ${className}`}
        aria-hidden="true"
      >
        <div className="w-[600px] h-[450px] bg-gradient-to-tr from-[#FF7135] via-[#E11D48]/30 to-[#F59E0B]/20 rounded-full animate-pulse-glow" />
      </div>
    );
  }

  const gradientMap = {
    orange: 'from-[#FF7135]/25 via-[#FF5500]/10 to-transparent',
    amber: 'from-[#F59E0B]/20 via-[#FF7135]/10 to-transparent',
    crimson: 'from-[#E11D48]/20 via-[#FF7135]/15 to-transparent',
  };

  return (
    <div 
      className={`pointer-events-none absolute rounded-full bg-radial-gradient ${gradientMap[variant]} blur-[90px] select-none ${className}`}
      aria-hidden="true"
    />
  );
};
