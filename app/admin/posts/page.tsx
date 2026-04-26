"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PostItem = {
  id: string;
  title: string;
  author_id: string;
  created_at: string;
};

export default function AdminPostsPage() {
  const [items, setItems] = useState<PostItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/posts");
      if (!res.ok) {
        const json = (await res.json()) as { message?: string };
        setError(json.message ?? "Unauthorized.");
        return;
      }

      const json = (await res.json()) as { data: PostItem[] };
      setItems(json.data);
    }

    load().catch(() => setError("Unable to fetch posts."));
  }, []);

  return (
    <section className="shell section-space">
      <div className="panel stack">
        <h1 className="heading-h2">Admin Post Monitoring</h1>
        {error ? <p style={{ color: "#dc2626" }}>{error}</p> : null}
        {items.map((item) => (
          <div className="card" key={item.id}>
            <h2 className="heading-h3">{item.title}</h2>
            <p className="small">Author: {item.author_id}</p>
            <p className="small">
              {new Date(item.created_at).toLocaleDateString("en-IN")}
            </p>
            <Link href={`/posts/${item.id}/edit`} className="btn-link">
              Edit Post
            </Link>
          </div>
        ))}
        {!error && items.length === 0 ? (
          <div className="card">
            <p className="body-compact" style={{ margin: 0 }}>
              No posts found yet.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
