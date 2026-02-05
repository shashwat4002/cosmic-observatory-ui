import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "@/components/DashboardShell";
import { useCurrentUser } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-dashboard-data";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles } from "lucide-react";

// Dashboard Components
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ResearchCommandCenter } from "@/components/dashboard/ResearchCommandCenter";
import { PipelineTracker } from "@/components/dashboard/PipelineTracker";
import { WeeklyActionEngine } from "@/components/dashboard/WeeklyActionEngine";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const { stats, notifications, isLoading } = useDashboardStats();

  const user = userData?.user;

  // Dashboard Startup Logic
  useEffect(() => {
    if (!userLoading && user) {
      // Check if user needs onboarding
      const onboardingCompleted = user.researchInterests && user.researchInterests.length > 0;
      
      if (!onboardingCompleted) {
        navigate("/onboarding");
      }
    }
  }, [user, userLoading, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <DashboardShell>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, <span className="gradient-text">{user?.fullName?.split(" ")[0] || "Researcher"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {stats.currentProject 
                ? `Continue working on "${stats.currentProject.title}"`
                : "Start your research journey today"
              }
            </p>
          </div>
          <Button 
            className="btn-ripple bg-gradient-to-r from-primary to-secondary text-primary-foreground gap-2"
            onClick={() => navigate("/projects")}
          >
            <Rocket className="h-4 w-4" />
            {stats.totalProjects > 0 ? "New Project" : "Create First Project"}
          </Button>
        </motion.div>

        {/* Stats Cards - Real Data */}
        <motion.div variants={itemVariants}>
          <StatsCards stats={stats} isLoading={isLoading} />
        </motion.div>

        {/* Research Command Center */}
        <motion.div variants={itemVariants}>
          <ResearchCommandCenter 
            project={stats.currentProject} 
            upcomingMilestones={stats.upcomingMilestones}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pipeline Tracker */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <PipelineTracker project={stats.currentProject} />
          </motion.div>

          {/* Weekly Actions */}
          <motion.div variants={itemVariants}>
            <WeeklyActionEngine />
          </motion.div>
        </div>

        {/* Activity & Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <ActivityFeed notifications={notifications} isLoading={isLoading} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <QuickActions />
          </motion.div>
        </div>

        {/* Research Interests & Skills */}
        {(user?.researchInterests?.length || user?.skillTags?.length) && (
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
            {user?.researchInterests && user.researchInterests.length > 0 && (
              <div className="p-6 rounded-xl glass border-border/40">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Research Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.researchInterests.map((interest, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-sm rounded-full bg-primary/15 text-primary border border-primary/20"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user?.skillTags && user.skillTags.length > 0 && (
              <div className="p-6 rounded-xl glass border-border/40">
                <h3 className="text-lg font-semibold text-foreground mb-3">Your Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skillTags.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-sm rounded-full bg-secondary/15 text-secondary border border-secondary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </DashboardShell>
  );
};

export default Dashboard;
