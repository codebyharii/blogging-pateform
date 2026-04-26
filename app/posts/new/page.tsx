"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = "viewer" | "author" | "admin";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setRole(null);
        setAuthChecked(true);
        return;
      }
      const json = (await res.json()) as { data?: { role?: Role } };
      setRole(json.data?.role ?? null);
      setAuthChecked(true);
    }

    loadProfile().catch(() => {
      setRole(null);
      setAuthChecked(true);
    });
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        image_url: imageUrl,
      }),
    });

    const json = (await res.json()) as {
      success: boolean;
      data?: { id?: string };
      message?: string;
    };

    if (!res.ok) {
      setMessage(json.message ?? "Unable to create post.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(`/posts/${json.data?.id ?? ""}`);
  }

  if (!authChecked) {
    return (
      <section className="shell section-space">
        <div className="panel">
          <h1 className="heading-h2">Create Post</h1>
          <p className="muted">Checking your access...</p>
        </div>
      </section>
    );
  }

  if (!role) {
    return (
      <section className="shell section-space">
        <div className="panel stack">
          <h1 className="heading-h2">Create Post</h1>
          <p className="muted">Please login to create a post.</p>
          <Link href="/auth/login" className="btn-secondary">
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  if (role === "viewer") {
    return (
      <section className="shell section-space">
        <div className="panel">
          <h1 className="heading-h2">Create Post</h1>
          <p className="muted">Only authors and admins can create posts.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="shell section-space" style={{ maxWidth: "820px" }}>
      <form className="panel stack" onSubmit={onSubmit}>
        <h1 className="heading-h2">Create New Post</h1>
        <p className="muted">
          Summary will be generated automatically once and stored in database.
        </p>

        <label className="label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          minLength={3}
        />

        <label className="label" htmlFor="image-url">
          Featured Image URL
        </label>
        <input
          id="image-url"
          className="input"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://example.com/image.jpg"
        />

        <label className="label" htmlFor="body">
          Body Content
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          minLength={20}
        />

        {message ? <p style={{ color: "#dc2626" }}>{message}</p> : null}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </section>
  );
}
