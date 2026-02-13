import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SubpageBackground from '@/components/SubpageBackground';
import { BookOpen, FileText, TrendingUp, Search, ArrowRight, Layers, Microscope, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const researchAreas = [
  { icon: Microscope, title: 'Life Sciences', desc: 'Biology, Chemistry, Medicine, Biotech', papers: '450K+' },
  { icon: Layers, title: 'Computer Science', desc: 'AI, ML, Systems, Security', papers: '380K+' },
  { icon: GraduationCap, title: 'Social Sciences', desc: 'Psychology, Economics, Sociology', papers: '290K+' },
  { icon: TrendingUp, title: 'Engineering', desc: 'Mechanical, Civil, Electrical', papers: '320K+' },
  { icon: BookOpen, title: 'Humanities', desc: 'Philosophy, History, Literature', papers: '180K+' },
  { icon: Search, title: 'Environmental', desc: 'Climate, Ecology, Sustainability', papers: '210K+' },
];

const pipelineStages = [
  { name: 'Exploration', desc: 'Discover topics and form initial questions' },
  { name: 'Topic Discovery', desc: 'Narrow down to a focused research question' },
  { name: 'Literature Review', desc: 'Survey existing work and identify gaps' },
  { name: 'Methodology', desc: 'Design your experimental approach' },
  { name: 'Execution', desc: 'Collect data and run experiments' },
  { name: 'Documentation', desc: 'Write up findings and analysis' },
  { name: 'Publication', desc: 'Submit, review, and publish' },
];

const ResearchPage = () => {
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
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full glass border border-primary/20 text-sm text-muted-foreground mb-6">
              <BookOpen className="w-4 h-4 inline mr-2 text-primary" />
              Research Ecosystem
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Your Research, <span className="gradient-text-animated">Structured & Supported</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              SochX provides a guided 7-stage pipeline, millions of indexed papers, and AI-powered
              tools to take your research from a spark of curiosity to published impact.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="btn-ripple bg-gradient-to-r from-primary to-secondary text-primary-foreground group"
                onClick={() => navigate('/auth/register')}
              >
                Start Your Journey
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="glass border-glass-border hover:border-primary/50">
                Browse Papers
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Pipeline */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The 7-Stage <span className="gradient-text">Research Pipeline</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A structured journey from initial exploration to published paper.
            </p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-accent/50" />

            {pipelineStages.map((stage, i) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-16 pb-8 last:pb-0"
              >
                <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background" />
                <div className="glass rounded-xl p-5 glow-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-primary font-semibold">Stage {i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{stage.name}</h3>
                  <p className="text-sm text-muted-foreground">{stage.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Research Areas */}
        <section className="container mx-auto px-6 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Explore <span className="gradient-text">Research Areas</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Millions of papers across every major discipline, always growing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {researchAreas.map((area, i) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass rounded-2xl p-6 glow-border group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <area.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{area.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{area.desc}</p>
                <span className="text-xs font-medium text-primary">{area.papers} papers indexed</span>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ResearchPage;
