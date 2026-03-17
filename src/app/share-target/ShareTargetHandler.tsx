"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createVoyage } from "@/app/dashboard/actions";
import { messages } from "./messages";

const SHARE_CACHE = "bosco-share-target";
const SHARE_KEY = "shared-gpx";
const SHARE_PENDING_KEY = "bosco-share-pending";

async function hasSharedFile(): Promise<boolean> {
  if (!("caches" in window)) return false;
  try {
    const cache = await caches.open(SHARE_CACHE);
    const response = await cache.match(SHARE_KEY);
    return response !== undefined;
  } catch {
    return false;
  }
}

interface ShareTargetHandlerProps {
  isAuthenticated: boolean;
  voyages: { id: string; name: string }[];
}

export function ShareTargetHandler({
  isAuthenticated,
  voyages,
}: ShareTargetHandlerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "no-file" | "not-auth" | "create-voyage" | "routing"
  >("loading");
  const [name, setName] = useState(() => {
    const now = new Date();
    return `Voyage ${now.getDate()} ${now.toLocaleString("en", { month: "short" })}`;
  });
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolve() {
      const fileExists = await hasSharedFile();

      if (!fileExists) {
        setStatus("no-file");
        return;
      }

      if (!isAuthenticated) {
        localStorage.setItem(SHARE_PENDING_KEY, "true");
        setStatus("not-auth");
        return;
      }

      if (voyages.length > 0) {
        // Route to most recent voyage's import page
        setStatus("routing");
        router.replace(`/voyage/${voyages[0].id}/import?shared=1`);
        return;
      }

      // Authenticated but no voyages — show inline creation
      setStatus("create-voyage");
    }

    resolve();
  }, [isAuthenticated, voyages, router]);

  async function handleCreateVoyage(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);

    const result = await createVoyage(formData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      toast.error(messages.error.createFailed);
      return;
    }

    setStatus("routing");
    router.replace(`/voyage/${result.data.id}/import?shared=1`);
  }

  if (status === "loading" || status === "routing") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-body text-mist">
          {status === "loading" ? messages.loading : messages.routing}
        </p>
      </div>
    );
  }

  if (status === "no-file") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-heading text-h1 text-navy">
            {messages.noFile.title}
          </h1>
          <p className="mt-2 text-body text-mist">
            {messages.noFile.description}
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-6 min-h-[44px] bg-coral text-white hover:bg-coral/90"
          >
            {messages.noFile.cta}
          </Button>
        </div>
      </div>
    );
  }

  if (status === "not-auth") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <h1 className="font-heading text-h1 text-navy">
            {messages.notAuthenticated.title}
          </h1>
          <p className="mt-2 text-body text-mist">
            {messages.notAuthenticated.description}
          </p>
          <Button
            onClick={() => router.push("/auth")}
            className="mt-6 min-h-[44px] bg-coral text-white hover:bg-coral/90"
          >
            {messages.notAuthenticated.cta}
          </Button>
        </div>
      </div>
    );
  }

  // create-voyage
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-h1 text-navy">
          {messages.createVoyage.title}
        </h1>
        <p className="mt-2 text-body text-mist">
          {messages.createVoyage.description}
        </p>

        <form onSubmit={handleCreateVoyage} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voyage-name" className="text-small font-semibold text-slate">
              {messages.createVoyage.nameLabel}
              <span className="ml-1 text-coral">*</span>
            </Label>
            <Input
              id="voyage-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={messages.createVoyage.namePlaceholder}
              required
              maxLength={100}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voyage-description" className="text-small font-semibold text-slate">
              {messages.createVoyage.descriptionLabel}
            </Label>
            <Textarea
              id="voyage-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={messages.createVoyage.descriptionPlaceholder}
              maxLength={500}
              rows={3}
            />
          </div>

          {error ? (
            <p className="text-small text-error">{error}</p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="min-h-[44px] w-full bg-coral text-white hover:bg-coral/90"
          >
            {isSubmitting
              ? messages.createVoyage.creating
              : messages.createVoyage.submit}
          </Button>
        </form>
      </div>
    </div>
  );
}
