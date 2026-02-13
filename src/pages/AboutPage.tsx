import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SubpageBackground from '@/components/SubpageBackground';
import { Rocket, Users, Globe, Target, Heart, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const values = [
  { icon: Target, title: 'Mission-Driven', desc: 'We exist to democratize research — making tools, connections, and knowledge accessible to every curious mind, everywhere.' },
  { icon: Users, title: 'Community First', desc: 'SochX is built by researchers, for researchers. Every feature stems from real needs in the research community.' },
  { icon: Globe, title: 'Global by Design', desc: 'Researchers in 180+ countries use SochX. We break down institutional barriers and connect minds across borders.' },
  { icon: Heart, title: 'Open & Transparent', desc: 'We believe in open science. Our platform promotes reproducibility, honest peer review, and accessible knowledge.' },
];

const milestones = [
  { year: '2024', event: 'SochX founded with a vision to reimagine research collaboration' },
  { year: '2024', event: 'Launched beta with 500 researchers across 12 universities' },
  { year: '2025', event: 'Reached 10,000 active users and 500K indexed papers' },
  { year: '2025', event: 'Introduced AI-powered matching and the 7-stage research pipeline' },
  { year: '2026', event: '50,000+ researchers, 2.5M papers, partnerships with 45 institutions' },
];

const team = [
  { name: 'Shashwat', role: 'Founder & CEO', desc: 'Researcher turned builder. Passionate about making academic tools as good as consumer apps.' },
  { name: 'Research Team', role: 'Core Contributors', desc: 'A growing team of researchers, engineers, and designers building the future of academic collaboration.' },
];

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <SubpageBackground />
      <Navbar />

      <main className="relative z-10 pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full glass border border-secondary/20 text-sm text-muted-foreground mb-6">
              <Rocket className="w-4 h-4 inline mr-2 text-secondary" />
              About SochX
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Research Should Be <span className="gradient-text-animated">Borderless</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              SochX was born from a simple frustration: research tools haven't kept up with researchers. 
              We're building the platform we wished existed — one that makes collaboration natural, 
              progress visible, and discovery inevitable.
            </p>
          </motion.div>
        </section>

        {/* Values */}
        <section className="container mx-auto px-6 mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
          >
            What We <span className="gradient-text">Stand For</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 glow-border"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="container mx-auto px-6 mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
          >
            Our <span className="gradient-text">Journey</span>
          </motion.h2>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-accent/50" />
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-16 pb-8 last:pb-0"
              >
                <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
                <span className="text-xs font-semibold text-primary">{m.year}</span>
                <p className="text-foreground mt-1">{m.event}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="container mx-auto px-6 mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
          >
            The <span className="gradient-text">People</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {team.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-primary-foreground text-xl font-bold">
                  {t.name[0]}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
                <p className="text-sm text-primary mb-2">{t.role}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 max-w-3xl mx-auto text-center"
          >
            <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Join the Movement?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Whether you're starting your first study or publishing your 50th paper, SochX is built for you.
            </p>
            <Button
              size="lg"
              className="btn-ripple bg-gradient-to-r from-primary to-secondary text-primary-foreground group"
              onClick={() => navigate('/auth/register')}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
