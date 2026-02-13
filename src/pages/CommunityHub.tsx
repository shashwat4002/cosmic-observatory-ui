import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SubpageBackground from '@/components/SubpageBackground';
import { MessageSquare, TrendingUp, Users, ArrowUp, Clock, Tag, Flame, Lightbulb, BookOpen, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const categories = [
  { name: 'Breakthroughs', icon: Flame, color: 'text-destructive', count: 142 },
  { name: 'Methodology', icon: Beaker, color: 'text-primary', count: 89 },
  { name: 'Ideas Lab', icon: Lightbulb, color: 'text-accent', count: 234 },
  { name: 'Paper Reviews', icon: BookOpen, color: 'text-secondary', count: 67 },
  { name: 'Collaboration', icon: Users, color: 'text-primary', count: 156 },
];

const threads = [
  {
    id: 1,
    title: 'How I used transformer models to predict protein folding — a practical guide',
    author: 'Dr. Aisha Patel',
    category: 'Breakthroughs',
    upvotes: 342,
    comments: 47,
    timeAgo: '3h ago',
    tags: ['AI/ML', 'Biology'],
    excerpt: 'After 6 months of experimentation, our lab achieved 94% accuracy in predicting secondary protein structures using a modified attention mechanism...',
  },
  {
    id: 2,
    title: 'Is peer review fundamentally broken? An open discussion',
    author: 'Prof. James Miller',
    category: 'Ideas Lab',
    upvotes: 289,
    comments: 103,
    timeAgo: '5h ago',
    tags: ['Academia', 'Open Science'],
    excerpt: 'The average review time has increased from 80 to 130 days over the past decade. What structural changes could fix this?',
  },
  {
    id: 3,
    title: 'Best statistical frameworks for small-sample behavioral studies?',
    author: 'Sarah Kim',
    category: 'Methodology',
    upvotes: 156,
    comments: 38,
    timeAgo: '8h ago',
    tags: ['Statistics', 'Psychology'],
    excerpt: 'Working with n=12 participants due to a rare condition. Bayesian approaches seem promising but I\'d love to hear alternatives...',
  },
  {
    id: 4,
    title: 'Paper Review: "Quantum Error Correction at Scale" — Nature 2026',
    author: 'Dr. Marcus Weber',
    category: 'Paper Reviews',
    upvotes: 201,
    comments: 29,
    timeAgo: '12h ago',
    tags: ['Quantum', 'Physics'],
    excerpt: 'This paper claims a 10x improvement in error correction rates. Let\'s break down the methodology and see if the claims hold up...',
  },
  {
    id: 5,
    title: 'Looking for collaborators: Large-scale climate modeling project',
    author: 'Elena Rodriguez',
    category: 'Collaboration',
    upvotes: 178,
    comments: 52,
    timeAgo: '1d ago',
    tags: ['Climate', 'Data Science'],
    excerpt: 'We have 15 years of satellite data and need ML expertise. Open to researchers from any institution...',
  },
];

const CommunityHub = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');

  const filteredThreads = activeCategory 
    ? threads.filter(t => t.category === activeCategory) 
    : threads;

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <SubpageBackground />
      <Navbar />

      <main className="relative z-10 pt-28 pb-20">
        {/* Hero */}
        <section className="container mx-auto px-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              The Research <span className="gradient-text-animated">Forum</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Where researchers discuss breakthroughs, review papers, share methodologies, and find collaborators. 
              Think of it as the intellectual commons — no memes, all substance.
            </p>
          </motion.div>
        </section>

        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar - Categories */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass rounded-2xl p-5 sticky top-28">
                <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Spaces</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      !activeCategory ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>All Discussions</span>
                    <span className="ml-auto text-xs">{threads.length}</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        activeCategory === cat.name ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <cat.icon className={`w-4 h-4 ${cat.color}`} />
                      <span>{cat.name}</span>
                      <span className="ml-auto text-xs">{cat.count}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Trending Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['AI/ML', 'Climate', 'Open Science', 'Quantum', 'Biology', 'Ethics'].map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Main Feed */}
            <div>
              {/* Sort Bar */}
              <div className="flex items-center gap-2 mb-6">
                {(['hot', 'new', 'top'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      sortBy === s ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {s === 'hot' && <Flame className="w-3.5 h-3.5" />}
                    {s === 'new' && <Clock className="w-3.5 h-3.5" />}
                    {s === 'top' && <TrendingUp className="w-3.5 h-3.5" />}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
                <div className="flex-1" />
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  New Discussion
                </Button>
              </div>

              {/* Threads */}
              <div className="space-y-4">
                {filteredThreads.map((thread, i) => (
                  <motion.article
                    key={thread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass rounded-2xl p-5 glow-border group cursor-pointer hover:border-primary/20 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Upvote */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <button className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                          <ArrowUp className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold text-foreground">{thread.upvotes}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                          <span className="text-primary font-medium">{thread.category}</span>
                          <span>•</span>
                          <span>{thread.author}</span>
                          <span>•</span>
                          <span>{thread.timeAgo}</span>
                        </div>

                        <h3 className="text-foreground font-semibold mb-2 group-hover:text-primary transition-colors leading-snug">
                          {thread.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {thread.excerpt}
                        </p>

                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            {thread.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/50 text-[11px] text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{thread.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityHub;
