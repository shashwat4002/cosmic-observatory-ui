import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, MessageSquare, BookOpen,
  Bell, Settings, Shield, BarChart, TrendingUp, UserCheck,
  UserX, Eye, Trash2, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalThreads: number;
  pendingResources: number;
}

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_verified: boolean;
  created_at: string;
}

interface PendingResource {
  id: string;
  title: string;
  resource_type: string;
  uploaded_by: string;
  created_at: string;
  uploader?: {
    full_name: string | null;
  };
}

export default function AdminPanel() {
  const { profile } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalThreads: 0,
    pendingResources: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [pendingResources, setPendingResources] = useState<PendingResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchPendingResources();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersCount, projectsCount, threadsCount, resourcesCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('research_projects').select('*', { count: 'exact', head: true }),
        supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
        supabase.from('resources').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalProjects: projectsCount.count || 0,
        totalThreads: threadsCount.count || 0,
        pendingResources: resourcesCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_verified, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPendingResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          id, title, resource_type, uploaded_by, created_at,
          uploader:profiles!resources_uploaded_by_fkey(full_name)
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingResources(data || []);
    } catch (error) {
      console.error('Error fetching pending resources:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const toggleUserVerification = async (userId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !isVerified })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map((u) => u.id === userId ? { ...u, is_verified: !isVerified } : u));
      toast.success(isVerified ? 'User unverified' : 'User verified');
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification');
    }
  };

  const approveResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_approved: true })
        .eq('id', resourceId);

      if (error) throw error;

      setPendingResources(pendingResources.filter((r) => r.id !== resourceId));
      setStats((prev) => ({ ...prev, pendingResources: prev.pendingResources - 1 }));
      toast.success('Resource approved');
    } catch (error) {
      console.error('Error approving resource:', error);
      toast.error('Failed to approve resource');
    }
  };

  const rejectResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      setPendingResources(pendingResources.filter((r) => r.id !== resourceId));
      setStats((prev) => ({ ...prev, pendingResources: prev.pendingResources - 1 }));
      toast.success('Resource rejected');
    } catch (error) {
      console.error('Error rejecting resource:', error);
      toast.error('Failed to reject resource');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout title="Access Denied" subtitle="Admin privileges required">
        <div className="glass rounded-xl p-12 text-center">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Panel" subtitle="Manage the platform">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.totalUsers}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.totalProjects}</span>
          </div>
          <p className="text-sm text-muted-foreground">Projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.totalThreads}</span>
          </div>
          <p className="text-sm text-muted-foreground">Forum Threads</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-foreground">{stats.pendingResources}</span>
          </div>
          <p className="text-sm text-muted-foreground">Pending Resources</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="w-4 h-4 mr-2" />
            Resources
            {stats.pendingResources > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-yellow-950">{stats.pendingResources}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="glass rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{user.full_name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="bg-input border border-border rounded px-2 py-1 text-sm"
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserVerification(user.id, user.is_verified)}
                      >
                        {user.is_verified ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pending Resource Approvals</h3>
            {pendingResources.length === 0 ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-muted-foreground">All resources have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <h4 className="font-medium text-foreground">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {resource.resource_type} by {resource.uploader?.full_name || 'Unknown'} - {formatDate(resource.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => rejectResource(resource.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => approveResource(resource.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="glass rounded-xl p-12 text-center">
            <BarChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Platform Analytics</h3>
            <p className="text-muted-foreground">Detailed analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
