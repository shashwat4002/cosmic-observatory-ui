import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Compass, FlaskConical, Handshake, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6"
            >
              <Compass className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground font-medium tracking-wide">Where Curiosity Meets Discovery</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6"
            >
              <span className="text-foreground">Ignite Your</span>
              <br />
              <span className="gradient-text-animated">Research Journey</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed"
            >
              SochX empowers researchers to explore, collaborate, and publish — 
              from first spark to final paper. Join a thriving ecosystem of thinkers and innovators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="btn-ripple bg-gradient-to-r from-primary to-secondary text-primary-foreground px-7 py-6 text-base font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all group"
                onClick={() => navigate('/auth/register')}
              >
                Start Exploring
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="glass border-glass-border text-foreground px-7 py-6 text-base hover:border-primary/50 hover:bg-primary/5"
                onClick={() => navigate('/about')}
              >
                About SochX
              </Button>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex gap-10 mt-12"
            >
              <StatItem value="50K+" label="Researchers" />
              <StatItem value="2.5M" label="Papers" />
              <StatItem value="180+" label="Countries" />
            </motion.div>
          </div>

          {/* Right Side - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <FloatingDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const FloatingDashboard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const features = [
    { icon: FlaskConical, label: 'Pipeline Tracker', desc: '7-stage journey', color: 'from-primary to-secondary' },
    { icon: Handshake, label: 'Collaboration', desc: 'Find your team', color: 'from-secondary to-accent' },
    { icon: BrainCircuit, label: 'AI Insights', desc: 'Smart suggestions', color: 'from-accent to-primary' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg perspective-1000"
    >
      <motion.div style={{ rotateX, rotateY }} className="preserve-3d">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative glass-strong rounded-2xl p-6 glow-border overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Research Command</div>
                <div className="text-xs text-muted-foreground">Live Overview</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/70" />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-3 mb-6">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.15 }}
                whileHover={{ x: 6, scale: 1.02 }}
                className="flex items-center gap-3 p-3 rounded-xl glass border border-border/30 hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <motion.div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}
                  whileHover={{ rotate: 12 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <f.icon className="w-4 h-4 text-primary-foreground" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <ProgressBar label="Literature Review" value={72} delay={1} />
            <ProgressBar label="Methodology" value={45} delay={1.2} />
            <ProgressBar label="Data Analysis" value={88} delay={1.4} />
          </div>
        </motion.div>

        {/* Floating Stats Badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="absolute -right-3 -top-3 glass-strong rounded-xl p-3 border border-primary/20"
          style={{ transform: 'translateZ(30px)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <div>
              <div className="text-sm font-bold text-primary">+24.5%</div>
              <div className="text-[10px] text-muted-foreground">This week</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Glow behind */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/15 via-transparent to-transparent blur-3xl -z-10" />
    </div>
  );
};

const ProgressBar = ({ label, value, delay }: { label: string; value: number; delay: number }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}%</span>
    </div>
    <div className="h-2 rounded-full overflow-hidden bg-muted/50">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
      />
    </div>
  </div>
);
