import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthActions, useCurrentUser } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { lovable } from "@/integrations/lovable/index";
import { Separator } from "@/components/ui/separator";

const AuthRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuthActions();
  const { data, isLoading } = useCurrentUser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [academicLevel, setAcademicLevel] = useState<string | undefined>();
  const [intendedFieldOfStudy, setIntendedFieldOfStudy] = useState("");
  const [researchInterests, setResearchInterests] = useState("");
  const [skillTags, setSkillTags] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && data?.user) {
      navigate("/dashboard");
    }
  }, [data, isLoading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({
        fullName,
        email,
        password,
        academicLevel,
        intendedFieldOfStudy,
        researchInterests: researchInterests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        skillTags: skillTags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast({
        title: "Account created",
        description: "Please check your email to verify your account before signing in.",
      });
      navigate("/auth/login");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to register right now";
      toast({
        title: "Sign up failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({
          title: "Google sign-up failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Google sign-up failed",
        description: "Unable to connect to Google right now",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl mx-auto">
        <Card className="glass-strong border-glass-border/40 shadow-2xl">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Create your SochX account
              </h1>
              <p className="text-sm text-muted-foreground">
                Share your academic context so we can match you with the right
                projects and mentors.
              </p>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-border/60 bg-background/40 hover:bg-muted/60"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "Connecting..." : "Sign up with Google"}
            </Button>

            <div className="flex items-center gap-3">
              <Separator className="flex-1 bg-border/40" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1 bg-border/40" />
            </div>

            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-input/50 border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input/50 border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-input/50 border-border/40"
                />
              </div>

              <div className="space-y-2">
                <Label>Academic level</Label>
                <Select
                  value={academicLevel}
                  onValueChange={(value) => setAcademicLevel(value)}
                >
                  <SelectTrigger className="bg-input/50 border-border/40">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High school">High school</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="Masters">Masters</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field">Intended field of study</Label>
                <Input
                  id="field"
                  placeholder="e.g. Astrophysics, AI, Economics"
                  value={intendedFieldOfStudy}
                  onChange={(e) => setIntendedFieldOfStudy(e.target.value)}
                  className="bg-input/50 border-border/40"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="interests">Research interests</Label>
                <Input
                  id="interests"
                  placeholder="Comma-separated, e.g. exoplanets, signal processing"
                  value={researchInterests}
                  onChange={(e) => setResearchInterests(e.target.value)}
                  className="bg-input/50 border-border/40"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="skills">Skills / tags</Label>
                <Input
                  id="skills"
                  placeholder="Comma-separated, e.g. Python, data analysis, LaTeX"
                  value={skillTags}
                  onChange={(e) => setSkillTags(e.target.value)}
                  className="bg-input/50 border-border/40"
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={register.isPending}
                >
                  {register.isPending ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default AuthRegister;
