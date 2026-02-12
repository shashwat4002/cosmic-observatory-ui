import { memo, useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MousePos {
  x: number;
  y: number;
}

const useMousePosition = () => {
  const [pos, setPos] = useState<MousePos>({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return pos;
};

/* ─── The Observer ─── */
const Observer = memo(({ mouse }: { mouse: MousePos }) => {
  const eyeX = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const eyeY = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });

  useEffect(() => {
    eyeX.set((mouse.x - 0.5) * 3);
    eyeY.set((mouse.y - 0.5) * 2);
  }, [mouse.x, mouse.y, eyeX, eyeY]);

  return (
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 1 }}
    >
      {/* Body - soft rounded shape peeking from bottom-left */}
      <motion.ellipse
        cx="60" cy="320" rx="40" ry="50"
        fill="hsl(216 60% 18%)"
        stroke="hsl(191 100% 62% / 0.3)"
        strokeWidth="1"
        animate={{ cy: [320, 316, 320] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Glasses */}
      <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        {/* Left lens */}
        <circle cx="48" cy="300" r="10" fill="none" stroke="hsl(191 100% 62% / 0.6)" strokeWidth="1.5" />
        {/* Right lens */}
        <circle cx="72" cy="300" r="10" fill="none" stroke="hsl(191 100% 62% / 0.6)" strokeWidth="1.5" />
        {/* Bridge */}
        <line x1="58" y1="300" x2="62" y2="300" stroke="hsl(191 100% 62% / 0.4)" strokeWidth="1" />
        {/* Left eye */}
        <motion.circle cx="48" cy="300" r="2.5" fill="hsl(191 100% 62% / 0.8)" style={{ x: eyeX, y: eyeY }} />
        {/* Right eye */}
        <motion.circle cx="72" cy="300" r="2.5" fill="hsl(191 100% 62% / 0.8)" style={{ x: eyeX, y: eyeY }} />
      </motion.g>
      {/* Soft glow */}
      <circle cx="60" cy="300" r="30" fill="hsl(191 100% 62% / 0.04)" />
    </motion.g>
  );
});
Observer.displayName = 'Observer';

/* ─── The Analyst ─── */
const Analyst = memo(({ mouse }: { mouse: MousePos }) => {
  const tilt = useSpring(useMotionValue(0), { stiffness: 60, damping: 15 });

  useEffect(() => {
    tilt.set((mouse.x - 0.5) * 8);
  }, [mouse.x, tilt]);

  return (
    <motion.g
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8, duration: 1 }}
    >
      {/* Body */}
      <motion.rect
        x="10" y="140" width="55" height="65" rx="20"
        fill="hsl(216 60% 16%)"
        stroke="hsl(223 100% 64% / 0.25)"
        strokeWidth="1"
        animate={{ y: [140, 137, 140] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Head tilt */}
      <motion.g style={{ rotate: tilt }} animate={{ y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        {/* Eye left */}
        <circle cx="28" cy="160" r="2" fill="hsl(223 100% 64% / 0.7)" />
        {/* Eye right */}
        <circle cx="48" cy="160" r="2" fill="hsl(223 100% 64% / 0.7)" />
        {/* Subtle mouth */}
        <path d="M 30 170 Q 38 174 46 170" fill="none" stroke="hsl(223 100% 64% / 0.3)" strokeWidth="1" strokeLinecap="round" />
      </motion.g>
      {/* Tablet/notebook */}
      <motion.rect
        x="55" y="165" width="18" height="24" rx="3"
        fill="hsl(216 60% 20%)"
        stroke="hsl(223 100% 64% / 0.3)"
        strokeWidth="0.8"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tablet lines */}
      <line x1="59" y1="172" x2="69" y2="172" stroke="hsl(223 100% 64% / 0.2)" strokeWidth="0.5" />
      <line x1="59" y1="176" x2="67" y2="176" stroke="hsl(223 100% 64% / 0.2)" strokeWidth="0.5" />
      <line x1="59" y1="180" x2="65" y2="180" stroke="hsl(223 100% 64% / 0.2)" strokeWidth="0.5" />
      {/* Glow */}
      <circle cx="38" cy="165" r="25" fill="hsl(223 100% 64% / 0.03)" />
    </motion.g>
  );
});
Analyst.displayName = 'Analyst';

