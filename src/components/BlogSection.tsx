import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import BlogThumbnail from "@/components/BlogThumbnail";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogSection() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <section className="section relative bg-[var(--color-base)]">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <span className="badge mb-6 inline-block">
              <span className="dot" />
              Blog
            </span>
            <h2 className="text-headline text-[var(--text-primary)]">
              Latest <span className="text-gradient">insights</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="link-glow text-[var(--accent-green)] text-sm font-semibold flex items-center gap-2"
          >
            View all articles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="glass-card p-6 h-full flex flex-col shine-on-hover">
                <BlogThumbnail
                  coverImage={post.coverImage}
                  category={post.category}
                  title={post.title}
                />
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[var(--accent-green)] uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-orange)] transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-small text-[var(--text-secondary)] mb-4 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                  <span className="text-xs text-[var(--text-muted)]">{formatDate(post.date)}</span>
                  <span className="text-xs font-semibold text-[var(--accent-green)] group-hover:translate-x-1 transition-transform">
                    Read more →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
