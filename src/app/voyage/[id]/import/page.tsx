import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getVoyageById } from "@/lib/data/voyages";
import { GpxImporter } from "@/components/gpx/GpxImporter";
import { messages } from "./messages";

export const metadata: Metadata = {
  title: messages.meta.title,
};

export default async function ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/auth");
  }

  const { id } = await params;
  const { data: voyage, error } = await getVoyageById(id);

  if (error || !voyage) {
    notFound();
  }

  if (voyage.user_id !== user.id) {
    notFound(); // Don't reveal existence
  }

  return (
    <div className="h-screen">
      <GpxImporter voyageId={id} voyageName={voyage.name} />
    </div>
  );
}
