import { PostList } from "@/components/post-list";

export default function PostsPage() {
  return (
    <div>
      <section className="shell section-space" style={{ paddingBottom: "0.5rem" }}>
        <h1 className="heading-h2">All Blog Posts</h1>
        <p className="muted">
          Search by title/content and browse paginated summaries generated during
          post creation.
        </p>
      </section>
      <PostList />
    </div>
  );
}
