import { getAllPosts, getPostBySlug, getPostHtml } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Honey & Lemon Blog`,
    description: post.excerpt,
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const htmlContent = getPostHtml(post.content);

  // Get related posts (same category, excluding current)
  const allPosts = getAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <article className="relative min-h-screen pt-32 pb-20 bg-[var(--color-base)]">
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-small text-[var(--text-muted)] hover:text-[var(--accent-green)] transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Back to blog
        </Link>

        {/* Cover Image */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-[var(--radius-xl)] mb-10 border-[3px] border-[var(--card-border)] shadow-[var(--card-shadow)]">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-[var(--color-surface)]" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-green)]/10 via-[var(--accent-blue)]/5 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-micro text-[var(--accent-green)] block mb-2">{post.category}</span>
                  <span className="text-6xl font-black text-gradient opacity-20">H&L</span>
                </div>
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent" />
        </div>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-micro text-[var(--accent-green)]">{post.category}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
            <span className="text-micro text-[var(--text-muted)]">{post.readTime}</span>
          </div>
          <h1 className="text-headline text-[var(--text-primary)] mb-6">{post.title}</h1>
          <p className="text-body-lg text-[var(--text-secondary)] mb-8">{post.excerpt}</p>
          <div className="flex items-center gap-4 pb-8 border-b-2 border-[var(--border-subtle)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center text-white font-bold text-sm">
              H&L
            </div>
            <div>
              <p className="text-small font-semibold text-[var(--text-primary)]">{post.author}</p>
              <p className="text-xs text-[var(--text-muted)]">{formatDate(post.date)}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="blog-content mb-16"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* CTA */}
        <div className="glass-card-glow p-8 md:p-10 mb-16 relative">
          <div className="relative z-10">
            <h3 className="text-subhead text-[var(--text-primary)] mb-3">
              Ready to improve your <span className="text-gradient">results</span>?
            </h3>
            <p className="text-body text-[var(--text-secondary)] mb-6">
              Get a free audit of your current campaigns and see where the opportunities are.
            </p>
            <Link href="/#contact" className="btn-primary inline-flex">
              Get your free audit
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-[2px] bg-gradient-to-r from-[var(--accent-green)] to-transparent" />
              <span className="text-micro text-[var(--text-muted)]">More Articles</span>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                  <div className="glass-card p-5 h-full shine-on-hover">
                    <span className="text-xs font-semibold text-[var(--accent-green)] uppercase tracking-wider">
                      {p.category}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mt-2 mb-2 group-hover:text-[var(--accent-blue)] transition-colors leading-tight">
                      {p.title}
                    </h4>
                    <span className="text-xs text-[var(--text-muted)]">{p.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
