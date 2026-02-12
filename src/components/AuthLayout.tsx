import { memo } from 'react';
import { StarField } from '@/components/StarField';

interface AuthLayoutProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
}

const AuthLayoutComponent = ({ children, leftPanel }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen flex bg-background overflow-hidden">
      {/* Star-field across entire page */}
      <StarField />

      {/* Left panel — branding + characters */}
      <div className="hidden lg:flex relative z-10 w-1/2 flex-col items-center justify-center p-12">
        {leftPanel}
      </div>

      {/* Right panel — form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export const AuthLayout = memo(AuthLayoutComponent);
