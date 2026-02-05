import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Circle,
  PlayCircle
} from "lucide-react";
import { Project, RESEARCH_STAGES, STAGE_LABELS } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";

type Props = {
  project: Project | null;
};

export const PipelineTracker = ({ project }: Props) => {
  const navigate = useNavigate();

  const getStageData = (stageName: string) => {
    if (!project?.stages) return { completion: 0, status: "upcoming" as const };
    const stage = project.stages.find(s => s.stage === stageName);
    const completion = stage?.completion || 0;
    
    let status: "completed" | "in-progress" | "upcoming" = "upcoming";
    if (completion === 100) status = "completed";
    else if (completion > 0) status = "in-progress";
    else if (project.currentStage === stageName) status = "in-progress";
    
    return { completion, status };
  };

  const stages = RESEARCH_STAGES.map(stage => ({
    name: stage,
    label: STAGE_LABELS[stage],
    ...getStageData(stage)
  }));

  // Find current stage index
  const currentIndex = stages.findIndex(s => s.status === "in-progress");

  return (
    <Card className="glass border-border/40 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Research Pipeline
            </CardTitle>
            <CardDescription className="mt-1">
              {project ? "Track your progress through each stage" : "Create a project to start"}
            </CardDescription>
          </div>
          {project && (
            <Button variant="outline" size="sm" onClick={() => navigate("/pipeline")}>
              Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, index) => (
          <motion.div 
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {/* Status Icon */}
                {stage.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : stage.status === "in-progress" ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <PlayCircle className="h-5 w-5 text-secondary" />
                  </motion.div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                
                {/* Stage Label */}
                <span className={cn(
                  "font-medium transition-colors",
                  stage.status === "completed" && "text-primary",
                  stage.status === "in-progress" && "text-foreground",
                  stage.status === "upcoming" && "text-muted-foreground"
                )}>
                  {stage.label}
                </span>
              </div>
              
              {/* Percentage */}
              <span className={cn(
                "text-xs font-medium",
                stage.status === "in-progress" && "text-secondary",
                stage.status === "completed" && "text-primary",
                stage.status === "upcoming" && "text-muted-foreground"
              )}>
                {stage.completion}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <Progress 
                value={stage.completion} 
                className={cn(
                  "h-1.5",
                  stage.status === "upcoming" && "opacity-40"
                )}
              />
              
              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className={cn(
                  "absolute left-[9px] top-3 w-0.5 h-4",
                  index < currentIndex ? "bg-primary/50" : "bg-border/50"
                )} />
              )}
            </div>
          </motion.div>
        ))}

        {!project && (
          <div className="pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Create a project to start tracking your research journey
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/projects")}
              className="gap-2"
            >
              Create Project
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
