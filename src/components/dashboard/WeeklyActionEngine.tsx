import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Clock,
  ChevronRight
} from "lucide-react";
import { useWeeklyTasks, STAGE_LABELS } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const WeeklyActionEngine = () => {
  const { tasks, isLoading } = useWeeklyTasks();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const priorityColors = {
    high: "bg-destructive/20 text-destructive border-destructive/30",
    medium: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    low: "bg-muted/50 text-muted-foreground border-border/30",
  };

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-secondary" />
            Weekly Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-secondary" />
            Weekly Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Create a project to get personalized action items
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeTasks = tasks.filter(t => !completedTasks.has(t.id));
  const completedCount = completedTasks.size;

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-secondary" />
            Weekly Actions
          </CardTitle>
          {completedCount > 0 && (
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              {completedCount}/{tasks.length} done
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeTasks.slice(0, 5).map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "p-3 rounded-lg border transition-all duration-200",
              completedTasks.has(task.id) 
                ? "bg-primary/5 border-primary/20 opacity-60" 
                : "bg-muted/30 border-border/30 hover:border-primary/30"
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={completedTasks.has(task.id)}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  completedTasks.has(task.id) 
                    ? "text-muted-foreground line-through" 
                    : "text-foreground"
                )}>
                  {task.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    {STAGE_LABELS[task.stage]}
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedTime}
                  </span>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn("text-xs", priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>
            </div>
          </motion.div>
        ))}

        {activeTasks.length > 5 && (
          <button className="w-full py-2 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
            View {activeTasks.length - 5} more tasks
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};
