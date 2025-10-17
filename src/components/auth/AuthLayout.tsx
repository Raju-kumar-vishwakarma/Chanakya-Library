import { ReactNode } from "react";
import libraryHero from "@/assets/library-hero.jpg";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 ">
              Chanakya Library
            </h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10" />
        <img
          src={libraryHero}
          alt="Library interior"
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-8 left-8 right-8 text-white z-20">
          <h3 className="text-3xl font-bold mb-2">Welcome to Chanakya Library</h3>
          <p className="text-lg opacity-90">Your gateway to knowledge and learning</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;