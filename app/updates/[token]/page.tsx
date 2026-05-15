import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PublicUpdatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: update } = await supabase
    .from("care_updates")
    .select("title, content, created_at, profiles(name)")
    .eq("share_token", token)
    .eq("is_public", true)
    .single();

  if (!update) {
    notFound();
  }

  // Increment view count (fire-and-forget)
  supabase
    .from("care_updates")
    .select("id, view_count")
    .eq("share_token", token)
    .single()
    .then(({ data }) => {
      if (data) {
        supabase
          .from("care_updates")
          .update({ view_count: (data.view_count ?? 0) + 1 })
          .eq("id", data.id)
          .then(() => {});
      }
    });


  const profiles = update.profiles as unknown as { name: string | null } | { name: string | null }[] | null;
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  const authorName = profile?.name?.split(" ")[0] ?? "Someone";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="Anchor" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-semibold text-lg">Anchor</span>
          </div>
          <p className="text-sm text-gray-500">Care update from {authorName}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-2">{update.title}</h1>
          <p className="text-sm text-gray-400 mb-6">
            {new Date(update.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {update.content}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Shared via Anchor — a cancer patient admin hub
        </p>
      </div>
    </div>
  );
}
