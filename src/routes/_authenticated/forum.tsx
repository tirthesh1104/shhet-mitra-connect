import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, MessageSquare, Send, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModulePage, Card } from "@/components/module-page";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/forum")({ component: Page });

type Post = { id: string; title: string; body: string; author_name: string; village: string | null; upvotes: number; created_at: string };

function Page() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [sort, setSort] = useState<"latest" | "top">("latest");

  useEffect(() => {
    const ch = supabase.channel("forum-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => qc.invalidateQueries({ queryKey: ["forum-posts"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const q = useQuery({
    queryKey: ["forum-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("community_posts").select("*");
      return (data ?? []) as Post[];
    },
    staleTime: 30_000,
  });
  const posts = [...(q.data ?? [])].sort((a, b) =>
    sort === "latest" ? b.created_at.localeCompare(a.created_at) : b.upvotes - a.upvotes
  );

  return (
    <ModulePage title={t("modForum")} subtitle={lang === "mr" ? "शेतकऱ्यांचे प्रश्न व उत्तरे" : "Farmer questions & answers"}>
      <NewPost />
      <div className="my-3 flex gap-2 text-sm">
        <button onClick={() => setSort("latest")} className={`chip ${sort === "latest" ? "bg-primary text-primary-foreground" : ""}`}>{lang === "mr" ? "नवीनतम" : "Latest"}</button>
        <button onClick={() => setSort("top")} className={`chip ${sort === "top" ? "bg-primary text-primary-foreground" : ""}`}>{lang === "mr" ? "जास्त लाइक" : "Most upvoted"}</button>
      </div>
      <div className="space-y-3">
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
        {posts.length === 0 && <Card><div className="text-center text-sm text-muted-foreground">{lang === "mr" ? "अद्याप प्रश्न नाही — पहिला विचारा!" : "No questions yet — be the first!"}</div></Card>}
      </div>
    </ModulePage>
  );
}

function NewPost() {
  const { user } = useAuth(); const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(""); const [body, setBody] = useState("");
  if (!open) return <button onClick={() => setOpen(true)} className="chip"><MessageSquare className="h-4 w-4" /> {lang === "mr" ? "प्रश्न विचारा" : "Ask a question"}</button>;
  return (
    <Card>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={lang === "mr" ? "प्रश्नाचा शीर्षक" : "Question title"} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      <textarea value={body} maxLength={500} onChange={(e) => setBody(e.target.value)} placeholder={lang === "mr" ? "तपशील (५०० अक्षरे)" : "Details (500 chars)"} rows={3} className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      <div className="mt-2 flex justify-end gap-2 text-sm">
        <button onClick={() => setOpen(false)} className="chip">रद्द</button>
        <button
          onClick={async () => {
            if (!title.trim() || !body.trim()) return;
            const author = (user?.user_metadata?.full_name as string) ?? "Farmer";
            const { error } = await supabase.from("community_posts").insert({ user_id: user!.id, title: title.trim(), body: body.trim(), author_name: author });
            if (error) return toast.error(error.message);
            setTitle(""); setBody(""); setOpen(false); toast.success(lang === "mr" ? "पोस्ट झाले" : "Posted");
          }}
          className="chip bg-primary text-primary-foreground"><Send className="h-3.5 w-3.5" /> {lang === "mr" ? "पाठवा" : "Post"}</button>
      </div>
    </Card>
  );
}

type Reply = { id: string; body: string; author_name: string; created_at: string };
function PostCard({ post }: { post: Post }) {
  const { user } = useAuth(); const { lang } = useI18n();
  const qc = useQueryClient();
  const [showReplies, setShowReplies] = useState(false);
  const [reply, setReply] = useState("");
  const replyQ = useQuery({
    queryKey: ["replies", post.id], enabled: showReplies,
    queryFn: async () => ((await supabase.from("community_replies").select("*").eq("post_id", post.id).order("created_at")).data ?? []) as Reply[],
  });
  async function upvote() {
    await supabase.from("community_posts").update({ upvotes: post.upvotes + 1 }).eq("id", post.id);
    qc.invalidateQueries({ queryKey: ["forum-posts"] });
  }
  async function submitReply() {
    if (!reply.trim()) return;
    const author = (user?.user_metadata?.full_name as string) ?? "Farmer";
    await supabase.from("community_replies").insert({ post_id: post.id, user_id: user!.id, body: reply.trim(), author_name: author });
    setReply(""); qc.invalidateQueries({ queryKey: ["replies", post.id] });
  }
  return (
    <Card>
      <div className="flex items-start gap-3">
        <button onClick={upvote} className="flex flex-col items-center rounded-xl border border-border px-2 py-1.5 text-xs hover:bg-secondary">
          <ArrowUp className="h-4 w-4" /><span className="font-semibold">{post.upvotes}</span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="font-medium">{post.title}</div>
          <p className="mt-1 text-sm">{post.body}</p>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{post.author_name}</span>
            {post.village && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{post.village}</span>}
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <button onClick={() => setShowReplies(!showReplies)} className="mt-2 text-xs font-medium text-primary">{showReplies ? (lang === "mr" ? "लपवा" : "Hide replies") : (lang === "mr" ? "उत्तरे पहा" : "View replies")}</button>
          {showReplies && (
            <div className="mt-2 space-y-2">
              {(replyQ.data ?? []).map((r) => (
                <div key={r.id} className="rounded-xl bg-secondary/60 p-2 text-sm"><b className="text-xs">{r.author_name}: </b>{r.body}</div>
              ))}
              <div className="flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={lang === "mr" ? "तुमचे उत्तर" : "Your reply"} className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm" />
                <button onClick={submitReply} className="chip bg-primary text-primary-foreground"><Send className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
