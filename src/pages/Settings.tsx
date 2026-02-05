import { DashboardShell } from "@/components/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { ThemeSelector } from "@/components/ThemeToggle";
import { Bell, Shield, Palette, LogOut, Trash2 } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const { logout } = useAuthActions();

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion",
      description:
        "Wire this button to a backend /users/me DELETE endpoint before enabling in production.",
    });
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and privacy</p>
        </div>

        {/* Theme Settings */}
        <Card className="glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Appearance</CardTitle>
                <CardDescription>Customize how SochX looks on your device</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme Mode</Label>
              <ThemeSelector />
              <p className="text-xs text-muted-foreground">
                Choose between light, dark, or system theme
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-xl">Notifications</CardTitle>
                <CardDescription>Control how you receive updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Email Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for mentor feedback and match requests
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="space-y-1">
                <Label className="text-sm font-medium">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Real-time updates via the notification center
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Weekly Digest</Label>
                <p className="text-xs text-muted-foreground">
                  Get a summary of your research progress every week
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Account & Privacy */}
        <Card className="glass border-border/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-xl">Account & Privacy</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Profile Visibility</Label>
                <p className="text-xs text-muted-foreground">
                  Allow other researchers to discover your profile
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="pt-4 border-t border-border/60">
              <Button
                variant="outline"
                onClick={async () => {
                  await logout.mutateAsync();
                  toast({ title: "Signed out successfully" });
                }}
                className="w-full justify-start gap-3"
              >
                <LogOut className="w-4 h-4" />
                Sign out of SochX
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Danger Zone</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Permanently delete your profile, projects, and community history. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                Request Account Deletion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
};

export default Settings;
