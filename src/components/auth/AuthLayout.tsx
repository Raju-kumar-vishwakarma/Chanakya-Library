import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// A basic Button component with standard styling.
const Button = ({ asChild, variant, className, children, ...props }: { asChild?: boolean, variant?: string, className?: string, children: ReactNode, to?: string }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white";
  const finalClassName = `${baseClasses} ${className}`;

  if (asChild) {
    return (
      <div className={finalClassName} {...props}>
        {children}
      </div>
    );
  }

  return (
    <button className={finalClassName} {...props}>
      {children}
    </button>
  );
};


interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white order-2 lg:order-1">
        <div className="w-full max-w-md">
          
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Chanakya Library
            </h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden order-1 lg:order-2" style={{minHeight: '250px'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto-format&fit=crop"
          alt="Library interior"
          className="object-cover w-full h-full"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/1080/1a202c/ffffff?text=Library'; }}
        />
        <div className="absolute bottom-8 left-8 right-8 text-white z-20 p-4 bg-black/40 rounded-lg backdrop-blur-sm">
          <h3 className="text-3xl font-bold mb-2">Welcome to Chanakya Library</h3>
          <p className="text-lg opacity-90">Your gateway to knowledge and learning.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

