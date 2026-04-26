"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: "viewer" | "author" | "admin";
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setError("Please login to access dashboard.");
        return;
      }

      const json = (await res.json()) as { data: Profile };
      setProfile(json.data);
    }

    loadProfile().catch(() => setError("Unable to load profile."));
  }, []);

  if (error) {
    return (
      <section className="shell section-space">
        <div className="panel stack">
          <h1 className="heading-h2">Dashboard</h1>
          <p className="muted">{error}</p>
          <Link href="/auth/login" className="btn-secondary">
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="shell section-space">
      <div className="panel stack">
        <h1 className="heading-h2">Welcome {profile?.name ?? "..."}</h1>
        <p className="body-compact">
          Email: {profile?.email ?? "-"} | Role: {profile?.role ?? "-"}
        </p>
        <div className="stack">
          <Link href="/posts" className="btn-secondary">
            Browse Posts
          </Link>
          {(profile?.role === "author" || profile?.role === "admin") && (
            <Link href="/posts/new" className="btn-primary">
              Create New Post
            </Link>
          )}
          {profile?.role === "admin" && (
            <>
              <Link href="/admin/posts" className="btn-primary">
                Manage All Posts
              </Link>
              <Link href="/admin/comments" className="btn-secondary">
                Monitor Comments
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
