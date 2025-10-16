import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Chanakya Library and start your learning journey"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;