import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Plus, Search, TrendingUp, Clock,
  ThumbsUp, MessageSquare, Eye, Pin, Lock, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  last_activity_at: string;
  category_id: string;
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const categoryIcons: Record<string, string> = {
  cyan: 'text-cyan-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
  green: 'text-green-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
};

export default function Community() {
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category_id: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchThreads();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey(id, full_name, avatar_url)
        `)
        .order('is_pinned', { ascending: false })
        .order('last_activity_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createThread = async () => {
    if (!user || !newThread.title.trim() || !newThread.content.trim() || !newThread.category_id) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({
          author_id: user.id,
          category_id: newThread.category_id,
          title: newThread.title.trim(),
          content: newThread.content.trim(),
        })
        .select(`
          *,
          author:profiles!forum_threads_author_id_fkey(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setThreads([data, ...threads]);
      setNewThread({ title: '', content: '', category_id: '' });
      setIsCreateDialogOpen(false);
      toast.success('Discussion created!');
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create discussion');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || thread.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout title="Community" subtitle="Connect and discuss with fellow researchers">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Discussion
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-4">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                All Discussions
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className={category.color ? categoryIcons[category.color] : ''}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Threads List */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="recent">
            <TabsList className="glass mb-4">
              <TabsTrigger value="recent">
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="popular">
                <TrendingUp className="w-4 h-4 mr-2" />
                Popular
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))
              ) : filteredThreads.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No discussions found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery ? 'Try adjusting your search' : 'Be the first to start a discussion!'}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Discussion
                  </Button>
                </div>
              ) : (
                filteredThreads.map((thread, index) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-xl p-6 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        {thread.author.avatar_url ? (
                          <img
                            src={thread.author.avatar_url}
                            alt={thread.author.full_name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.is_pinned && <Pin className="w-4 h-4 text-primary" />}
                          {thread.is_locked && <Lock className="w-4 h-4 text-muted-foreground" />}
                          <h3 className="font-semibold text-foreground line-clamp-1">{thread.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {thread.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{thread.author.full_name || 'Anonymous'}</span>
                          <span>{formatDate(thread.created_at)}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {thread.view_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {thread.reply_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="popular">
              <div className="glass rounded-xl p-12 text-center">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Popular Discussions</h3>
                <p className="text-muted-foreground">Coming soon - see the most engaging discussions</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Thread Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-strong border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start a Discussion</DialogTitle>
            <DialogDescription>Share your thoughts, ask questions, or start a conversation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newThread.category_id}
                onValueChange={(value) => setNewThread({ ...newThread, category_id: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="threadTitle">Title</Label>
              <Input
                id="threadTitle"
                placeholder="What's your discussion about?"
                value={newThread.title}
                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threadContent">Content</Label>
              <Textarea
                id="threadContent"
                placeholder="Share more details..."
                value={newThread.content}
                onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                className="bg-input border-border min-h-[200px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={createThread}
              disabled={isCreating || !newThread.title.trim() || !newThread.content.trim() || !newThread.category_id}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {isCreating ? 'Creating...' : 'Create Discussion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
