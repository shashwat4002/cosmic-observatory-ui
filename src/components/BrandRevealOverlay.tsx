import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandRevealOverlayProps {
  onComplete: () => void;
}

const BrandRevealOverlayComponent = ({ onComplete }: BrandRevealOverlayProps) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(() => onComplete(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          className="fixed inset-0 z-[2] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Soft vignette */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'hold' ? 0.6 : 0 }}
            transition={{ duration: 1 }}
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, hsla(220, 20%, 5%, 0.7) 100%)',
            }}
          />

          {/* Logo */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{
              opacity: phase === 'hold' ? 1 : 0,
              scale: phase === 'hold' ? 1 : 0.95,
              y: phase === 'hold' ? 0 : 8,
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Subtle ambient glow behind text */}
            <div
              className="absolute -inset-20 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, hsla(191, 80%, 60%, 0.12) 0%, transparent 70%)',
              }}
            />

            {/* Logo text — clean, no heavy glow */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-[0.25em] text-foreground/90 select-none"
              style={{
                textShadow: '0 0 40px hsla(191, 80%, 65%, 0.15)',
                letterSpacing: '0.25em',
              }}
            >
              SOCHX
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-xs md:text-sm tracking-[0.4em] uppercase text-muted-foreground/60"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: phase === 'hold' ? 0.6 : 0, y: phase === 'hold' ? 0 : 6 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Research Reimagined
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export const BrandRevealOverlay = memo(BrandRevealOverlayComponent);
