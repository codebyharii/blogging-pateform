"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PostData = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  summary: string;
  author_id: string;
  created_at: string;
};

type CommentData = {
  id: string;
  comment_text: string;
  created_at: string;
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    async function resolveAndLoad() {
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) {
        setMessage("Post not found.");
        return;
      }

      const json = (await res.json()) as {
        data: { post: PostData; comments: CommentData[] };
      };
      setPost(json.data.post);
      setComments(json.data.comments);
    }

    resolveAndLoad().catch(() => setMessage("Unable to load post."));
  }, [id]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id || !commentText.trim()) {
      return;
    }

    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_text: commentText.trim() }),
    });

    if (!res.ok) {
      setMessage("Login required to comment.");
      return;
    }

    setCommentText("");
    const listRes = await fetch(`/api/posts/${id}/comments`);
    const listJson = (await listRes.json()) as { data: CommentData[] };
    setComments(listJson.data);
  }

  return (
    <section className="shell section-space two-col">
      <article className="panel stack">
        {post ? (
          <>
            <h1 className="heading-h2">{post.title}</h1>
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={post.title}
                className="card-image"
                width={1200}
                height={675}
              />
            ) : null}
            <p className="body-compact">{post.body}</p>
            <p className="small">
              Published on {new Date(post.created_at).toLocaleDateString("en-IN")}
            </p>
            <div className="stack">
              <h2 className="heading-h3">Stored AI Summary</h2>
              <p className="body-compact">{post.summary}</p>
            </div>
            <Link href={`/posts/${post.id}/edit`} className="btn-secondary">
              Edit Post
            </Link>
          </>
        ) : (
          <p className="muted">Loading...</p>
        )}
      </article>

      <aside className="panel stack">
        <h2 className="heading-h3">Comments</h2>
        <form className="stack" onSubmit={submitComment}>
          <textarea
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Write your comment"
            minLength={1}
            maxLength={1000}
          />
          <button className="btn-primary" type="submit">
            Add Comment
          </button>
        </form>

        <div className="stack">
          {comments.map((comment) => (
            <div key={comment.id} className="card">
              <p className="body-compact">{comment.comment_text}</p>
              <p className="small">
                {new Date(comment.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        {message ? <p style={{ color: "#dc2626" }}>{message}</p> : null}
      </aside>
    </section>
  );
}
