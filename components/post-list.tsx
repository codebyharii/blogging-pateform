"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type ListItem = {
  id: string;
  title: string;
  image_url: string | null;
  summary: string;
  created_at: string;
};

type ApiResponse = {
  success: boolean;
  data: {
    items: ListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export function PostList() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: "6",
      });
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await fetch(`/api/posts?${params.toString()}`, {
        signal: controller.signal,
      });

      if (res.ok) {
        const json = (await res.json()) as ApiResponse;
        setItems(json.data.items);
        setTotalPages(json.data.pagination.totalPages);
      } else {
        setItems([]);
        setTotalPages(1);
        setError("Unable to load posts right now. Please try again.");
      }
      setLoading(false);
    }

    loadPosts().catch(() => {
      setLoading(false);
      setItems([]);
      setTotalPages(1);
      setError("Unable to load posts right now. Please try again.");
    });

    return () => controller.abort();
  }, [page, search]);

  return (
    <section className="shell section-space">
      <div className="search-row">
        <input
          className="input"
          placeholder="Search posts by title or content"
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
        />
      </div>

      {loading && <p className="muted">Loading posts...</p>}

      {error ? <p style={{ color: "#dc2626" }}>{error}</p> : null}

      <div className="post-grid">
        {items.map((item) => (
          <article key={item.id} className="card">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                className="card-image"
                width={1200}
                height={675}
              />
            ) : (
              <div className="card-image card-image-placeholder">Aetherfield</div>
            )}
            <h3 className="heading-h3">{item.title}</h3>
            <p className="body-compact clamp-6">{item.summary}</p>
            <p className="small">
              {new Date(item.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <Link href={`/posts/${item.id}`} className="btn-link">
              Read post
            </Link>
          </article>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="panel" style={{ marginTop: "1rem" }}>
          <p className="body-compact" style={{ margin: 0 }}>
            {search.trim()
              ? `No posts found for "${search.trim()}". Try another keyword.`
              : "No posts available yet. Create your first post from New Post."}
          </p>
        </div>
      )}

      <div className="pagination-row">
        <button
          className="btn-secondary"
          disabled={page <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          type="button"
        >
          Previous
        </button>
        <p className="label">
          Page {page} of {totalPages}
        </p>
        <button
          className="btn-secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          type="button"
        >
          Next
        </button>
      </div>
    </section>
  );
}
