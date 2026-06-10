import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { SurveyForm } from "@/components/survey/SurveyForm";

export default async function SurveyPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Header
          title="Amenity Preference Survey"
          subtitle={`Logged in as +91 ${session.phone} — rank all 4 amenities by priority`}
        />
      </div>
      <SurveyForm />
    </div>
  );
}
