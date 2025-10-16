import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (!error && data && data.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/student");
            }
          });
      }
    });
  }, [navigate]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your library account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;