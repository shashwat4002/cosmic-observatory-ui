import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, GraduationCap, Briefcase, BookOpen, 
  ArrowRight, ArrowLeft, Check, Loader2,
  Building, Globe, Linkedin, Twitter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StarField } from '@/components/StarField';
import { toast } from 'sonner';

const roleOptions = [
  {
    value: 'student',
    label: 'Student',
    description: 'I am a student looking for research guidance and mentorship',
    icon: GraduationCap,
  },
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'I am a professional looking to guide and mentor students',
    icon: Briefcase,
  },
];

const researchInterests = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Computer Science',
  'Biotechnology',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Environmental Science',
  'Social Sciences',
  'Psychology',
  'Economics',
  'Engineering',
  'Medicine',
  'Other',
];

type OnboardingStep = 'role' | 'profile' | 'interests' | 'complete';

export default function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>('role');
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor' | null>(null);
  const [bio, setBio] = useState('');
  const [institution, setInstitution] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    if (!user || !selectedRole) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: selectedRole,
          bio,
          institution,
          website_url: website,
          linkedin_url: linkedin,
          twitter_url: twitter,
          research_interests: selectedInterests,
          is_available_for_mentoring: selectedRole === 'mentor',
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile setup complete!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps: OnboardingStep[] = ['role', 'profile', 'interests', 'complete'];
  const currentIndex = steps.indexOf(step);

  const nextStep = () => {
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden py-12">
      <StarField />

      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= currentIndex ? 'bg-primary w-12' : 'bg-muted w-8'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {step === 'role' && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to SochX</h1>
                  <p className="text-muted-foreground">What best describes your role?</p>
                </div>

                <div className="grid gap-4">
                  {roleOptions.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value as 'student' | 'mentor')}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary/10 glow-border'
                          : 'border-border hover:border-primary/50 bg-muted/30'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedRole === role.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <role.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{role.label}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      {selectedRole === role.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={nextStep}
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary"
                  disabled={!selectedRole}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-2">Tell us about yourself</h1>
                  <p className="text-muted-foreground">Help others get to know you better</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself, your background, and your goals..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-[100px] bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution / Organization</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="institution"
                        placeholder="University or Company name"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="pl-10 h-12 bg-input border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="website"
                          placeholder="yoursite.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="pl-10 h-12 bg-input border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="linkedin"
                          placeholder="linkedin.com/in/..."
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="pl-10 h-12 bg-input border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="twitter"
                          placeholder="@username"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className="pl-10 h-12 bg-input border-border"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 border-border"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'interests' && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground mb-2">Research Interests</h1>
                  <p className="text-muted-foreground">Select topics that interest you (at least 1)</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {researchInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 border-border"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary"
                    disabled={selectedInterests.length === 0}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <BookOpen className="w-10 h-10 text-primary" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">You're all set!</h1>
                  <p className="text-muted-foreground">
                    Your profile is ready. Start exploring SochX and connect with the research community.
                  </p>
                </div>

                <div className="glass rounded-xl p-4 text-left">
                  <h3 className="font-semibold text-foreground mb-2">Your Profile Summary</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Role:</span> <span className="text-foreground capitalize">{selectedRole}</span></p>
                    {institution && <p><span className="text-muted-foreground">Institution:</span> <span className="text-foreground">{institution}</span></p>}
                    <p><span className="text-muted-foreground">Interests:</span> <span className="text-foreground">{selectedInterests.join(', ')}</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 border-border"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