/* ─── The Explorer ─── */
const Explorer = memo(({ mouse }: { mouse: MousePos }) => {
  const lookX = useSpring(useMotionValue(0), { stiffness: 50, damping: 18 });

  useEffect(() => {
    lookX.set((mouse.x - 0.5) * 5);
  }, [mouse.x, lookX]);

  return (
    <motion.g
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.1, duration: 1 }}
    >
      {/* Body partially off right edge */}
      <motion.ellipse
        cx="95" cy="80" rx="35" ry="40"
        fill="hsl(216 60% 17%)"
        stroke="hsl(260 60% 55% / 0.25)"
        strokeWidth="1"
        animate={{ cy: [80, 76, 80] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Eye */}
      <motion.g animate={{ cy: [0, -4, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx="78" cy="72" r="3" fill="hsl(260 60% 55% / 0.7)" />
        <motion.circle cx="78" cy="72" r="1.5" fill="hsl(260 60% 70% / 0.9)" style={{ x: lookX }} />
      </motion.g>
      {/* Telescope */}
      <motion.g
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: '70px', originY: '60px' }}
      >
        <line x1="70" y1="58" x2="50" y2="40" stroke="hsl(260 60% 55% / 0.4)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="38" r="5" fill="none" stroke="hsl(260 60% 55% / 0.3)" strokeWidth="1" />
        <circle cx="48" cy="38" r="2" fill="hsl(260 60% 55% / 0.15)" />
      </motion.g>
      {/* Glow */}
      <circle cx="80" cy="75" r="25" fill="hsl(260 60% 55% / 0.03)" />
    </motion.g>
  );
});
Explorer.displayName = 'Explorer';

/* ─── The Archivist ─── */
const Archivist = memo(({ mouse }: { mouse: MousePos }) => {
  return (
    <motion.g
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 1 }}
    >
      {/* Floating scroll/paper */}
      <motion.g
        animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="15" y="240" width="20" height="28" rx="3" fill="hsl(216 60% 18%)" stroke="hsl(191 100% 62% / 0.15)" strokeWidth="0.8" />
        {/* Text lines on scroll */}
        <line x1="19" y1="248" x2="31" y2="248" stroke="hsl(191 100% 62% / 0.15)" strokeWidth="0.5" />
        <line x1="19" y1="252" x2="29" y2="252" stroke="hsl(191 100% 62% / 0.15)" strokeWidth="0.5" />
        <line x1="19" y1="256" x2="27" y2="256" stroke="hsl(191 100% 62% / 0.15)" strokeWidth="0.5" />
        <line x1="19" y1="260" x2="30" y2="260" stroke="hsl(191 100% 62% / 0.15)" strokeWidth="0.5" />
      </motion.g>
      {/* Tiny sparkle */}
      <motion.circle
        cx="38" cy="242"
        r="1.5"
        fill="hsl(191 100% 62% / 0.5)"
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.g>
  );
});
Archivist.displayName = 'Archivist';

/* ─── Main Component ─── */
const ResearchCharactersComponent = () => {
  const mouse = useMousePosition();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Left side characters */}
      <svg
        className="absolute left-0 top-0 h-full w-[120px] opacity-70"
        viewBox="0 0 120 400"
        preserveAspectRatio="xMinYMid meet"
      >
        <Observer mouse={mouse} />
        <Analyst mouse={mouse} />
        <Archivist mouse={mouse} />
      </svg>
      {/* Right side character (Explorer peeking) */}
      <svg
        className="absolute right-0 top-0 h-[200px] w-[120px] opacity-60"
        viewBox="40 20 80 120"
        preserveAspectRatio="xMaxYMin meet"
      >
        <Explorer mouse={mouse} />
      </svg>
    </div>
  );
};

export const ResearchCharacters = memo(ResearchCharactersComponent);
