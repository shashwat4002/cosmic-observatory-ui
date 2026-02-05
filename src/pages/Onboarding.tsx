import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StarField } from "@/components/StarField";
import { useCurrentUser } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Microscope, 
  Target, 
  Users, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2,
  BookOpen,
  Beaker,
  Brain,
  Stethoscope,
  Globe,
  Calculator,
  Palette,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

type OnboardingData = {
  researchInterests: string[];
  currentStage: string;
  goals: string[];
  collaborationPreference: string;
};

const researchFields = [
  { id: "stem", label: "STEM", icon: Beaker, subfields: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Engineering"] },
  { id: "medical", label: "Medical Sciences", icon: Stethoscope, subfields: ["Medicine", "Pharmacy", "Public Health", "Neuroscience", "Genetics"] },
  { id: "social", label: "Social Sciences", icon: Globe, subfields: ["Psychology", "Sociology", "Economics", "Political Science", "Anthropology"] },
  { id: "humanities", label: "Humanities", icon: BookOpen, subfields: ["History", "Philosophy", "Literature", "Linguistics", "Religious Studies"] },
  { id: "arts", label: "Arts & Design", icon: Palette, subfields: ["Fine Arts", "Music", "Architecture", "Film Studies", "Digital Media"] },
  { id: "business", label: "Business & Law", icon: Scale, subfields: ["Business Administration", "Finance", "Marketing", "Law", "International Relations"] },
];

const experienceStages = [
  { id: "EXPLORATION", label: "Exploring Research", description: "Just starting to explore what research means" },
  { id: "TOPIC_DISCOVERY", label: "Finding a Topic", description: "Looking for the right research topic" },
  { id: "LITERATURE_REVIEW", label: "Literature Review", description: "Reading and reviewing existing work" },
  { id: "METHODOLOGY", label: "Designing Methods", description: "Planning how to conduct research" },
  { id: "EXECUTION", label: "Conducting Research", description: "Actively collecting data or experimenting" },
  { id: "DOCUMENTATION", label: "Writing Up", description: "Documenting findings and writing papers" },
  { id: "PUBLICATION", label: "Publishing", description: "Submitting work for publication" },
];

const researchGoals = [
  { id: "publication", label: "Publish Research", description: "Get published in academic journals", icon: BookOpen },
  { id: "competition", label: "Win Competitions", description: "Participate in research competitions", icon: Target },
  { id: "exploration", label: "Learn & Explore", description: "Deepen understanding of a field", icon: Brain },
  { id: "career", label: "Career Preparation", description: "Build skills for future career", icon: Sparkles },
];

const collaborationPrefs = [
  { id: "independent", label: "Independent", description: "I prefer to work alone with occasional guidance" },
  { id: "mentor", label: "Mentor Guidance", description: "I want structured mentorship throughout" },
  { id: "peer", label: "Peer Collaboration", description: "I want to work with other student researchers" },
  { id: "team", label: "Full Team", description: "I want both mentors and peers on my project" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data } = useCurrentUser();
  const user = data?.user;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    researchInterests: [],
    currentStage: "",
    goals: [],
    collaborationPreference: "",
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.includes(interest)
        ? prev.researchInterests.filter(i => i !== interest)
        : [...prev.researchInterests, interest]
    }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.researchInterests.length > 0;
      case 2: return formData.currentStage !== "";
      case 3: return formData.goals.length > 0;
      case 4: return formData.collaborationPreference !== "";
      default: return false;
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          research_interests: formData.researchInterests,
          current_journey_stage: formData.currentStage,
          research_goals: formData.goals,
          collaboration_preference: formData.collaborationPreference,
          onboarding_completed: true,
        }
      });

      if (error) throw error;

      toast({
        title: "Welcome to SochX!",
        description: "Your research journey begins now.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  const [direction, setDirection] = useState(0);

  const nextStep = () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center p-4">
      <StarField />
      
      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-cyan">
              <Microscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to Soch<span className="text-primary">X</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Let's personalize your research journey, {user?.fullName?.split(" ")[0] || "Researcher"}
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="glass-strong border-border/40">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5 text-primary" />
                      Research Interests
                    </CardTitle>
                    <CardDescription>
                      Select the fields and subfields that interest you (choose multiple)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {researchFields.map(field => (
                      <div key={field.id} className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <field.icon className="h-4 w-4 text-primary" />
                          {field.label}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.subfields.map(subfield => (
                            <button
                              key={subfield}
                              onClick={() => toggleInterest(subfield)}
                              className={cn(
                                "px-3 py-1.5 text-sm rounded-full border transition-all duration-200",
                                formData.researchInterests.includes(subfield)
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                              )}
                            >
                              {subfield}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-secondary" />
                      Current Research Stage
                    </CardTitle>
                    <CardDescription>
                      Where are you in your research journey?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {experienceStages.map((stage, index) => (
                        <button
                          key={stage.id}
                          onClick={() => setFormData(prev => ({ ...prev, currentStage: stage.id }))}
                          className={cn(
                            "w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4",
                            formData.currentStage === stage.id
                              ? "bg-secondary/20 border-secondary"
                              : "bg-muted/30 border-border/40 hover:border-secondary/50"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                            formData.currentStage === stage.id
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                          <div>
                            <p className={cn(
                              "font-medium",
                              formData.currentStage === stage.id ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {stage.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{stage.description}</p>
                          </div>
                          {formData.currentStage === stage.id && (
                            <CheckCircle2 className="ml-auto h-5 w-5 text-secondary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      Research Goals
                    </CardTitle>
                    <CardDescription>
                      What do you want to achieve? (select all that apply)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {researchGoals.map(goal => (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all duration-200",
                            formData.goals.includes(goal.id)
                              ? "bg-accent/20 border-accent"
                              : "bg-muted/30 border-border/40 hover:border-accent/50"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              formData.goals.includes(goal.id) ? "bg-accent/30" : "bg-muted/50"
                            )}>
                              <goal.icon className={cn(
                                "h-5 w-5",
                                formData.goals.includes(goal.id) ? "text-accent" : "text-muted-foreground"
                              )} />
                            </div>
                            <div>
                              <p className={cn(
                                "font-medium",
                                formData.goals.includes(goal.id) ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {goal.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {step === 4 && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Collaboration Preference
                    </CardTitle>
                    <CardDescription>
                      How do you prefer to work on research?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {collaborationPrefs.map(pref => (
                        <button
                          key={pref.id}
                          onClick={() => setFormData(prev => ({ ...prev, collaborationPreference: pref.id }))}
                          className={cn(
                            "w-full p-4 rounded-xl border text-left transition-all duration-200",
                            formData.collaborationPreference === pref.id
                              ? "bg-primary/20 border-primary"
                              : "bg-muted/30 border-border/40 hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={cn(
                                "font-medium",
                                formData.collaborationPreference === pref.id ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {pref.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                            </div>
                            {formData.collaborationPreference === pref.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="p-6 border-t border-border/30 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="gap-2 bg-gradient-to-r from-primary to-secondary"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isSubmitting}
                className="gap-2 bg-gradient-to-r from-primary to-secondary glow-cyan"
              >
                {isSubmitting ? "Setting up..." : "Start My Journey"}
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Selected interests preview */}
        {formData.researchInterests.length > 0 && step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/30"
          >
            <p className="text-sm text-muted-foreground mb-2">
              Selected: {formData.researchInterests.length} interest{formData.researchInterests.length !== 1 && "s"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {formData.researchInterests.map(interest => (
                <span
                  key={interest}
                  className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
