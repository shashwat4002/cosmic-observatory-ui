import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Users, BookOpen, Bell,
  Settings, LogOut, Plus, TrendingUp, Target, Clock,
  ChevronRight, MessageCircle, Star, Calendar, CheckCircle2,
  Menu, X, Search, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StarField } from '@/components/StarField';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedMilestones: number;
  pendingTasks: number;
  unreadNotifications: number;
}

interface RecentActivity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  progress_percentage: number;
  updated_at: string;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/projects' },
  { icon: Users, label: 'Matching', href: '/matching' },
  { icon: MessageCircle, label: 'Community', href: '/community' },
  { icon: BookOpen, label: 'Resources', href: '/resources' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedMilestones: 0,
    pendingTasks: 0,
    unreadNotifications: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('research_projects')
        .select('id, title, status, progress_percentage, updated_at')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (projectsData) {
        setProjects(projectsData);
        setStats((prev) => ({
          ...prev,
          totalProjects: projectsData.length,
          activeProjects: projectsData.filter((p) => p.status === 'active').length,
        }));
      }

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('activity_feed')
        .select('id, activity_type, title, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityData) {
        setRecentActivity(activityData);
      }

      // Fetch unread notifications count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      setStats((prev) => ({
        ...prev,
        unreadNotifications: count || 0,
      }));

      // Fetch completed milestones
      const { count: milestonesCount } = await supabase
        .from('milestones')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .in('project_id', projects.map(p => p.id) || []);

      setStats((prev) => ({
        ...prev,
        completedMilestones: milestonesCount || 0,
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative min-h-screen bg-background">
      <StarField />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 glass-strong z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Soch<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = window.location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-border pt-4 mt-4">
            <Link
              to={`/profile/${user?.id}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'User'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-colors mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-64 bg-input border-border"
                />
              </div>
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {stats.unreadNotifications}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.totalProjects}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.activeProjects}</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.completedMilestones}</span>
              </div>
              <p className="text-sm text-muted-foreground">Milestones Done</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats.pendingTasks}</span>
              </div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
            </motion.div>
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Projects */}
            <div className="lg:col-span-2">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
                  <Link to="/projects">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your research journey by creating your first project
                    </p>
                    <Link to="/projects">
                      <Button className="bg-gradient-to-r from-primary to-secondary">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="block p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-foreground">{project.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full capitalize ${
                              project.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : project.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Progress value={project.progress_percentage} className="h-2" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {project.progress_percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated {formatDate(project.updated_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h2>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/projects"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm font-medium">New Project</span>
              </Link>
              <Link
                to="/matching"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-secondary/10 hover:text-secondary transition-colors"
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Find Mentor</span>
              </Link>
              <Link
                to="/community"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-accent/10 hover:text-accent transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm font-medium">Community</span>
              </Link>
              <Link
                to="/resources"
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 hover:bg-green-500/10 hover:text-green-400 transition-colors"
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-sm font-medium">Resources</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
