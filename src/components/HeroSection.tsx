 import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
 import { ArrowRight, Sparkles, Activity, Bell, TrendingUp } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { useRef, useState, useEffect } from 'react';
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
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6"
             >
               <Sparkles className="w-4 h-4 text-primary" />
               <span className="text-sm text-muted-foreground">Next-Gen Research Platform</span>
             </motion.div>
 
             <motion.h1
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6"
             >
               <span className="text-foreground">Unlock the</span>
               <br />
               <span className="gradient-text-animated">Future of Research</span>
             </motion.h1>
 
             <motion.p
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="text-lg text-muted-foreground max-w-lg mb-8"
             >
               Join a global ecosystem of researchers, innovators, and thought leaders 
               pushing the boundaries of knowledge.
             </motion.p>
 
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="flex flex-wrap gap-4"
             >
               <HeroButton primary onClick={() => navigate('/auth/register')}>
                 Start Exploring
                 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
               </HeroButton>
               <HeroButton onClick={() => navigate('/auth/login')}>
                 Watch Demo
               </HeroButton>
             </motion.div>
 
             {/* Stats Row */}
             <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               className="flex gap-8 mt-12"
             >
               <StatItem value="50K+" label="Researchers" />
               <StatItem value="2.5M" label="Papers" />
               <StatItem value="180+" label="Countries" />
             </motion.div>
           </div>
 
           {/* Right Side - Dashboard Preview */}
           <motion.div
             initial={{ opacity: 0, x: 50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, delay: 0.3 }}
             className="relative lg:h-[600px] flex items-center justify-center"
           >
             <FloatingDashboard />
           </motion.div>
         </div>
       </div>
     </section>
   );
 };
 
 const HeroButton = ({
   children,
   primary = false,
   onClick,
 }: {
   children: React.ReactNode;
   primary?: boolean;
   onClick?: () => void;
 }) => {
   const [isHovered, setIsHovered] = useState(false);
   
   return (
     <motion.button
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       onClick={onClick}
       whileHover={{ scale: 1.02 }}
       whileTap={{ scale: 0.98 }}
       className={`group relative px-6 py-3 rounded-xl font-medium flex items-center transition-all duration-300 overflow-hidden ${
         primary 
           ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground' 
           : 'glass border border-glass-border text-foreground hover:border-primary/50'
       }`}
     >
       {/* Ripple effect */}
       {primary && isHovered && (
         <motion.div
           className="absolute inset-0 bg-star-white/20"
           initial={{ scale: 0, opacity: 0.5 }}
           animate={{ scale: 2, opacity: 0 }}
           transition={{ duration: 0.6 }}
         />
       )}
       
       {/* Glow */}
       {primary && (
         <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
       )}
       
       <span className="relative z-10 flex items-center">{children}</span>
     </motion.button>
   );
 };
 
 const StatItem = ({ value, label }: { value: string; label: string }) => (
   <div className="text-center">
     <div className="text-2xl font-bold text-foreground">{value}</div>
     <div className="text-sm text-muted-foreground">{label}</div>
   </div>
 );
 
 const FloatingDashboard = () => {
   const containerRef = useRef<HTMLDivElement>(null);
   const mouseX = useMotionValue(0);
   const mouseY = useMotionValue(0);
   
   const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 100, damping: 30 });
   const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 100, damping: 30 });
 
   const handleMouseMove = (e: React.MouseEvent) => {
     if (!containerRef.current) return;
     const rect = containerRef.current.getBoundingClientRect();
     const x = (e.clientX - rect.left) / rect.width - 0.5;
     const y = (e.clientY - rect.top) / rect.height - 0.5;
     mouseX.set(x);
     mouseY.set(y);
   };
 
   const handleMouseLeave = () => {
     mouseX.set(0);
     mouseY.set(0);
   };
 
   return (
     <div
       ref={containerRef}
       onMouseMove={handleMouseMove}
       onMouseLeave={handleMouseLeave}
       className="relative w-full max-w-lg perspective-1000"
     >
       <motion.div
         style={{ rotateX, rotateY }}
         className="preserve-3d"
       >
          {/* Main Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative rounded-2xl p-6 border border-[hsl(var(--glow-cyan)/0.4)] shadow-[0_0_40px_hsl(var(--glow-cyan)/0.15),inset_0_1px_0_hsl(var(--star-white)/0.1)]"
            style={{ background: 'linear-gradient(135deg, hsl(216 60% 15% / 0.95), hsl(220 70% 8% / 0.95))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--glow-cyan))] to-[hsl(var(--glow-blue))] flex items-center justify-center shadow-[0_0_20px_hsl(var(--glow-cyan)/0.5)]">
                  <Activity className="w-5 h-5 text-[hsl(var(--deep-navy))]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[hsl(var(--star-white))]">Research Dashboard</div>
                  <div className="text-xs text-[hsl(var(--glow-cyan)/0.7)]">Live Analytics</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_8px_hsl(0_84%_60%/0.6)]" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_hsl(45_100%_50%/0.6)]" />
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_hsl(142_70%_50%/0.6)]" />
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4 mb-6">
              <ProgressBar label="Neural Networks" value={87} color="primary" delay={0.6} />
              <ProgressBar label="Data Analysis" value={65} color="secondary" delay={0.8} />
              <ProgressBar label="ML Models" value={92} color="accent" delay={1} />
            </div>

            {/* Chart placeholder */}
            <div className="h-32 rounded-xl bg-[hsl(var(--midnight)/0.6)] border border-[hsl(var(--glass-border)/0.3)] flex items-end justify-around p-4 gap-2">
              {[40, 65, 45, 80, 55, 75, 90].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: 1 + i * 0.1 }}
                  className="w-6 rounded-t-md bg-gradient-to-t from-[hsl(var(--glow-cyan)/0.6)] to-[hsl(var(--glow-cyan))] shadow-[0_0_10px_hsl(var(--glow-cyan)/0.4)]"
                />
              ))}
            </div>
          </motion.div>
 
         {/* Floating Notification */}
         <FloatingNotification />
 
          {/* Floating Stats Card - repositioned to avoid overlap */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute -right-4 -top-4 rounded-xl p-3 border border-[hsl(var(--glow-cyan)/0.4)] shadow-[0_0_25px_hsl(var(--glow-cyan)/0.2)]"
            style={{ transform: 'translateZ(40px)', background: 'linear-gradient(135deg, hsl(216 60% 15% / 0.95), hsl(220 70% 8% / 0.95))' }}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--glow-cyan))] drop-shadow-[0_0_6px_hsl(var(--glow-cyan)/0.6)]" />
              <div>
                <div className="text-lg font-bold text-[hsl(var(--glow-cyan))]">+24.5%</div>
                <div className="text-xs text-[hsl(var(--star-white)/0.6)]">This week</div>
              </div>
            </div>
          </motion.div>
       </motion.div>
 
       {/* Glow effect behind dashboard */}
       <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl -z-10" />
     </div>
   );
 };
 
