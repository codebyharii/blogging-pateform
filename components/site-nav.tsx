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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    // Close mobile menu when route changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
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

  function navItemClass(href: string): string {
    return pathname === href ? "nav-item nav-item-active" : "nav-item";
  }

  return (
    <>
      <header className="site-header">
        <nav className="site-nav shell">
          <div className="site-nav-brand-row">
            <Link href="/" className="site-logo">
              Aetherfield Blog
            </Link>
            <div className="site-nav-mobile-controls">
              <button
                className="menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                type="button"
              >
                <span className={`hamburger ${mobileMenuOpen ? "active" : ""}`}>
                  <span />
                  <span />
                  <span />
                </span>
              </button>
              <div className="site-nav-cta site-nav-cta-mobile">
                {isLoggedIn ? (
                  <button
                    className="btn-primary btn-tight"
                    onClick={handleSignOut}
                    type="button"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link href="/auth/login" className="btn-secondary btn-tight">
                    Login / Signup
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="nav-links" aria-label="Primary navigation">
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

          <div className="site-nav-cta site-nav-cta-desktop">
            {isLoggedIn ? (
              <button
                className="btn-primary btn-tight"
                onClick={handleSignOut}
                type="button"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/auth/login" className="btn-secondary btn-tight">
                Login / Signup
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <h2 className="mobile-menu-title">Menu</h2>
              <button
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu-links">
              <Link href="/posts" className={navItemClass("/posts")}>
                Posts
              </Link>
              {isLoggedIn && (
                <Link href="/dashboard" className={navItemClass("/dashboard")}>
                  Dashboard
                </Link>
              )}
              {(role === "author" || role === "admin") && (
                <Link href="/posts/new" className={navItemClass("/posts/new")}>
                  New Post
                </Link>
              )}
              {role === "admin" && (
                <>
                  <Link href="/admin/posts" className={navItemClass("/admin/posts")}>
                    Admin Posts
                  </Link>
                  <Link href="/admin/comments" className={navItemClass("/admin/comments")}>
                    Admin Comments
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
