import { Header } from "@/components/layout/Header";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Header
          title="Amenity Survey"
          subtitle="Please open the unique survey link shared with you to continue"
        />
      </div>
      <div className="card mx-auto w-full max-w-md p-6 text-center sm:p-8">
        <p className="text-sm leading-relaxed text-charcoal-600">
          This survey is available only through your personal secure link. Check
          your SMS or email for the invitation and open that link to begin.
        </p>
      </div>
    </div>
  );
}
