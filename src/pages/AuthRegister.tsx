import { useState, FormEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthActions, useCurrentUser } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { ResearchCharacters } from "@/components/ResearchCharacters";
import { lovable } from "@/integrations/lovable/index";
import { ArrowLeft } from "lucide-react";

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
    if (!isLoading && data?.user) navigate("/dashboard");
  }, [data, isLoading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({
        fullName, email, password, academicLevel, intendedFieldOfStudy,
        researchInterests: researchInterests.split(",").map((s) => s.trim()).filter(Boolean),
        skillTags: skillTags.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast({ title: "Account created", description: "Please check your email to verify your account." });
      navigate("/auth/login");
    } catch (error) {
      toast({ title: "Sign up failed", description: error instanceof Error ? error.message : "Unable to register", variant: "destructive" });
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (error) toast({ title: "Google sign-up failed", description: error.message, variant: "destructive" });
    } catch {
      toast({ title: "Google sign-up failed", description: "Unable to connect to Google", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const leftPanel = (
    <div className="flex flex-col items-center justify-center gap-8 max-w-md">
      <ResearchCharacters />
      <div className="text-center space-y-3">
        <p className="text-muted-foreground text-sm italic">
          "a quiet digital observatory for those who explore, discover, and push boundaries."
        </p>
        <p className="text-muted-foreground/60 text-xs">SochX Research Community</p>
      </div>
    </div>
  );

  return (
    <AuthLayout leftPanel={leftPanel}>
      <div className="flex justify-end mb-4">
        <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back to Home
        </button>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Join SochX</h1>
          <p className="text-sm text-muted-foreground">Tell us about your research journey.</p>
        </div>

        <div className="flex rounded-lg border border-border/40 overflow-hidden">
          <Link to="/auth/login" className="flex-1 py-2 text-center text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          <div className="flex-1 py-2 text-center text-sm font-medium bg-primary/10 text-primary border-b-2 border-primary">Create Account</div>
        </div>

        <Button
          type="button" variant="outline"
          className="w-full h-11 gap-2 border-border/40 bg-muted/20 hover:bg-muted/40"
          onClick={handleGoogleSignup} disabled={googleLoading}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {googleLoading ? "Connecting..." : "Sign up with Google"}
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">or</span>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-muted/30 border-border/40 h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-muted/30 border-border/40 h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="bg-muted/30 border-border/40 h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Academic level</Label>
            <Select value={academicLevel} onValueChange={setAcademicLevel}>
              <SelectTrigger className="bg-muted/30 border-border/40 h-10"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="High school">High school</SelectItem>
                <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                <SelectItem value="Masters">Masters</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="field">Field of study</Label>
            <Input id="field" placeholder="e.g. AI, Physics" value={intendedFieldOfStudy} onChange={(e) => setIntendedFieldOfStudy(e.target.value)} className="bg-muted/30 border-border/40 h-10" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="interests">Research interests</Label>
            <Input id="interests" placeholder="Comma-separated" value={researchInterests} onChange={(e) => setResearchInterests(e.target.value)} className="bg-muted/30 border-border/40 h-10" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="skills">Skills</Label>
            <Input id="skills" placeholder="Comma-separated" value={skillTags} onChange={(e) => setSkillTags(e.target.value)} className="bg-muted/30 border-border/40 h-10" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full h-11" disabled={register.isPending}>
              {register.isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>

        <p className="text-[11px] text-center text-muted-foreground/60">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default AuthRegister;
