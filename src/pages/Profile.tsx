import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, MapPin, Calendar, ExternalLink, Linkedin, Twitter,
  Globe, Mail, FolderKanban, Users, Star, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  institution: string | null;
  expertise_areas: string[] | null;
  research_interests: string[] | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  is_available_for_mentoring: boolean;
  is_verified: boolean;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  progress_percentage: number;
}

export default function Profile() {
  const { id } = useParams();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = !id || id === user?.id;
  const profileId = id || user?.id;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      fetchProjects();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('research_projects')
        .select('id, title, status, progress_percentage')
        .eq('owner_id', profileId)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Profile" subtitle="Loading...">
        <div className="animate-pulse space-y-6">
          <div className="glass rounded-xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="h-8 bg-muted rounded w-48 mb-2" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="Profile" subtitle="User not found">
        <div className="glass rounded-xl p-12 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">User Not Found</h2>
          <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={profile.full_name || 'Profile'} 
      subtitle={isOwnProfile ? 'Your profile' : 'User profile'}
    >
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-8 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-primary-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-foreground">{profile.full_name || 'Anonymous'}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{profile.role}</Badge>
                {profile.is_verified && (
                  <Badge className="bg-primary/20 text-primary">Verified</Badge>
                )}
                {profile.is_available_for_mentoring && profile.role === 'mentor' && (
                  <Badge className="bg-green-500/20 text-green-400">Available for Mentoring</Badge>
                )}
              </div>
            </div>

            {profile.institution && (
              <p className="text-muted-foreground flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                {profile.institution}
              </p>
            )}

            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" />
              Joined {formatDate(profile.created_at)}
            </p>

            {profile.bio && (
              <p className="text-foreground mb-4">{profile.bio}</p>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              {profile.website_url && (
                <a
                  href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://twitter.com/${profile.twitter_url.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <Link to="/settings">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Research Interests */}
            {profile.research_interests && profile.research_interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Research Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.research_interests.map((interest) => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Expertise Areas */}
            {profile.expertise_areas && profile.expertise_areas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Expertise Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise_areas.map((area) => (
                    <Badge key={area} variant="outline">{area}</Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          {projects.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <FolderKanban className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Public Projects</h3>
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? 'Your public projects will appear here'
                  : 'This user has no public projects'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-foreground line-clamp-1">{project.title}</h4>
                    <Badge variant="outline" className="capitalize text-xs">
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{project.progress_percentage}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <div className="glass rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Activity Feed</h3>
            <p className="text-muted-foreground">Recent activity will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
