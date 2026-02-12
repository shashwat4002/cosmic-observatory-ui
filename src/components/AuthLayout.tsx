import { memo } from 'react';
import { StarField } from '@/components/StarField';
import { ResearchCharacters } from '@/components/ResearchCharacters';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayoutComponent = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Animated star-field background */}
      <StarField />

      {/* Research characters */}
      <ResearchCharacters />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
};

export const AuthLayout = memo(AuthLayoutComponent);
