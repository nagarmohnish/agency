import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import BlogThumbnail from "@/components/BlogThumbnail";

export const metadata = {
  title: "Blog | ROIlabs",
  description: "Insights on paid advertising, creative strategy, and performance marketing from the ROIlabs team.",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <section className="relative min-h-screen pt-32 pb-20 bg-[var(--color-base)]">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="badge mb-6 inline-block">
            <span className="dot" />
            Blog
          </span>
          <h1 className="text-headline text-[var(--text-primary)] mb-4">
            Insights & <span className="text-gradient">Strategy</span>
          </h1>
          <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl">
            Practical advice on paid advertising, creative testing, and scaling
            your business from the team that manages millions in ad spend.
          </p>
        </div>

        {/* Featured Post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block mb-16 group">
            <div className="glass-card-glow overflow-hidden md:grid md:grid-cols-2 md:gap-0">
              {/* Thumbnail */}
              <div className="relative h-56 md:h-full min-h-[280px] overflow-hidden">
                {featured.coverImage ? (
                  <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[var(--color-surface)]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-green)]/15 via-[var(--accent-blue)]/5 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-14 h-14 text-[var(--text-primary)] opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 hidden md:block" />
              </div>
              {/* Content */}
              <div className="p-6 md:p-10 md:flex md:flex-col md:justify-center">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-micro text-[var(--accent-green)]">{featured.category}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  <span className="text-micro text-[var(--text-muted)]">Featured</span>
                </div>
                <h2 className="text-headline text-[var(--text-primary)] mb-4 group-hover:text-[var(--accent-orange)] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-body-lg text-[var(--text-secondary)] mb-6">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-small text-[var(--text-muted)]">
                  <span>{formatDate(featured.date)}</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  <span>{featured.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
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
