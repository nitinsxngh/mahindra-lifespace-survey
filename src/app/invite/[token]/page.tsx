import { InviteLogin } from "@/components/auth/InviteLogin";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-10 sm:px-6">
      <InviteLogin token={token} />
    </div>
  );
}
