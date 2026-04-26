"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PostData = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
};

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [post, setPost] = useState<PostData | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    async function load() {
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) {
        setMessage("Unable to load post.");
        return;
      }

      const json = (await res.json()) as { data: { post: PostData } };
      setPost(json.data.post);
    }

    load().catch(() => setMessage("Unable to load post."));
  }, [id]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!post) {
      return;
    }

    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    if (!res.ok) {
      const json = (await res.json()) as { message?: string };
      setMessage(json.message ?? "Update failed.");
      return;
    }

    setMessage("Post updated successfully.");
  }

  async function handleSummaryRegenerate() {
    const res = await fetch(`/api/posts/${id}/regenerate-summary`, { method: "POST" });
    if (!res.ok) {
      setMessage("Summary regeneration failed.");
      return;
    }
    setMessage("Summary regenerated successfully.");
  }

  return (
    <section className="shell section-space" style={{ maxWidth: "820px" }}>
      <form className="panel stack" onSubmit={handleSave}>
        <h1 className="heading-h2">Edit Post</h1>

        <label className="label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="input"
          value={post?.title ?? ""}
          onChange={(event) =>
            setPost((current) =>
              current ? { ...current, title: event.target.value } : current,
            )
          }
          required
          minLength={3}
        />

        <label className="label" htmlFor="image-url">
          Featured Image URL
        </label>
        <input
          id="image-url"
          className="input"
          value={post?.image_url ?? ""}
          onChange={(event) =>
            setPost((current) =>
              current ? { ...current, image_url: event.target.value } : current,
            )
          }
        />

        <label className="label" htmlFor="body">
          Body Content
        </label>
        <textarea
          id="body"
          value={post?.body ?? ""}
          onChange={(event) =>
            setPost((current) =>
              current ? { ...current, body: event.target.value } : current,
            )
          }
          required
          minLength={20}
        />

        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <button className="btn-primary" type="submit">
            Save Changes
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={handleSummaryRegenerate}
          >
            Regenerate Summary
          </button>
        </div>

        {message ? <p className="muted">{message}</p> : null}
      </form>
    </section>
  );
}
