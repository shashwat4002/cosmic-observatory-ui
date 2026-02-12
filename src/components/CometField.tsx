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

// Depth layer configs: far = small/slow/dim, near = large/fast/bright
const DEPTH_LAYERS = [
  { sizeRange: [0.8, 1.4], speedMult: 0.4, glowMult: 0.5, trailAlpha: 0.25, blur: 0 },    // Far
  { sizeRange: [1.5, 2.5], speedMult: 0.7, glowMult: 0.8, trailAlpha: 0.45, blur: 0 },    // Mid
  { sizeRange: [2.5, 4.0], speedMult: 1.0, glowMult: 1.2, trailAlpha: 0.65, blur: 1.5 },  // Near
];

interface Comet {
  x: number; y: number; vx: number; vy: number; size: number;
  coreColor: number[]; glowColor: number[]; trailColor: number[];
  targetCore: number[]; targetGlow: number[]; targetTrail: number[];
  trail: { x: number; y: number; alpha: number }[];
  glowRadius: number; targetGlowRadius: number;
  sectionIndex: number; collisionCooldown: number;
  canPop: boolean;
  depthLayer: number; // 0=far, 1=mid, 2=near
  sinOffset: number; // for sinusoidal drift
  sinSpeed: number;
  sinAmp: number;
  scale: number; targetScale: number; // for forward motion illusion
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
interface Flash { x: number; y: number; alpha: number; radius: number; }

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
  const flashesRef = useRef<Flash[]>([]);
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
  const dimFactorRef = useRef(1); // 1 = full brightness, 0 = dimmed for brand reveal
  const revealBoostRef = useRef(0); // 0 = normal, 1 = full 3D burst mode

  const COMET_COUNT = isMobile ? 10 : 24;
  const TRAIL_LENGTH = isMobile ? 20 : 40;
  const SHOOTING_STAR_INTERVAL = isMobile ? 20000 : 12000; // ms between shooting stars
  const BRAND_REVEAL_INTERVAL = 45000; // ms between brand reveals

  const createComet = useCallback((w: number, h: number): Comet => {
    const theme = SECTION_THEMES[0];
    const depthLayer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
    const layer = DEPTH_LAYERS[depthLayer];
    const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
    const baseGlow = (12 + Math.random() * 12) * layer.glowMult;

    return {
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.8 * layer.speedMult,
      vy: (Math.random() - 0.5) * 0.6 * layer.speedMult,
      size,
      coreColor: [...theme.core], glowColor: [...theme.glow], trailColor: [...theme.trail],
      targetCore: [...theme.core], targetGlow: [...theme.glow], targetTrail: [...theme.trail],
      trail: [],
      glowRadius: baseGlow, targetGlowRadius: baseGlow,
      sectionIndex: 0, collisionCooldown: 0,
      canPop: Math.random() < 0.35,
      depthLayer,
      sinOffset: Math.random() * Math.PI * 2,
      sinSpeed: 0.3 + Math.random() * 0.5,
      sinAmp: 0.15 + Math.random() * 0.3,
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

  const spawnRipple = useCallback((x: number, y: number, color: number[], maxR = 70) => {
    ripplesRef.current.push({ x, y, radius: 2, maxRadius: maxR, alpha: 0.55, color });
  }, []);

  const spawnSparks = useCallback((x: number, y: number, color: number[], count = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 2;
      sparksRef.current.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1, maxLife: 0.6 + Math.random() * 0.4, color, size: 1 + Math.random() * 1.2,
      });
    }
  }, []);

  const spawnFlash = useCallback((x: number, y: number, radius = 120) => {
    flashesRef.current.push({ x, y, alpha: 0.35, radius });
  }, []);

