import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Trash2, Plus, CheckCircle2, Circle,
  Calendar, Users, FileText, MessageSquare, MoreVertical,
  Clock, Target, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string | null;
  objectives: string | null;
  status: string;
  progress_percentage: number;
  tags: string[] | null;
  start_date: string | null;
  target_end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface PipelineStage {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  stage_id: string | null;
}

const defaultStages = [
  { name: 'Research & Planning', description: 'Define scope, literature review, and planning' },
  { name: 'Data Collection', description: 'Gather data and resources needed' },
  { name: 'Analysis', description: 'Analyze data and findings' },
  { name: 'Writing', description: 'Document findings and write report' },
  { name: 'Review & Finalize', description: 'Peer review and final revisions' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '', due_date: '' });

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchStages();
      fetchMilestones();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('research_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('project_id', id)
        .order('order_index');

      if (error) throw error;

      if (data.length === 0) {
        // Create default stages
        const newStages = defaultStages.map((stage, index) => ({
          project_id: id,
          name: stage.name,
          description: stage.description,
          order_index: index,
          status: 'not_started',
        }));

        const { data: createdStages, error: createError } = await supabase
          .from('pipeline_stages')
          .insert(newStages)
          .select();

        if (createError) throw createError;
        setStages(createdStages);
      } else {
        setStages(data);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const fetchMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', id)
        .order('due_date');

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };

  const updateStageStatus = async (stageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .update({
          status: newStatus,
          started_at: newStatus === 'in_progress' ? new Date().toISOString() : undefined,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
        })
        .eq('id', stageId);

      if (error) throw error;

      setStages(stages.map((s) => 
        s.id === stageId ? { ...s, status: newStatus } : s
      ));

      // Update project progress
      const completedCount = stages.filter((s) => 
        s.id === stageId ? newStatus === 'completed' : s.status === 'completed'
      ).length;
      const progress = Math.round((completedCount / stages.length) * 100);
      
      await supabase
        .from('research_projects')
        .update({ progress_percentage: progress })
        .eq('id', id);

      setProject((prev) => prev ? { ...prev, progress_percentage: progress } : null);
      toast.success('Stage updated');
    } catch (error) {
      console.error('Error updating stage:', error);
      toast.error('Failed to update stage');
    }
  };

  const toggleMilestone = async (milestoneId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', milestoneId);

      if (error) throw error;

      setMilestones(milestones.map((m) =>
        m.id === milestoneId ? { ...m, is_completed: !isCompleted } : m
      ));
      toast.success(isCompleted ? 'Milestone uncompleted' : 'Milestone completed!');
    } catch (error) {
      console.error('Error toggling milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  const createMilestone = async () => {
    if (!newMilestone.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          project_id: id,
          title: newMilestone.title.trim(),
          description: newMilestone.description.trim() || null,
          due_date: newMilestone.due_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      setMilestones([...milestones, data]);
      setNewMilestone({ title: '', description: '', due_date: '' });
      setIsMilestoneDialogOpen(false);
      toast.success('Milestone created');
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'in_progress': return 'text-blue-400 bg-blue-500/20';
      case 'review': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  if (isLoading || !project) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={project.title} subtitle="Project details and pipeline">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/projects')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Button>

      {/* Project Header */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
              <span className={`px-3 py-1 text-sm rounded-full capitalize ${
                project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-muted text-muted-foreground'
              }`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-muted-foreground mb-4">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Started: {formatDate(project.start_date)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-4 h-4" />
                Target: {formatDate(project.target_end_date)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium text-foreground">{project.progress_percentage}%</span>
          </div>
          <Progress value={project.progress_percentage} className="h-3" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Research Pipeline</h2>
            <div className="space-y-4">
              {stages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => {
                        const nextStatus = stage.status === 'not_started' ? 'in_progress' :
                          stage.status === 'in_progress' ? 'completed' : 'not_started';
                        updateStageStatus(stage.id, nextStatus);
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${getStatusColor(stage.status)}`}
                    >
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : stage.status === 'in_progress' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    {index < stages.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${
                        stage.status === 'completed' ? 'bg-green-500' : 'bg-border'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{stage.name}</h3>
                    {stage.description && (
                      <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 capitalize">
                      Status: {stage.status.replace('_', ' ')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Milestones</h2>
              <Button onClick={() => setIsMilestoneDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No milestones yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${
                      milestone.is_completed ? 'bg-green-500/10' : 'bg-muted/30'
                    }`}
                  >
                    <button
                      onClick={() => toggleMilestone(milestone.id, milestone.is_completed)}
                      className={`mt-1 ${milestone.is_completed ? 'text-green-400' : 'text-muted-foreground'}`}
                    >
                      {milestone.is_completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${milestone.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {milestone.title}
                      </h3>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      )}
                      {milestone.due_date && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Due: {formatDate(milestone.due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="files">
          <div className="glass rounded-xl p-6 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Project Files</h3>
            <p className="text-muted-foreground mb-4">Upload and manage project documents</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Upload File
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="glass rounded-xl p-6 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Mentor Feedback</h3>
            <p className="text-muted-foreground">No feedback yet. Connect with a mentor to receive guidance.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Milestone Dialog */}
      <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
        <DialogContent className="glass-strong border-border">
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Create a new milestone for your project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="milestoneTitle">Title</Label>
              <Input
                id="milestoneTitle"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestoneDesc">Description (Optional)</Label>
              <Textarea
                id="milestoneDesc"
                placeholder="Brief description"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestoneDue">Due Date (Optional)</Label>
              <Input
                id="milestoneDue"
                type="date"
                value={newMilestone.due_date}
                onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMilestoneDialogOpen(false)}>Cancel</Button>
            <Button onClick={createMilestone} disabled={!newMilestone.title.trim()}>
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
