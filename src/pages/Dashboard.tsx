import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Users, 
  BookOpen, 
  Bell, 
  TrendingUp,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
  Zap,
  Trophy,
  Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { data: me } = useCurrentUser();
  const navigate = useNavigate();

  const currentUser = me?.user;

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

  const researchStages = [
    { name: "Exploration", progress: 100, status: "completed" },
    { name: "Topic Discovery", progress: 100, status: "completed" },
    { name: "Literature Review", progress: 65, status: "in-progress" },
    { name: "Methodology", progress: 0, status: "upcoming" },
    { name: "Execution", progress: 0, status: "upcoming" },
    { name: "Documentation", progress: 0, status: "upcoming" },
    { name: "Publication", progress: 0, status: "upcoming" },
  ];

  const recentActivities = [
    { action: "Completed literature review checkpoint", time: "2 hours ago", icon: Trophy },
    { action: "Received feedback from mentor", time: "5 hours ago", icon: Users },
    { action: "Added new research paper", time: "1 day ago", icon: BookOpen },
    { action: "Updated project timeline", time: "2 days ago", icon: Calendar },
  ];

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
              Welcome back, <span className="gradient-text">{currentUser?.fullName?.split(" ")[0] || "Researcher"}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Continue your research journey. You're making great progress!
            </p>
          </div>
          <Button 
            className="btn-ripple bg-gradient-to-r from-primary to-secondary text-primary-foreground gap-2"
            onClick={() => navigate("/projects")}
          >
            <Rocket className="h-4 w-4" />
            Start New Project
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass card-lift border-border/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Current Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {currentUser?.currentJourneyStage?.replace("_", " ") || "Literature Review"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">65% complete</p>
            </CardContent>
          </Card>

          <Card className="glass card-lift border-border/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                Projects Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
              <p className="text-xs text-muted-foreground mt-1">+1 this month</p>
            </CardContent>
          </Card>

          <Card className="glass card-lift border-border/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Mentor Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground mt-1">Next: Tomorrow, 3PM</p>
            </CardContent>
          </Card>

          <Card className="glass card-lift border-border/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Research Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">47h</div>
              <p className="text-xs text-muted-foreground mt-1">This week: 12h</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Research Progress */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass border-border/40 h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Research Journey Progress
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Track your progress through the research pipeline
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/pipeline")}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {researchStages.map((stage, index) => (
                  <div key={stage.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          stage.status === "completed" 
                            ? "bg-primary text-primary-foreground" 
                            : stage.status === "in-progress"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </span>
                        <span className={stage.status === "in-progress" ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {stage.name}
                        </span>
                      </div>
                      <span className={stage.status === "in-progress" ? "text-primary font-medium" : "text-muted-foreground"}>
                        {stage.progress}%
                      </span>
                    </div>
                    <Progress 
                      value={stage.progress} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Activity */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Rocket className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-muted/30 hover:bg-muted/50 border-border/40"
                  onClick={() => navigate("/projects")}
                >
                  <BookOpen className="mr-3 h-4 w-4 text-primary" />
                  View My Projects
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-muted/30 hover:bg-muted/50 border-border/40"
                  onClick={() => navigate("/matching")}
                >
                  <Users className="mr-3 h-4 w-4 text-secondary" />
                  Find Mentors
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-muted/30 hover:bg-muted/50 border-border/40"
                  onClick={() => navigate("/resources")}
                >
                  <BookOpen className="mr-3 h-4 w-4 text-accent" />
                  Browse Resources
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-muted/30 hover:bg-muted/50 border-border/40"
                  onClick={() => navigate("/community")}
                >
                  <Bell className="mr-3 h-4 w-4 text-primary" />
                  Community Forum
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-secondary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-1">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Research Interests & Skills */}
        {(currentUser?.researchInterests?.length || currentUser?.skillTags?.length) && (
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
            {currentUser?.researchInterests && currentUser.researchInterests.length > 0 && (
              <Card className="glass border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Your Research Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.researchInterests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm rounded-full bg-primary/15 text-primary border border-primary/20"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {currentUser?.skillTags && currentUser.skillTags.length > 0 && (
              <Card className="glass border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Your Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.skillTags.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm rounded-full bg-secondary/15 text-secondary border border-secondary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Getting Started (for new users) */}
        {!currentUser?.currentJourneyStage && (
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Getting Started with SochX
                </CardTitle>
                <CardDescription>
                  Complete these steps to begin your research journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Complete Your Profile</h4>
                    <p className="text-sm text-muted-foreground">Add your research interests, skills, and academic level</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mb-3">
                      <span className="text-secondary font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Create Your First Project</h4>
                    <p className="text-sm text-muted-foreground">Start tracking your research with a new project</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                      <span className="text-accent font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Connect with a Mentor</h4>
                    <p className="text-sm text-muted-foreground">Get matched with experienced researchers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardShell>
  );
};

export default Dashboard;
