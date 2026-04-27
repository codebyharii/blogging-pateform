import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <p className="footer-eyebrow">Aetherfield Blog</p>
          <p className="footer-copy">
            Role-based publishing, AI-ready summaries, and a clean reading
            experience built for fast browsing.
          </p>
        </div>

        <div className="footer-links">
          <Link href="/posts" className="footer-link">
            Posts
          </Link>
          <Link href="/auth/login" className="footer-link">
            Login / Signup
          </Link>
          <Link href="/dashboard" className="footer-link">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© {currentYear} Aetherfield Blog</span>
        <span>Built with Next.js + Supabase</span>
      </div>
    </footer>
  );
}