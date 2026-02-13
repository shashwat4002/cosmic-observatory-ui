import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SubpageBackground from '@/components/SubpageBackground';
import { Briefcase, GraduationCap, Award, Globe, ArrowRight, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const opportunityTypes = [
  { icon: GraduationCap, label: 'Fellowships', count: 48 },
  { icon: Award, label: 'Grants', count: 125 },
  { icon: Briefcase, label: 'Internships', count: 86 },
  { icon: Globe, label: 'Conferences', count: 34 },
];

const opportunities = [
  {
    title: 'MIT Summer Research Fellowship 2026',
    org: 'Massachusetts Institute of Technology',
    type: 'Fellowship',
    location: 'Cambridge, MA',
    deadline: 'Mar 15, 2026',
    stipend: '$6,500/month',
    fields: ['Computer Science', 'Engineering'],
  },
  {
    title: 'NSF Graduate Research Fellowship',
    org: 'National Science Foundation',
    type: 'Grant',
    location: 'Nationwide',
    deadline: 'Apr 1, 2026',
    stipend: '$37,000/year',
    fields: ['STEM', 'Social Sciences'],
  },
  {
    title: 'CERN Summer Student Programme',
    org: 'European Organization for Nuclear Research',
    type: 'Internship',
    location: 'Geneva, Switzerland',
    deadline: 'Jan 31, 2026',
    stipend: 'CHF 3,350/month',
    fields: ['Physics', 'Computing'],
  },
  {
    title: 'Oxford Climate Research Grant',
    org: 'University of Oxford',
    type: 'Grant',
    location: 'Oxford, UK',
    deadline: 'May 20, 2026',
    stipend: '£45,000',
    fields: ['Climate Science', 'Environmental'],
  },
  {
    title: 'Google Research Scholar Program',
    org: 'Google',
    type: 'Grant',
    location: 'Remote',
    deadline: 'Feb 28, 2026',
    stipend: '$60,000',
    fields: ['AI/ML', 'HCI'],
  },
];

const OpportunitiesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <SubpageBackground />
      <Navbar />

      <main className="relative z-10 pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-2 rounded-full glass border border-accent/20 text-sm text-muted-foreground mb-6">
              <Award className="w-4 h-4 inline mr-2 text-accent" />
              Opportunities Board
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Fuel Your Research with <span className="gradient-text-animated">Opportunities</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Curated fellowships, grants, internships, and conferences from top institutions worldwide.
            </p>
          </motion.div>

          {/* Type Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {opportunityTypes.map((type, i) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass rounded-xl p-4 text-center glow-border cursor-pointer group"
              >
                <type.icon className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-semibold text-foreground">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.count} open</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Listings */}
        <section className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {opportunities.map((opp, i) => (
              <motion.div
                key={opp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-6 glow-border group cursor-pointer hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">{opp.type}</span>
                      <span className="text-xs text-muted-foreground">{opp.org}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{opp.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {opp.deadline}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {opp.stipend}</span>
                    </div>
                    <div className="flex gap-2">
                      {opp.fields.map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-full bg-muted/50 text-[11px] text-muted-foreground">{f}</span>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass border-glass-border hover:border-primary/50 group-hover:text-primary self-start">
                    View Details
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              className="btn-ripple bg-gradient-to-r from-primary to-secondary text-primary-foreground"
              onClick={() => navigate('/auth/register')}
            >
              Sign Up to See All Opportunities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OpportunitiesPage;
