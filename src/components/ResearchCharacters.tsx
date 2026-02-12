import { memo, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const useMousePosition = () => {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return pos;
};

/* ─── The Observer (tall coral one-eyed) ─── */
const Observer = memo(({ mouse }: { mouse: { x: number; y: number } }) => {
  const eyeX = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  const eyeY = useSpring(useMotionValue(0), { stiffness: 80, damping: 20 });
  useEffect(() => {
    eyeX.set((mouse.x - 0.5) * 6);
    eyeY.set((mouse.y - 0.5) * 4);
  }, [mouse.x, mouse.y, eyeX, eyeY]);

  return (
    <motion.g
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
    >
      {/* Body */}
      <motion.path
        d="M 80 340 Q 80 220 105 180 Q 130 140 155 180 Q 180 220 180 340 Z"
        fill="hsl(5 65% 65%)"
        animate={{ d: ["M 80 340 Q 80 220 105 180 Q 130 140 155 180 Q 180 220 180 340 Z", "M 80 340 Q 80 218 105 178 Q 130 138 155 178 Q 180 218 180 340 Z", "M 80 340 Q 80 220 105 180 Q 130 140 155 180 Q 180 220 180 340 Z"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tiny hands */}
      <ellipse cx="85" cy="280" rx="8" ry="5" fill="hsl(5 55% 58%)" />
      <ellipse cx="175" cy="280" rx="8" ry="5" fill="hsl(5 55% 58%)" />
      {/* Eye white */}
      <circle cx="130" cy="240" r="18" fill="hsl(0 0% 95%)" />
      {/* Pupil - tracks mouse */}
      <motion.circle cx="130" cy="240" r="9" fill="hsl(220 30% 15%)" style={{ x: eyeX, y: eyeY }} />
      <motion.circle cx="133" cy="237" r="3" fill="hsl(0 0% 100%)" style={{ x: eyeX, y: eyeY }} />
      {/* Subtle smile */}
      <path d="M 118 268 Q 130 278 142 268" fill="none" stroke="hsl(5 40% 50%)" strokeWidth="2" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="108" cy="262" rx="8" ry="4" fill="hsl(5 60% 72% / 0.5)" />
      <ellipse cx="152" cy="262" rx="8" ry="4" fill="hsl(5 60% 72% / 0.5)" />
    </motion.g>
  );
});
Observer.displayName = 'Observer';

/* ─── The Curious (blue round blob) ─── */
const Curious = memo(({ mouse }: { mouse: { x: number; y: number } }) => {
  const eyeX = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const eyeY = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  useEffect(() => {
    eyeX.set((mouse.x - 0.5) * 5);
    eyeY.set((mouse.y - 0.5) * 3);
  }, [mouse.x, mouse.y, eyeX, eyeY]);

  return (
    <motion.g
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      {/* Body */}
      <motion.ellipse
        cx="220" cy="310" rx="42" ry="45"
        fill="hsl(205 70% 58%)"
        animate={{ ry: [45, 43, 45] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Feet */}
      <ellipse cx="200" cy="350" rx="12" ry="6" fill="hsl(205 60% 50%)" />
      <ellipse cx="240" cy="350" rx="12" ry="6" fill="hsl(205 60% 50%)" />
      {/* Left eye */}
      <circle cx="207" cy="298" r="10" fill="hsl(0 0% 95%)" />
      <motion.circle cx="207" cy="298" r="5.5" fill="hsl(220 30% 15%)" style={{ x: eyeX, y: eyeY }} />
      <motion.circle cx="209" cy="296" r="2" fill="hsl(0 0% 100%)" style={{ x: eyeX, y: eyeY }} />
      {/* Right eye */}
      <circle cx="235" cy="298" r="10" fill="hsl(0 0% 95%)" />
      <motion.circle cx="235" cy="298" r="5.5" fill="hsl(220 30% 15%)" style={{ x: eyeX, y: eyeY }} />
      <motion.circle cx="237" cy="296" r="2" fill="hsl(0 0% 100%)" style={{ x: eyeX, y: eyeY }} />
      {/* Open mouth */}
      <ellipse cx="221" cy="322" rx="6" ry="4" fill="hsl(205 50% 42%)" />
    </motion.g>
  );
});
Curious.displayName = 'Curious';

/* ─── The Professor (green brain with glasses) ─── */
const Professor = memo(({ mouse }: { mouse: { x: number; y: number } }) => {
  const eyeX = useSpring(useMotionValue(0), { stiffness: 60, damping: 16 });
  const eyeY = useSpring(useMotionValue(0), { stiffness: 60, damping: 16 });
  useEffect(() => {
    eyeX.set((mouse.x - 0.5) * 4);
    eyeY.set((mouse.y - 0.5) * 3);
  }, [mouse.x, mouse.y, eyeX, eyeY]);

  return (
    <motion.g
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.8 }}
    >
      {/* Brain body - bumpy cloud */}
      <motion.path
        d="M 280 340 Q 260 340 258 320 Q 250 310 255 295 Q 248 280 260 270 Q 258 255 272 250 Q 278 238 295 235 Q 312 230 325 240 Q 338 235 348 248 Q 360 255 358 270 Q 368 280 362 295 Q 370 310 358 320 Q 360 340 340 340 Z"
        fill="hsl(160 35% 55%)"
        animate={{ d: ["M 280 340 Q 260 340 258 320 Q 250 310 255 295 Q 248 280 260 270 Q 258 255 272 250 Q 278 238 295 235 Q 312 230 325 240 Q 338 235 348 248 Q 360 255 358 270 Q 368 280 362 295 Q 370 310 358 320 Q 360 340 340 340 Z", "M 280 340 Q 260 340 258 318 Q 250 308 255 293 Q 248 278 260 268 Q 258 253 272 248 Q 278 236 295 233 Q 312 228 325 238 Q 338 233 348 246 Q 360 253 358 268 Q 368 278 362 293 Q 370 308 358 318 Q 360 340 340 340 Z", "M 280 340 Q 260 340 258 320 Q 250 310 255 295 Q 248 280 260 270 Q 258 255 272 250 Q 278 238 295 235 Q 312 230 325 240 Q 338 235 348 248 Q 360 255 358 270 Q 368 280 362 295 Q 370 310 358 320 Q 360 340 340 340 Z"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Brain wrinkle lines */}
      <path d="M 275 280 Q 290 275 305 282" fill="none" stroke="hsl(160 30% 48%)" strokeWidth="1.5" />
      <path d="M 310 270 Q 325 265 340 272" fill="none" stroke="hsl(160 30% 48%)" strokeWidth="1.5" />
      <path d="M 285 305 Q 300 298 315 305" fill="none" stroke="hsl(160 30% 48%)" strokeWidth="1.5" />
      {/* Feet */}
      <ellipse cx="295" cy="345" rx="8" ry="5" fill="hsl(160 30% 45%)" />
      <ellipse cx="325" cy="345" rx="8" ry="5" fill="hsl(160 30% 45%)" />
      {/* Glasses frame */}
      <circle cx="295" cy="288" r="14" fill="none" stroke="hsl(220 20% 25%)" strokeWidth="2.5" />
      <circle cx="328" cy="288" r="14" fill="none" stroke="hsl(220 20% 25%)" strokeWidth="2.5" />
      <line x1="309" y1="288" x2="314" y2="288" stroke="hsl(220 20% 25%)" strokeWidth="2" />
      {/* Eyes behind glasses */}
      <circle cx="295" cy="288" r="5" fill="hsl(0 0% 95%)" />
      <motion.circle cx="295" cy="288" r="3" fill="hsl(220 30% 15%)" style={{ x: eyeX, y: eyeY }} />
      <circle cx="328" cy="288" r="5" fill="hsl(0 0% 95%)" />
      <motion.circle cx="328" cy="288" r="3" fill="hsl(220 30% 15%)" style={{ x: eyeX, y: eyeY }} />
      {/* Happy mouth */}
      <path d="M 303 310 Q 312 318 320 310" fill="none" stroke="hsl(160 30% 42%)" strokeWidth="2" strokeLinecap="round" />
    </motion.g>
  );
});
Professor.displayName = 'Professor';

/* ─── The Shy (small purple peeking) ─── */
const Shy = memo(({ mouse }: { mouse: { x: number; y: number } }) => {
  const eyeX = useSpring(useMotionValue(0), { stiffness: 90, damping: 22 });
  const eyeY = useSpring(useMotionValue(0), { stiffness: 90, damping: 22 });
  useEffect(() => {
    eyeX.set((mouse.x - 0.5) * 4);
    eyeY.set((mouse.y - 0.5) * 2);
  }, [mouse.x, mouse.y, eyeX, eyeY]);

  return (
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.8 }}
    >
      {/* Body peeking from behind professor */}
      <motion.ellipse
        cx="375" cy="325" rx="25" ry="28"
        fill="hsl(270 40% 65%)"
        animate={{ cy: [325, 322, 325] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Little feet */}
      <ellipse cx="365" cy="350" rx="7" ry="4" fill="hsl(270 35% 55%)" />
      <ellipse cx="385" cy="350" rx="7" ry="4" fill="hsl(270 35% 55%)" />
      {/* Eyes */}
      <circle cx="368" cy="318" r="4.5" fill="hsl(0 0% 95%)" />
      <motion.circle cx="368" cy="318" r="2.5" fill="hsl(220 30% 15%)" style={{ x: eyeX, y: eyeY }} />
      <circle cx="383" cy="318" r="4.5" fill="hsl(0 0% 95%)" />
      <motion.circle cx="383" cy="318" r="2.5" fill="hsl(220 30% 15%)" style={{ x: eyeX, y: eyeY }} />
      {/* Tiny flat mouth */}
      <line x1="372" y1="330" x2="380" y2="330" stroke="hsl(270 30% 50%)" strokeWidth="1.5" strokeLinecap="round" />
    </motion.g>
  );
});
Shy.displayName = 'Shy';

/* ─── Main Export ─── */
const ResearchCharactersComponent = () => {
  const mouse = useMousePosition();

  return (
    <svg
      className="w-full h-auto max-h-[400px]"
      viewBox="60 130 360 240"
      preserveAspectRatio="xMidYMax meet"
    >
      <Observer mouse={mouse} />
      <Curious mouse={mouse} />
      <Professor mouse={mouse} />
      <Shy mouse={mouse} />
      {/* Ground shadow */}
      <ellipse cx="230" cy="355" rx="160" ry="8" fill="hsl(220 50% 10% / 0.3)" />
    </svg>
  );
};

export const ResearchCharacters = memo(ResearchCharactersComponent);
