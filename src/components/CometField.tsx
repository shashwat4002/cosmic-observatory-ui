import { useEffect, useRef, useCallback, memo, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BrandRevealOverlay } from '@/components/BrandRevealOverlay';

// Section color themes (HSL)
const SECTION_THEMES = [
  { core: [191, 100, 62], glow: [191, 100, 70], trail: [191, 80, 75] },
  { core: [280, 80, 65], glow: [270, 90, 60], trail: [290, 60, 75] },
  { core: [150, 90, 55], glow: [160, 85, 50], trail: [140, 70, 70] },
  { core: [340, 90, 60], glow: [350, 85, 55], trail: [330, 70, 70] },
  { core: [35, 95, 58], glow: [40, 90, 55], trail: [30, 80, 70] },
];

// Depth layer configs — NO blur filter (causes glitch lines)
const DEPTH_LAYERS = [
  { sizeRange: [0.8, 1.4], speedMult: 0.4, glowMult: 0.5, trailAlpha: 0.25 },
  { sizeRange: [1.5, 2.5], speedMult: 0.7, glowMult: 0.8, trailAlpha: 0.45 },
  { sizeRange: [2.5, 4.0], speedMult: 1.0, glowMult: 1.2, trailAlpha: 0.65 },
];

interface Comet {
  x: number; y: number; vx: number; vy: number; size: number;
  coreColor: number[]; glowColor: number[]; trailColor: number[];
  targetCore: number[]; targetGlow: number[]; targetTrail: number[];
  trail: { x: number; y: number; alpha: number }[];
  glowRadius: number; targetGlowRadius: number;
  sectionIndex: number; collisionCooldown: number;
  canPop: boolean;
  depthLayer: number;
  sinOffset: number;
  sinSpeed: number;
  sinAmp: number;
  scale: number; targetScale: number;
  age: number;
}

interface ShootingStar {
  x: number; y: number; vx: number; vy: number;
  trail: { x: number; y: number; alpha: number }[];
  life: number; maxLife: number;
  curveForce: number;
  active: boolean;
}

interface Ripple { x: number; y: number; radius: number; maxRadius: number; alpha: number; color: number[]; }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: number[]; size: number; }

function hslStr(h: number, s: number, l: number, a = 1) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpColor(from: number[], to: number[], t: number): number[] {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}
function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

interface CometFieldProps {
  onRevealStateChange?: (active: boolean) => void;
}

