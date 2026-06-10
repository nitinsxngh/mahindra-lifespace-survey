import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/auth/LoginForm";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Header
          title="Amenity Survey"
          subtitle="Sign in with your mobile number to begin the survey"
        />
      </div>
      <LoginForm />
    </div>
  );
}
