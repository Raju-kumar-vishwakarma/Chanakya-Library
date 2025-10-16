import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, TrendingUp, Shield } from "lucide-react";
import libraryHero from "@/assets/library-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={libraryHero}
            alt="Library"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Chanakya Library
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Smart Attendance System for Modern Learning
          </p>
          <p className="text-lg mb-12 max-w-xl mx-auto opacity-80 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Track your library visits, manage attendance, and access comprehensive reports - all in one place
          </p>
          <div className="flex gap-4 justify-center flex-wrap animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-white text-primary hover:bg-white/90 shadow-strong text-lg px-8 py-6 h-auto"
            >
              Student Login
            </Button>
          
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why Choose Our System?
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Everything you need to manage library attendance efficiently
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Easy Check-In</h3>
              <p className="text-muted-foreground">
                Quick and simple attendance marking with QR codes
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary to-secondary flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Student Management</h3>
              <p className="text-muted-foreground">
                Comprehensive student database and profile management
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent to-accent flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Real-Time Tracking</h3>
              <p className="text-muted-foreground">
                Monitor attendance and duration in real-time
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-medium hover:shadow-strong transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Detailed Reports</h3>
              <p className="text-muted-foreground">
                Export and analyze attendance data with ease
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-secondary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Contact your administrator to get access to Chanakya Library
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-white text-primary hover:bg-white/90 shadow-strong text-lg px-8 py-6 h-auto"
          >
            Login to Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Chanakya Library. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