const CometFieldComponent = ({ onRevealStateChange }: CometFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const cometsRef = useRef<Comet[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const shootingStarRef = useRef<ShootingStar | null>(null);
  const smoothScrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const sectionBoundsRef = useRef<number[]>([]);
  const animFrameRef = useRef(0);
  const lastCollisionRef = useRef(0);
  const lastShootingStarRef = useRef(0);
  const lastBrandRevealRef = useRef(0);
  const [showBrandReveal, setShowBrandReveal] = useState(false);
  const dimFactorRef = useRef(1);
  const revealBoostRef = useRef(0);

  const COMET_COUNT = isMobile ? 8 : 18;
  const TRAIL_LENGTH = isMobile ? 16 : 30;
  const SHOOTING_STAR_INTERVAL = isMobile ? 20000 : 12000;
  const BRAND_REVEAL_INTERVAL = 45000;

  const createComet = useCallback((w: number, h: number): Comet => {
    const theme = SECTION_THEMES[0];
    const depthLayer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
    const layer = DEPTH_LAYERS[depthLayer];
    const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
    const baseGlow = (10 + Math.random() * 10) * layer.glowMult;

    return {
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6 * layer.speedMult,
      vy: (Math.random() - 0.5) * 0.4 * layer.speedMult,
      size,
      coreColor: [...theme.core], glowColor: [...theme.glow], trailColor: [...theme.trail],
      targetCore: [...theme.core], targetGlow: [...theme.glow], targetTrail: [...theme.trail],
      trail: [],
      glowRadius: baseGlow, targetGlowRadius: baseGlow,
      sectionIndex: 0, collisionCooldown: 0,
      canPop: Math.random() < 0.3,
      depthLayer,
      sinOffset: Math.random() * Math.PI * 2,
      sinSpeed: 0.3 + Math.random() * 0.4,
      sinAmp: 0.1 + Math.random() * 0.2,
      scale: 1, targetScale: 1,
      age: 0,
    };
  }, []);

  const getSectionAtY = useCallback((y: number): number => {
    const bounds = sectionBoundsRef.current;
    const scrollY = smoothScrollRef.current;
    const absY = y + scrollY;
    for (let i = bounds.length - 1; i >= 0; i--) {
      if (absY >= bounds[i]) return Math.min(i, SECTION_THEMES.length - 1);
    }
    return 0;
  }, []);

  const spawnRipple = useCallback((x: number, y: number, color: number[], maxR = 60) => {
    ripplesRef.current.push({ x, y, radius: 2, maxRadius: maxR, alpha: 0.4, color });
  }, []);

  const spawnSparks = useCallback((x: number, y: number, color: number[], count = 6) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.2 + Math.random() * 1.5;
      sparksRef.current.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, maxLife: 0.5 + Math.random() * 0.3, color, size: 0.8 + Math.random() * 1,
      });
    }
  }, []);

  const launchShootingStar = useCallback((w: number, h: number) => {
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -50 : w + 50;
    const startY = Math.random() * h * 0.4;
    const angle = fromLeft ? (-Math.PI / 6 + Math.random() * 0.3) : (-Math.PI + Math.PI / 6 - Math.random() * 0.3);
    const speed = 6 + Math.random() * 4;

    shootingStarRef.current = {
      x: startX, y: startY,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      trail: [],
      life: 1, maxLife: 1,
      curveForce: (Math.random() - 0.5) * 0.08,
      active: true,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    cometsRef.current = Array.from({ length: COMET_COUNT }, () =>
      createComet(window.innerWidth, window.innerHeight)
    );

    const updateSectionBounds = () => {
      const sections = document.querySelectorAll('[data-comet-section]');
      sectionBoundsRef.current = Array.from(sections).map(el => {
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY;
      });
    };
    updateSectionBounds();

    const onScroll = () => {
      targetScrollRef.current = window.scrollY;
      updateSectionBounds();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      smoothScrollRef.current = lerp(smoothScrollRef.current, targetScrollRef.current, 0.12);

      const now = Date.now();
      const comets = cometsRef.current;
      const ripples = ripplesRef.current;
      const sparks = sparksRef.current;
      const mouse = mouseRef.current;
      const dimFactor = dimFactorRef.current;
      const revealBoost = revealBoostRef.current;

      // === SHOOTING STAR ===
      if (!shootingStarRef.current && now - lastShootingStarRef.current > SHOOTING_STAR_INTERVAL + Math.random() * 8000) {
        launchShootingStar(w, h);
        lastShootingStarRef.current = now;
      }

      const ss = shootingStarRef.current;
      if (ss && ss.active) {
        ss.vy += ss.curveForce;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.008;

        ss.trail.unshift({ x: ss.x, y: ss.y, alpha: 1 });
        if (ss.trail.length > 50) ss.trail.pop();
        for (const t of ss.trail) t.alpha *= 0.96;

        // Draw trail — single smooth path, no per-segment strokes
        if (ss.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(ss.trail[0].x, ss.trail[0].y);
          for (let t = 1; t < ss.trail.length; t++) {
            ctx.lineTo(ss.trail[t].x, ss.trail[t].y);
          }
          const ssGrad = ctx.createLinearGradient(
            ss.trail[0].x, ss.trail[0].y,
            ss.trail[ss.trail.length - 1].x, ss.trail[ss.trail.length - 1].y
          );
          ssGrad.addColorStop(0, hslStr(45, 20, 95, 0.8 * dimFactor));
          ssGrad.addColorStop(0.4, hslStr(45, 80, 70, 0.4 * dimFactor));
          ssGrad.addColorStop(1, hslStr(45, 80, 60, 0));
          ctx.strokeStyle = ssGrad;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        // Core glow (no shadowBlur)
        const coreGlow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 20);
        coreGlow.addColorStop(0, hslStr(45, 100, 95, 0.7 * dimFactor));
        coreGlow.addColorStop(0.4, hslStr(42, 90, 70, 0.2 * dimFactor));
        coreGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // White core dot
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hslStr(0, 0, 100, 0.9 * dimFactor);
        ctx.fill();

        if (ss.x < -100 || ss.x > w + 100 || ss.y < -100 || ss.y > h + 100 || ss.life <= 0) {
          ss.active = false;
          shootingStarRef.current = null;

          // Brand reveal trigger
          if (now - lastBrandRevealRef.current > BRAND_REVEAL_INTERVAL) {
            lastBrandRevealRef.current = now;
            setShowBrandReveal(true);
            onRevealStateChange?.(true);

            // Elegant boost: comets gently grow and drift wider
            revealBoostRef.current = 1;
            for (const comet of cometsRef.current) {
              comet.targetScale = 1.6 + Math.random() * 1.2; // 1.6–2.8x (elegant, not extreme)
              comet.vx += (Math.random() - 0.5) * 1.5;
              comet.vy += (Math.random() - 0.5) * 1;
              comet.sinAmp = 0.4 + Math.random() * 0.6;
              comet.targetGlowRadius = (15 + Math.random() * 15) * DEPTH_LAYERS[comet.depthLayer].glowMult * 1.8;
            }

            setTimeout(() => {
              setShowBrandReveal(false);
              onRevealStateChange?.(false);
              for (const comet of cometsRef.current) {
                comet.targetScale = 1;
                comet.sinAmp = 0.1 + Math.random() * 0.2;
                const layer = DEPTH_LAYERS[comet.depthLayer];
                comet.targetGlowRadius = (10 + Math.random() * 10) * layer.glowMult;
              }
              const restore = () => {
                revealBoostRef.current = lerp(revealBoostRef.current, 0, 0.04);
                if (revealBoostRef.current > 0.02) requestAnimationFrame(restore);
                else revealBoostRef.current = 0;
              };
              requestAnimationFrame(restore);
            }, 3500);
          }
        }
      }

      // === COMETS ===
      const sortedIndices = comets.map((_, i) => i).sort((a, b) => comets[a].depthLayer - comets[b].depthLayer);

      for (const i of sortedIndices) {
        const c = comets[i];
        const layer = DEPTH_LAYERS[c.depthLayer];
        c.age++;

        const sinWave = Math.sin(c.age * 0.01 * c.sinSpeed + c.sinOffset) * c.sinAmp;
        const perpAngle = Math.atan2(c.vy, c.vx) + Math.PI / 2;

        // Cursor repulsion
        const repulsionRange = 70 + c.depthLayer * 25;
        const dMouse = dist(c.x, c.y, mouse.x, mouse.y);
        if (dMouse < repulsionRange) {
          const force = (repulsionRange - dMouse) / repulsionRange * (0.06 + c.depthLayer * 0.04);
          const angle = Math.atan2(c.y - mouse.y, c.x - mouse.x);
          c.vx += Math.cos(angle) * force;
          c.vy += Math.sin(angle) * force;
        }

        c.vx *= 0.998;
        c.vy *= 0.998;

        const speed = Math.sqrt(c.vx ** 2 + c.vy ** 2);
        const maxSpeed = 1.2 * layer.speedMult + 0.4 + (revealBoost > 0.1 ? 1.5 : 0);
        if (speed < 0.06) {
          c.vx += (Math.random() - 0.5) * 0.04;
          c.vy += (Math.random() - 0.5) * 0.04;
        }
        if (speed > maxSpeed) {
          c.vx *= maxSpeed / speed;
          c.vy *= maxSpeed / speed;
        }

        c.x += c.vx + Math.cos(perpAngle) * sinWave * 0.25;
        c.y += c.vy + Math.sin(perpAngle) * sinWave * 0.25;

        c.scale = lerp(c.scale, c.targetScale, revealBoost > 0.1 ? 0.03 : 0.02);

        // Wrap edges
        if (c.x < -30) c.x = w + 30;
        if (c.x > w + 30) c.x = -30;
        if (c.y < -30) c.y = h + 30;
        if (c.y > h + 30) c.y = -30;

        // Section color transition
        const sIdx = getSectionAtY(c.y);
        if (sIdx !== c.sectionIndex) {
          const theme = SECTION_THEMES[sIdx] || SECTION_THEMES[0];
          c.targetCore = [...theme.core];
          c.targetGlow = [...theme.glow];
          c.targetTrail = [...theme.trail];

          if (c.canPop) {
            c.glowRadius = c.targetGlowRadius + 12 * layer.glowMult;
            spawnRipple(c.x, c.y, theme.core, 45);
            spawnSparks(c.x, c.y, theme.core, 4);
          }
          c.sectionIndex = sIdx;
        }

        const colorSpeed = 0.03;
        c.coreColor = lerpColor(c.coreColor, c.targetCore, colorSpeed);
        c.glowColor = lerpColor(c.glowColor, c.targetGlow, colorSpeed);
        c.trailColor = lerpColor(c.trailColor, c.targetTrail, colorSpeed);
        c.glowRadius = lerp(c.glowRadius, c.targetGlowRadius, 0.03);

        if (c.collisionCooldown > 0) c.collisionCooldown--;

        const trailLen = revealBoost > 0.1 ? Math.floor(TRAIL_LENGTH * 1.8) : TRAIL_LENGTH;
        c.trail.unshift({ x: c.x, y: c.y, alpha: 1 });
        if (c.trail.length > trailLen) c.trail.pop();
        for (const t of c.trail) t.alpha *= (revealBoost > 0.1 ? 0.965 : 0.94);

        // Collision (simplified — no flashes)
        if (c.collisionCooldown <= 0 && now - lastCollisionRef.current > 2000) {
          for (let j = i + 1; j < comets.length; j++) {
            const other = comets[j];
            if (other.collisionCooldown > 0) continue;
            const d = dist(c.x, c.y, other.x, other.y);
            if (d < 25) {
              lastCollisionRef.current = now;
              spawnSparks((c.x + other.x) / 2, (c.y + other.y) / 2, c.coreColor, 4);
              const angle = Math.atan2(c.y - other.y, c.x - other.x);
              const push = 0.3;
              c.vx += Math.cos(angle) * push;
              c.vy += Math.sin(angle) * push;
              other.vx -= Math.cos(angle) * push;
              other.vy -= Math.sin(angle) * push;
              c.collisionCooldown = 120;
              other.collisionCooldown = 120;
              break;
            }
          }
        }

        const drawSize = c.size * c.scale;
        const drawGlow = c.glowRadius * c.scale;
        const cAlpha = Math.min(dimFactor, 1);

        // Draw trail — single smooth path
        if (c.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(c.trail[0].x, c.trail[0].y);
          for (let t = 1; t < c.trail.length; t++) {
            ctx.lineTo(c.trail[t].x, c.trail[t].y);
          }
          const grad = ctx.createLinearGradient(
            c.trail[0].x, c.trail[0].y,
            c.trail[c.trail.length - 1].x, c.trail[c.trail.length - 1].y
          );
          grad.addColorStop(0, hslStr(c.trailColor[0], c.trailColor[1], c.trailColor[2], layer.trailAlpha * cAlpha));
          grad.addColorStop(1, hslStr(c.trailColor[0], c.trailColor[1], c.trailColor[2], 0));
          ctx.strokeStyle = grad;
          ctx.lineWidth = drawSize * 0.7;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        // Draw glow (no shadowBlur — uses radial gradient only)
        const glowGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, drawGlow);
        glowGrad.addColorStop(0, hslStr(c.glowColor[0], c.glowColor[1], c.glowColor[2], 0.3 * cAlpha));
        glowGrad.addColorStop(0.5, hslStr(c.glowColor[0], c.glowColor[1], c.glowColor[2], 0.08 * cAlpha));
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, drawGlow, 0, Math.PI * 2);
        ctx.fill();

        // Draw core (no shadowBlur — clean circles)
        ctx.beginPath();
        ctx.arc(c.x, c.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = hslStr(c.coreColor[0], c.coreColor[1], c.coreColor[2], 0.9 * cAlpha);
        ctx.fill();
      }

      // === RIPPLES ===
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.2;
        r.alpha -= 0.015;
        if (r.alpha <= 0 || r.radius >= r.maxRadius) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = hslStr(r.color[0], r.color[1], r.color[2], r.alpha * 0.3 * dimFactor);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // === SPARKS ===
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy;
        s.vx *= 0.95; s.vy *= 0.95;
        s.life -= 0.03;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = hslStr(s.color[0], s.color[1], s.color[2], s.life * 0.5 * dimFactor);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [COMET_COUNT, TRAIL_LENGTH, SHOOTING_STAR_INTERVAL, BRAND_REVEAL_INTERVAL, createComet, getSectionAtY, spawnRipple, spawnSparks, launchShootingStar, onRevealStateChange]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{ mixBlendMode: 'screen' }}
      />
      {showBrandReveal && <BrandRevealOverlay onComplete={() => setShowBrandReveal(false)} />}
    </>
  );
};

export const CometField = memo(CometFieldComponent);
