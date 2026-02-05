import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Bell
} from "lucide-react";
import { DashboardStats, STAGE_LABELS } from "@/hooks/use-dashboard-data";

type Props = {
  stats: DashboardStats;
  isLoading: boolean;
};

export const StatsCards = ({ stats, isLoading }: Props) => {
  const cards = [
    {
      title: "Current Stage",
      value: stats.currentProject?.currentStage 
        ? STAGE_LABELS[stats.currentProject.currentStage] || stats.currentProject.currentStage.replace(/_/g, " ")
        : "No project",
      subtitle: stats.currentProject 
        ? `${stats.overallProgress}% complete`
        : "Create a project to start",
      icon: Target,
      color: "primary",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects.toString(),
      subtitle: stats.totalProjects > stats.activeProjects 
        ? `${stats.totalProjects} total` 
        : "Start your research journey",
      icon: TrendingUp,
      color: "secondary",
    },
    {
      title: "Stages Completed",
      value: `${stats.completedStages}/${stats.totalStages || 7}`,
      subtitle: stats.totalProjects > 0 
        ? "Across all projects" 
        : "Complete stages to progress",
      icon: Users,
      color: "accent",
    },
    {
      title: "Notifications",
      value: stats.unreadNotifications.toString(),
      subtitle: stats.unreadNotifications > 0 
        ? "Unread messages" 
        : "All caught up!",
      icon: Bell,
      color: "primary",
    },
  ];

  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
  };

  const glowClasses = {
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    accent: "bg-accent/10",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass card-lift border-border/40 overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 ${glowClasses[card.color as keyof typeof glowClasses]} rounded-full blur-2xl`} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${colorClasses[card.color as keyof typeof colorClasses].split(" ")[0]}`} />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted/30 rounded animate-pulse mt-1" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
