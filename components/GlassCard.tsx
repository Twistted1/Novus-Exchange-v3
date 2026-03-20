import React, { useRef, useEffect } from 'react';

// FIX: Extend props with React.HTMLAttributes to allow passing standard div props like onClick.
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, ...rest }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`glass-card bg-white/[.08] backdrop-blur-3xl border border-white/25 shadow-2xl shadow-black/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-400/40 ${className || ''}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default GlassCard;