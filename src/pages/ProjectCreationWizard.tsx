import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Rocket, BookOpen, Target, FileUp, Sparkles, Zap, Telescope, Brain } from "lucide-react";

const STEPS = [
  { id: "title", title: "Name Your Mission", description: "Every great discovery starts with a name", icon: Rocket },
  { id: "field", title: "Choose Your Domain", description: "Which frontier will you explore?", icon: Telescope },
  { id: "objective", title: "Define Your Quest", description: "What truth do you seek to uncover?", icon: Target },
  { id: "proposal", title: "Upload Blueprint", description: "Attach your research proposal (optional)", icon: FileUp },
  { id: "review", title: "Launch Sequence", description: "Review and initiate your research journey", icon: Zap },
];

const RESEARCH_FIELDS = [
  { id: "stem", label: "STEM & Engineering", color: "from-cyan-500 to-blue-500" },
  { id: "medical", label: "Medical & Life Sciences", color: "from-green-500 to-emerald-500" },
  { id: "social", label: "Social Sciences", color: "from-purple-500 to-violet-500" },
  { id: "humanities", label: "Humanities & Arts", color: "from-orange-500 to-amber-500" },
  { id: "business", label: "Business & Economics", color: "from-pink-500 to-rose-500" },
  { id: "interdisciplinary", label: "Interdisciplinary", color: "from-indigo-500 to-purple-500" },
];

interface AIAnalysis {
  vision: string;
  stages: Array<{ name: string; description: string; order_index: number }>;
  tags: string[];
}

const ProjectCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    field: "",
    objective: "",
    proposalUrl: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // When moving to review step, trigger AI analysis
      if (currentStep === 3) {
        await analyzeProject();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const analyzeProject = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-project', {
        body: {
          title: formData.title,
          field: formData.field,
          objective: formData.objective,
        },
      });

      if (error) throw error;
      setAiAnalysis(data);
      toast({ title: "AI Vision Generated", description: "Your research pipeline has been analyzed" });
    } catch (error) {
      console.error('Analysis error:', error);
      // Set fallback analysis
      setAiAnalysis({
        vision: `This ${formData.field} research project will explore: ${formData.objective.substring(0, 150)}...`,
        stages: [
          { name: "Exploration", description: "Initial research landscape mapping", order_index: 0 },
          { name: "Topic Discovery", description: "Refine research questions", order_index: 1 },
          { name: "Literature Review", description: "Review existing work", order_index: 2 },
          { name: "Methodology", description: "Design research approach", order_index: 3 },
          { name: "Data Collection", description: "Gather research data", order_index: 4 },
          { name: "Analysis", description: "Analyze findings", order_index: 5 },
          { name: "Publication", description: "Document results", order_index: 6 },
        ],
        tags: [formData.field.toLowerCase().split(' ')[0], "research"],
      });
      toast({ 
        title: "Using default pipeline", 
        description: "AI analysis unavailable, using standard research stages",
        variant: "default"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project_documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('project_documents')
        .getPublicUrl(fileName);

      setFormData({ ...formData, proposalUrl: publicUrlData.publicUrl });
      toast({ title: "Proposal uploaded successfully" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a project",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Create project in Supabase
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          title: formData.title,
          description: formData.objective,
          field: formData.field,
          objective: formData.objective,
          status: 'active',
          current_stage: 'EXPLORATION',
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create pipeline stages
      if (aiAnalysis?.stages && project) {
        const stageInserts = aiAnalysis.stages.map((stage) => ({
          project_id: project.id,
          stage: stage.name.toUpperCase().replace(/ /g, '_'),
          completion: stage.order_index === 0 ? 10 : 0,
          milestone_title: stage.description,
        }));

        const { error: stagesError } = await supabase
          .from('research_stage_progress')
          .insert(stageInserts);

        if (stagesError) {
          console.error('Stages error:', stagesError);
        }
      }

      toast({
        title: "Mission Launched! 🚀",
        description: "Your research pipeline has been automatically generated.",
      });
      navigate("/projects");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Launch sequence failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  const canProceed = () => {
    if (currentStep === 0) return formData.title.length >= 3;
    if (currentStep === 1) return formData.field.length > 0;
    if (currentStep === 2) return formData.objective.length >= 10;
    if (currentStep === 3) return true; // Optional step
    return true;
  };

  return (
    <DashboardShell>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-3xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      idx < currentStep
                        ? "bg-primary text-primary-foreground"
                        : idx === currentStep
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                    animate={{ scale: idx === currentStep ? 1.1 : 1 }}
                  >
                    {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                  </motion.div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${
                        idx < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold gradient-text-animated mb-2">Project Launch Wizard</h1>
              <p className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card className="glass-strong overflow-hidden border-primary/20">
                {/* Decorative gradient header */}
                <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
                
                <CardHeader className="text-center pt-8 pb-4">
                  <motion.div
                    className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 relative"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon className="w-10 h-10 text-primary" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-secondary animate-pulse" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold">{step.title}</CardTitle>
                  <CardDescription className="text-lg">{step.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-4 pb-8 min-h-[280px] flex items-center justify-center px-8">
                  {/* Step 1: Title */}
                  {currentStep === 0 && (
                    <div className="w-full space-y-4">
                      <Input
                        placeholder="e.g., Quantum Computing in Drug Discovery"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="text-xl h-16 text-center bg-muted/50 border-primary/30 focus:border-primary"
                        autoFocus
                      />
                      <p className="text-center text-sm text-muted-foreground">
                        Choose a compelling name that captures your research vision
                      </p>
                    </div>
                  )}

                  {/* Step 2: Research Field */}
                  {currentStep === 1 && (
                    <div className="w-full grid grid-cols-2 gap-3">
                      {RESEARCH_FIELDS.map((field) => (
                        <motion.button
                          key={field.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, field: field.label })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            formData.field === field.label
                              ? "border-primary bg-primary/10"
                              : "border-border/50 hover:border-primary/50 bg-muted/30"
                          }`}
                        >
                          <div className={`w-full h-1 rounded-full bg-gradient-to-r ${field.color} mb-3`} />
                          <span className="font-medium">{field.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Step 3: Objective */}
                  {currentStep === 2 && (
                    <div className="w-full space-y-4">
                      <Textarea
                        placeholder="Describe your research objective in detail. What question are you trying to answer? What impact do you hope to achieve?"
                        value={formData.objective}
                        onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                        className="text-base min-h-[180px] bg-muted/50 border-primary/30 focus:border-primary resize-none"
                        autoFocus
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Be specific and measurable</span>
                        <span>{formData.objective.length} characters</span>
                      </div>
                    </div>
                  )}

                  {/* Step 4: File Upload */}
                  {currentStep === 3 && (
                    <div className="w-full space-y-4">
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all relative overflow-hidden group"
                      >
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-primary font-medium">Uploading...</p>
                          </div>
                        ) : formData.proposalUrl ? (
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                              <Check className="w-8 h-8 text-primary" />
                            </div>
                            <p className="font-medium text-primary">Proposal Uploaded</p>
                            <p className="text-sm text-muted-foreground mt-1">{selectedFile?.name}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <FileUp className="w-12 h-12 text-muted-foreground mb-4 group-hover:text-primary transition-colors" />
                            <p className="font-medium text-foreground">Drop your proposal here</p>
                            <p className="text-sm text-muted-foreground mt-1">PDF, DOC up to 20MB</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.label>
                      <p className="text-center text-sm text-muted-foreground">
                        This step is optional — you can add documents later
                      </p>
                    </div>
                  )}

                  {/* Step 5: Review with AI Vision */}
                  {currentStep === 4 && (
                    <div className="w-full space-y-6">
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-4"
                          >
                            <Brain className="w-8 h-8 text-primary-foreground" />
                          </motion.div>
                          <p className="text-lg font-medium">AI is analyzing your project...</p>
                          <p className="text-sm text-muted-foreground">Generating customized research pipeline</p>
                        </div>
                      ) : (
                        <>
                          {/* AI Vision Card */}
                          {aiAnalysis?.vision && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <Brain className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-primary">AI Vision</span>
                              </div>
                              <p className="text-sm leading-relaxed">{aiAnalysis.vision}</p>
                            </motion.div>
                          )}

                          <div className="grid gap-4">
                            <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Rocket className="w-4 h-4 text-primary" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mission Name</span>
                              </div>
                              <p className="text-xl font-bold">{formData.title}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="w-4 h-4 text-secondary" />
                                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Domain</span>
                                </div>
                                <p className="font-semibold">{formData.field}</p>
                              </div>
                              <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileUp className="w-4 h-4 text-accent" />
                                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposal</span>
                                </div>
                                <p className="font-semibold">{formData.proposalUrl ? "Attached ✓" : "Not attached"}</p>
                              </div>
                            </div>
                            
                            <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Research Objective</span>
                              </div>
                              <p className="text-sm leading-relaxed">{formData.objective}</p>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
                            <p className="text-sm text-primary font-medium">
                              🚀 {aiAnalysis?.stages?.length || 7} customized pipeline stages ready to deploy
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between border-t border-border/40 pt-6 pb-6 px-8">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 0 || isAnalyzing}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  
                  {currentStep === STEPS.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isAnalyzing}
                      className="gap-2 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          Launch Mission
                          <Rocket className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed() || isUploading || isAnalyzing}
                      className="gap-2 px-8"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Analyzing...
                        </>
                      ) : currentStep === 3 ? (
                        formData.proposalUrl ? "Continue" : "Skip"
                      ) : (
                        "Continue"
                      )}
                      {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ProjectCreationWizard;
