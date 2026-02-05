import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { StarField } from '@/components/StarField';

export default function VerifyEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || 'your email';

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <StarField />

      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-cyan">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            Soch<span className="text-primary">X</span>
          </span>
        </Link>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Mail className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-muted-foreground mb-6">
            We've sent a verification link to{' '}
            <strong className="text-foreground">{email}</strong>
          </p>

          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Click the link in the email to verify your account and complete your registration.</p>
            <p>
              Didn't receive the email? Check your spam folder or contact support if you need
              assistance.
            </p>
          </div>

          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors mt-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
