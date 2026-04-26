import Link from "next/link";
import { PostList } from "@/components/post-list";

export default function Home() {
  return (
    <div>
      <section className="hero shell">
        <h1 className="hero-headline">
          Sustainability stories with role-based publishing and AI-ready summaries
        </h1>
        <p className="hero-subheading">
          Build and run an enterprise-style blog platform powered by Next.js,
          Supabase Auth, and Google AI-generated previews that are stored once
          and reused for cost-efficient listing performance.
        </p>
        <div className="hero-buttons">
          <Link href="/posts" className="btn-primary">
            Explore Posts
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Join Platform
          </Link>
        </div>
      </section>
      <PostList />
    </div>
  );
}