  const launchShootingStar = useCallback((w: number, h: number) => {
    // Diagonal from random edge
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
      const flashes = flashesRef.current;
      const mouse = mouseRef.current;
      const dimFactor = dimFactorRef.current;

      // === SHOOTING STAR LOGIC ===
      if (!shootingStarRef.current && now - lastShootingStarRef.current > SHOOTING_STAR_INTERVAL + Math.random() * 8000) {
        launchShootingStar(w, h);
        lastShootingStarRef.current = now;
      }

      const ss = shootingStarRef.current;
      if (ss && ss.active) {
        // Curved arc motion
        ss.vy += ss.curveForce;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= 0.008;

        ss.trail.unshift({ x: ss.x, y: ss.y, alpha: 1 });
        if (ss.trail.length > 60) ss.trail.pop();
        for (const t of ss.trail) t.alpha *= 0.96;

        // Draw shooting star trail: white → golden → fade
        if (ss.trail.length > 1) {
          for (let t = 0; t < ss.trail.length - 1; t++) {
            const p = ss.trail[t];
            const pn = ss.trail[t + 1];
            const progress = t / ss.trail.length;
            const trailWidth = lerp(3.5, 0.3, progress);
            const trailAlpha = p.alpha * lerp(0.9, 0, progress);
            // White → golden yellow fade
            const trailH = lerp(50, 45, progress);
            const trailS = lerp(10, 90, progress);
            const trailL = lerp(95, 65, progress);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pn.x, pn.y);
            ctx.strokeStyle = hslStr(trailH, trailS, trailL, trailAlpha * dimFactor);
            ctx.lineWidth = trailWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }

        // Draw shooting star core with golden halo
        const coreGlow = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 30);
        coreGlow.addColorStop(0, hslStr(45, 100, 95, 0.9 * dimFactor));
        coreGlow.addColorStop(0.3, hslStr(42, 90, 70, 0.4 * dimFactor));
        coreGlow.addColorStop(1, hslStr(40, 80, 60, 0));
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 30, 0, Math.PI * 2);
        ctx.fill();

        // White hot core
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = hslStr(0, 0, 100, 0.95 * dimFactor);
        ctx.shadowColor = hslStr(45, 100, 80, 0.8);
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Area brightening glow
        spawnFlash(ss.x, ss.y, 80);

        // Check if off screen
        if (ss.x < -100 || ss.x > w + 100 || ss.y < -100 || ss.y > h + 100 || ss.life <= 0) {
          ss.active = false;
          shootingStarRef.current = null;

          // Trigger brand reveal occasionally
          if (now - lastBrandRevealRef.current > BRAND_REVEAL_INTERVAL) {
            lastBrandRevealRef.current = now;
            setShowBrandReveal(true);
            onRevealStateChange?.(true);
            // Boost comets into 3D burst mode instead of dimming
            dimFactorRef.current = 1.5; // brighter
            revealBoostRef.current = 1;
            // Make all comets dramatically scale and sweep
            for (const comet of cometsRef.current) {
              comet.targetScale = 2.5 + Math.random() * 2.5; // 2.5x–5x size
              comet.vx = (Math.random() - 0.5) * 4; // faster lateral sweep
              comet.vy = (Math.random() - 0.5) * 3;
              comet.sinAmp = 1.5 + Math.random() * 2; // big sweeping arcs
              comet.sinSpeed = 0.8 + Math.random() * 0.6;
              comet.targetGlowRadius = (20 + Math.random() * 20) * DEPTH_LAYERS[comet.depthLayer].glowMult * 2.5;
            }
            setTimeout(() => {
              setShowBrandReveal(false);
              onRevealStateChange?.(false);
              // Gradually restore all comets
              for (const comet of cometsRef.current) {
                comet.targetScale = 1;
                comet.sinAmp = 0.15 + Math.random() * 0.3;
                comet.sinSpeed = 0.3 + Math.random() * 0.5;
                const layer = DEPTH_LAYERS[comet.depthLayer];
                comet.targetGlowRadius = (12 + Math.random() * 12) * layer.glowMult;
              }
              const restore = () => {
                dimFactorRef.current = lerp(dimFactorRef.current, 1, 0.05);
                revealBoostRef.current = lerp(revealBoostRef.current, 0, 0.05);
                if (dimFactorRef.current > 1.02 || revealBoostRef.current > 0.02) requestAnimationFrame(restore);
                else { dimFactorRef.current = 1; revealBoostRef.current = 0; }
              };
              requestAnimationFrame(restore);
            }, 3500);
          }
        }
      }

      // === COMETS ===
      // Sort by depth layer for proper rendering order (far first)
      const sortedIndices = comets.map((_, i) => i).sort((a, b) => comets[a].depthLayer - comets[b].depthLayer);

