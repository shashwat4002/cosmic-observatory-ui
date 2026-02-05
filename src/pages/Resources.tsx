import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Search, Filter, Download, ExternalLink,
  Bookmark, BookmarkCheck, FileText, Video, Link as LinkIcon,
  Layout, Wrench, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ResourceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  url: string | null;
  file_url: string | null;
  tags: string[] | null;
  is_featured: boolean;
  view_count: number;
  download_count: number;
  category_id: string | null;
  created_at: string;
}

const typeIcons: Record<string, typeof FileText> = {
  document: FileText,
  video: Video,
  link: LinkIcon,
  template: Layout,
  guide: BookOpen,
  tool: Wrench,
};

export default function Resources() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchResources();
    if (user) fetchBookmarks();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('resource_categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('resource_bookmarks')
        .select('resource_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(new Set(data?.map((b) => b.resource_id) || []));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (resourceId: string) => {
    if (!user) {
      toast.error('Please sign in to bookmark resources');
      return;
    }

    const isBookmarked = bookmarks.has(resourceId);

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('resource_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);

        if (error) throw error;
        setBookmarks((prev) => {
          const next = new Set(prev);
          next.delete(resourceId);
          return next;
        });
        toast.success('Bookmark removed');
      } else {
        const { error } = await supabase
          .from('resource_bookmarks')
          .insert({ user_id: user.id, resource_id: resourceId });

        if (error) throw error;
        setBookmarks((prev) => new Set(prev).add(resourceId));
        toast.success('Resource bookmarked');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const trackResourceAccess = async (resource: Resource) => {
    if (!user) return;
    try {
      await supabase.from('resource_access_logs').insert({
        user_id: user.id,
        resource_id: resource.id,
      });
      
      await supabase
        .from('resources')
        .update({ view_count: (resource.view_count || 0) + 1 })
        .eq('id', resource.id);
    } catch (error) {
      console.error('Error tracking access:', error);
    }
  };

  const openResource = (resource: Resource) => {
    trackResourceAccess(resource);
    const url = resource.url || resource.file_url;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || resource.category_id === selectedCategory;
    const matchesType = !selectedType || resource.resource_type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredResources = filteredResources.filter((r) => r.is_featured);
  const regularResources = filteredResources.filter((r) => !r.is_featured);

  return (
    <DashboardLayout title="Resources" subtitle="Curated resources for your research journey">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : 'Category'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem key={category.id} onClick={() => setSelectedCategory(category.id)}>
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'Type'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedType(null)}>All Types</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('document')}>Document</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('video')}>Video</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('link')}>Link</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('template')}>Template</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('guide')}>Guide</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedType('tool')}>Tool</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No resources found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory || selectedType
              ? 'Try adjusting your search or filters'
              : 'Resources will be added soon'}
          </p>
        </div>
      ) : (
        <>
          {/* Featured Resources */}
          {featuredResources.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Featured Resources</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredResources.map((resource, index) => {
                  const Icon = typeIcons[resource.resource_type] || FileText;
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass rounded-xl p-6 border border-primary/30 glow-border"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="secondary" className="bg-primary/20 text-primary">Featured</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {resource.view_count}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleBookmark(resource.id)}
                          >
                            {bookmarks.has(resource.id) ? (
                              <BookmarkCheck className="w-5 h-5 text-primary" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </Button>
                          <Button size="sm" onClick={() => openResource(resource)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Resources */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">All Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularResources.map((resource, index) => {
                const Icon = typeIcons[resource.resource_type] || FileText;
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="glass rounded-xl p-5 card-lift"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-1">{resource.title}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{resource.resource_type}</p>
                      </div>
                    </div>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {resource.view_count} views
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleBookmark(resource.id)}
                        >
                          {bookmarks.has(resource.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openResource(resource)}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
