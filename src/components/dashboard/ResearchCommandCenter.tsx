import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Rocket, 
  Target, 
  Calendar, 
  ArrowRight, 
  Upload, 
  MessageSquare,
  Clock,
  AlertCircle
} from "lucide-react";
import { Project, STAGE_LABELS } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";

type Props = {
  project: Project | null;
  upcomingMilestones: {
    projectId: string;
    projectTitle: string;
    stage: string;
    title: string;
    dueDate: string;
    daysRemaining: number;
  }[];
};

export const ResearchCommandCenter = ({ project, upcomingMilestones }: Props) => {
  const navigate = useNavigate();

  if (!project) {
    return (
      <Card className="glass border-border/40 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Start Your Research Journey
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first project to begin tracking your research progress and get personalized guidance.
          </p>
          <Button 
            onClick={() => navigate("/projects")}
            className="bg-gradient-to-r from-primary to-secondary gap-2"
          >
            <Rocket className="h-4 w-4" />
            Create First Project
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStage = project.currentStage || "EXPLORATION";
  const stages = project.stages || [];
  const currentStageData = stages.find(s => s.stage === currentStage);
  const stageCompletion = currentStageData?.completion || 0;

  // Calculate overall project progress
  const overallProgress = stages.length > 0
    ? Math.round(stages.reduce((acc, s) => acc + s.completion, 0) / 7)
    : 0;

  // Find next milestone
  const nextMilestone = upcomingMilestones.find(m => m.projectId === project.id);

  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-primary" />
              Research Command Center
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {project.title}
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Stage & Progress */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Current Stage
            </p>
            <p className="text-lg font-semibold text-foreground">
              {STAGE_LABELS[currentStage] || currentStage.replace(/_/g, " ")}
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Stage Progress</span>
                <span className="text-primary font-medium">{stageCompletion}%</span>
              </div>
              <Progress value={stageCompletion} className="h-2" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Overall Progress
            </p>
            <p className="text-lg font-semibold text-foreground">{overallProgress}% Complete</p>
            <div className="mt-3">
              <Progress value={overallProgress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-xl border flex items-center gap-4",
              nextMilestone.daysRemaining <= 3 
                ? "bg-destructive/10 border-destructive/30" 
                : nextMilestone.daysRemaining <= 7
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-secondary/10 border-secondary/30"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg",
              nextMilestone.daysRemaining <= 3 ? "bg-destructive/20" : "bg-secondary/20"
            )}>
              <Calendar className={cn(
                "h-5 w-5",
                nextMilestone.daysRemaining <= 3 ? "text-destructive" : "text-secondary"
              )} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{nextMilestone.title}</p>
              <p className="text-xs text-muted-foreground">
                {STAGE_LABELS[nextMilestone.stage]} • Due in {nextMilestone.daysRemaining} days
              </p>
            </div>
            {nextMilestone.daysRemaining <= 3 && (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/pipeline")}
            className="bg-muted/30 border-border/40 gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Continue
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects`)}
            className="bg-muted/30 border-border/40 gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/pipeline")}
            className="bg-muted/30 border-border/40 gap-2"
          >
            <Clock className="h-4 w-4" />
            Update
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/matching")}
            className="bg-muted/30 border-border/40 gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