      for (const i of sortedIndices) {
        const c = comets[i];
        const layer = DEPTH_LAYERS[c.depthLayer];
        c.age++;

        // Sinusoidal drift for organic motion
        const sinWave = Math.sin(c.age * 0.01 * c.sinSpeed + c.sinOffset) * c.sinAmp;
        const perpAngle = Math.atan2(c.vy, c.vx) + Math.PI / 2;

        // Cursor repulsion (stronger for near comets)
        const repulsionRange = 80 + c.depthLayer * 30;
        const dMouse = dist(c.x, c.y, mouse.x, mouse.y);
        if (dMouse < repulsionRange) {
          const force = (repulsionRange - dMouse) / repulsionRange * (0.08 + c.depthLayer * 0.06);
          const angle = Math.atan2(c.y - mouse.y, c.x - mouse.x);
          c.vx += Math.cos(angle) * force;
          c.vy += Math.sin(angle) * force;
        }

        c.vx *= 0.997;
        c.vy *= 0.997;

        const speed = Math.sqrt(c.vx ** 2 + c.vy ** 2);
        const boostSpeed = revealBoostRef.current > 0.1 ? 3 : 0;
        const maxSpeed = 1.5 * layer.speedMult + 0.5 + boostSpeed;
        if (speed < 0.08) {
          c.vx += (Math.random() - 0.5) * 0.05;
          c.vy += (Math.random() - 0.5) * 0.05;
        }
        if (speed > maxSpeed) {
          c.vx *= maxSpeed / speed;
          c.vy *= maxSpeed / speed;
        }

        c.x += c.vx + Math.cos(perpAngle) * sinWave * 0.3;
        c.y += c.vy + Math.sin(perpAngle) * sinWave * 0.3;

        // Forward motion simulation: occasionally a comet "approaches"
        if (c.depthLayer === 1 && Math.random() < 0.0003) {
          c.targetScale = 1.3;
          setTimeout(() => { c.targetScale = 1; }, 2000);
        }
        c.scale = lerp(c.scale, c.targetScale, revealBoostRef.current > 0.1 ? 0.04 : 0.02);

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
            c.glowRadius = c.targetGlowRadius + 18 * layer.glowMult;
            spawnRipple(c.x, c.y, theme.core, 55);
            spawnSparks(c.x, c.y, theme.core, 6);
            spawnFlash(c.x, c.y, 60);
          }
          c.sectionIndex = sIdx;
        }

        // Smooth color lerp (~800ms at 60fps)
        const colorSpeed = 0.03;
        c.coreColor = lerpColor(c.coreColor, c.targetCore, colorSpeed);
        c.glowColor = lerpColor(c.glowColor, c.targetGlow, colorSpeed);
        c.trailColor = lerpColor(c.trailColor, c.targetTrail, colorSpeed);
        c.glowRadius = lerp(c.glowRadius, c.targetGlowRadius, 0.03);

        if (c.collisionCooldown > 0) c.collisionCooldown--;

        const boostTrailLen = revealBoostRef.current > 0.1 ? Math.floor(TRAIL_LENGTH * 2.5) : TRAIL_LENGTH;
        c.trail.unshift({ x: c.x, y: c.y, alpha: 1 });
        if (c.trail.length > boostTrailLen) c.trail.pop();
        for (const t of c.trail) t.alpha *= (revealBoostRef.current > 0.1 ? 0.97 : 0.94);

        // Proximity flash on collision
        if (c.collisionCooldown <= 0 && now - lastCollisionRef.current > 1800) {
          for (let j = i + 1; j < comets.length; j++) {
            const other = comets[j];
            if (other.collisionCooldown > 0) continue;
            const d = dist(c.x, c.y, other.x, other.y);
            if (d < 28) {
              lastCollisionRef.current = now;
              const mx = (c.x + other.x) / 2;
              const my = (c.y + other.y) / 2;
              spawnSparks(mx, my, c.coreColor, 6);
              spawnFlash(mx, my, 50); // Golden sync flash

              const angle = Math.atan2(c.y - other.y, c.x - other.x);
              const push = 0.35;
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
        const cAlpha = dimFactor;

        // Draw trail
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
          ctx.lineWidth = drawSize * 0.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw glow
        const glowGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, drawGlow);
        glowGrad.addColorStop(0, hslStr(c.glowColor[0], c.glowColor[1], c.glowColor[2], 0.35 * cAlpha));
        glowGrad.addColorStop(0.4, hslStr(c.glowColor[0], c.glowColor[1], c.glowColor[2], 0.1 * cAlpha));
        glowGrad.addColorStop(1, hslStr(c.glowColor[0], c.glowColor[1], c.glowColor[2], 0));
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, drawGlow, 0, Math.PI * 2);
        ctx.fill();

        // Near-layer blur effect
        if (layer.blur > 0) {
          ctx.filter = `blur(${layer.blur}px)`;
        }

        // Draw core
        ctx.beginPath();
        ctx.arc(c.x, c.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = hslStr(c.coreColor[0], c.coreColor[1], c.coreColor[2], 0.95 * cAlpha);
        ctx.shadowColor = hslStr(c.coreColor[0], c.coreColor[1], c.coreColor[2], 0.8 * cAlpha);
        ctx.shadowBlur = 8 + c.depthLayer * 3;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.filter = 'none';
      }

      // === GOLDEN FLASHES ===
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.alpha -= 0.02;
        if (f.alpha <= 0) { flashes.splice(i, 1); continue; }
        const fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        fg.addColorStop(0, hslStr(45, 90, 75, f.alpha * 0.5 * dimFactor));
        fg.addColorStop(0.5, hslStr(40, 80, 60, f.alpha * 0.15 * dimFactor));
        fg.addColorStop(1, hslStr(35, 70, 50, 0));
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // === RIPPLES ===
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.5;
        r.alpha -= 0.012;
        if (r.alpha <= 0 || r.radius >= r.maxRadius) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = hslStr(r.color[0], r.color[1], r.color[2], r.alpha * 0.4 * dimFactor);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // === SPARKS ===
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy;
        s.vx *= 0.95; s.vy *= 0.95;
        s.life -= 0.025;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = hslStr(s.color[0], s.color[1], s.color[2], s.life * 0.6 * dimFactor);
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
  }, [COMET_COUNT, TRAIL_LENGTH, SHOOTING_STAR_INTERVAL, BRAND_REVEAL_INTERVAL, createComet, getSectionAtY, spawnRipple, spawnSparks, spawnFlash, launchShootingStar]);

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
