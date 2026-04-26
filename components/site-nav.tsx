"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type Role = "viewer" | "author" | "admin";

export function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(Boolean(user));

      if (user) {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = (await res.json()) as { data?: { role?: Role } };
          setRole(json.data?.role ?? null);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    }

    load().catch(() => undefined);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load().catch(() => undefined);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function linkClass(href: string): string {
    return pathname === href ? "nav-link nav-link-active" : "nav-link";
  }

  return (
    <header className="site-header">
      <nav className="site-nav shell">
        <Link href="/" className="site-logo">
          Aetherfield Blog
        </Link>
        <div className="nav-links">
          <Link href="/posts" className={linkClass("/posts")}>
            Posts
          </Link>
          {isLoggedIn && (
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
          )}
          {(role === "author" || role === "admin") && (
            <Link href="/posts/new" className={linkClass("/posts/new")}>
              New Post
            </Link>
          )}
          {role === "admin" && (
            <>
              <Link href="/admin/posts" className={linkClass("/admin/posts")}>
                Admin Posts
              </Link>
              <Link href="/admin/comments" className={linkClass("/admin/comments")}>
                Admin Comments
              </Link>
            </>
          )}
        </div>
        <div>
          {isLoggedIn ? (
            <button className="btn-primary" onClick={handleSignOut} type="button">
              Sign Out
            </button>
          ) : (
            <Link href="/auth/login" className="btn-secondary">
              Login / Signup
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
