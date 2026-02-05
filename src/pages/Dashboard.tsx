import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Users, BookOpen, Bell } from "lucide-react";

const Dashboard = () => {
  const { data: me } = useCurrentUser();
  const navigate = useNavigate();

  const currentUser = me?.user;

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-background/60 backdrop-blur border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">👋</span> Welcome back
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p className="text-base font-medium text-foreground">
                {currentUser?.fullName ?? "Researcher"}
              </p>
              <p>{currentUser?.academicLevel ?? "Set your academic level"}</p>
              <p>
                Current stage:{" "}
                <span className="font-medium">
                  {currentUser?.currentJourneyStage ?? "Not started"}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/projects")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Projects
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/matching")}
              >
                <Users className="mr-2 h-4 w-4" />
                Find Mentors
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/community")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Community
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-background/60 backdrop-blur border-border/60">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="rounded-md bg-muted/60 px-3 py-2">
                <p className="font-medium text-foreground">1. Complete your profile</p>
                <p className="text-xs">Add your research interests and skills</p>
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-2">
                <p className="font-medium text-foreground">2. Create a project</p>
                <p className="text-xs">Start tracking your research journey</p>
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-2">
                <p className="font-medium text-foreground">3. Find a mentor</p>
                <p className="text-xs">Get matched with experienced researchers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research Interests */}
        {currentUser?.researchInterests && currentUser.researchInterests.length > 0 && (
          <Card className="bg-background/60 backdrop-blur border-border/60">
            <CardHeader>
              <CardTitle>Your Research Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentUser.researchInterests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {currentUser?.skillTags && currentUser.skillTags.length > 0 && (
          <Card className="bg-background/60 backdrop-blur border-border/60">
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentUser.skillTags.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full bg-secondary/10 text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
