import type { Metadata } from "next";
import { messages } from "./messages";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = {
  title: messages.meta.title,
  description: messages.meta.description,
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-[400px] rounded-[var(--radius-card)] bg-sand p-8 shadow-card">
        <AuthForm initialError={error} />
      </div>
    </main>
  );
}
