"use client";

import { FormEvent, useEffect, useState } from "react";

type CommentItem = {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
};

type ResponseShape = {
  data: {
    items: CommentItem[];
  };
  message?: string;
};

export default function AdminCommentsPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CommentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load(q?: string) {
    const params = new URLSearchParams({ page: "1", limit: "30" });
    if (q?.trim()) {
      params.set("search", q.trim());
    }

    const res = await fetch(`/api/comments/moderation?${params.toString()}`);
    const json = (await res.json()) as ResponseShape;

    if (!res.ok) {
      setError(json.message ?? "Unauthorized.");
      return;
    }

    setError(null);
    setItems(json.data.items);
  }

  useEffect(() => {
    let active = true;

    fetch("/api/comments/moderation?page=1&limit=30")
      .then(async (res) => {
        const json = (await res.json()) as ResponseShape;
        if (!active) {
          return;
        }
        if (!res.ok) {
          setError(json.message ?? "Unauthorized.");
          return;
        }
        setError(null);
        setItems(json.data.items);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load comments.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    load(search).catch(() => setError("Search failed."));
  }

  return (
    <section className="shell section-space">
      <div className="panel stack">
        <h1 className="heading-h2">Admin Comment Monitoring</h1>
        <form className="stack" onSubmit={onSubmit}>
          <input
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search comment text"
          />
          <button className="btn-secondary" type="submit">
            Search
          </button>
        </form>

        {error ? <p style={{ color: "#dc2626" }}>{error}</p> : null}

        {items.map((comment) => (
          <div key={comment.id} className="card">
            <p className="body-compact">{comment.comment_text}</p>
            <p className="small">Post: {comment.post_id}</p>
            <p className="small">User: {comment.user_id}</p>
            <p className="small">
              {new Date(comment.created_at).toLocaleDateString("en-IN")}
            </p>
          </div>
        ))}

        {!error && items.length === 0 ? (
          <div className="card">
            <p className="body-compact" style={{ margin: 0 }}>
              No comments found for this filter.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