const ProgressBar = ({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) => {
    const colorMap = {
      primary: { bar: 'from-[hsl(var(--glow-cyan)/0.7)] to-[hsl(var(--glow-cyan))]', shadow: 'shadow-[0_0_10px_hsl(var(--glow-cyan)/0.4)]' },
      secondary: { bar: 'from-[hsl(var(--glow-blue)/0.7)] to-[hsl(var(--glow-blue))]', shadow: 'shadow-[0_0_10px_hsl(var(--glow-blue)/0.4)]' },
      accent: { bar: 'from-[hsl(var(--glow-purple)/0.7)] to-[hsl(var(--glow-purple))]', shadow: 'shadow-[0_0_10px_hsl(var(--glow-purple)/0.4)]' },
    };

    const c = colorMap[color as keyof typeof colorMap];

    return (
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[hsl(var(--star-white)/0.7)]">{label}</span>
          <span className="text-[hsl(var(--star-white))] font-semibold">{value}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[hsl(var(--midnight)/0.6)] overflow-hidden border border-[hsl(var(--glass-border)/0.2)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${c.bar} ${c.shadow}`}
          />
        </div>
      </div>
    );
  };
 
 const FloatingNotification = () => {
   const [isVisible, setIsVisible] = useState(false);
 
   useEffect(() => {
     const showTimer = setTimeout(() => setIsVisible(true), 2000);
     const hideTimer = setTimeout(() => setIsVisible(false), 6000);
     
     const interval = setInterval(() => {
       setIsVisible(true);
       setTimeout(() => setIsVisible(false), 4000);
     }, 10000);
 
     return () => {
       clearTimeout(showTimer);
       clearTimeout(hideTimer);
       clearInterval(interval);
     };
   }, []);
 
    return (
      <motion.div
        initial={{ opacity: 0, x: -30, y: 0 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          x: isVisible ? 0 : -30,
        }}
        transition={{ duration: 0.4 }}
        className="absolute -left-6 bottom-1/4 rounded-xl p-3 flex items-center gap-3 border border-[hsl(var(--glow-cyan)/0.3)] shadow-[0_0_20px_hsl(var(--glow-cyan)/0.15)]"
        style={{ transform: 'translateZ(60px)', background: 'linear-gradient(135deg, hsl(216 60% 15% / 0.95), hsl(220 70% 8% / 0.95))' }}
      >
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--glow-cyan)/0.2)] flex items-center justify-center">
          <Bell className="w-4 h-4 text-[hsl(var(--glow-cyan))] drop-shadow-[0_0_4px_hsl(var(--glow-cyan)/0.6)]" />
        </div>
        <div>
          <div className="text-xs font-semibold text-[hsl(var(--star-white))]">New Citation</div>
          <div className="text-xs text-[hsl(var(--star-white)/0.5)]">Paper referenced 12 times</div>
        </div>
        {/* Progress bar */}
        <motion.div 
          className="absolute bottom-0 left-0 h-[2px] bg-[hsl(var(--glow-cyan))] rounded-full shadow-[0_0_6px_hsl(var(--glow-cyan)/0.5)]"
          initial={{ width: '100%' }}
          animate={{ width: isVisible ? '0%' : '100%' }}
          transition={{ duration: 4, ease: 'linear' }}
        />
      </motion.div>
    );
  };