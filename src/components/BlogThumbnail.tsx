"use client";

const categoryIcons: Record<string, React.ReactNode> = {
  "Meta Ads": (
    <img src="/meta-logo.jpg" alt="Meta" className="w-8 h-8 object-contain opacity-50" />
  ),
  "Google Ads": (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" opacity={0.5}>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  ),
  Creative: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  "Snapchat Ads": (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" opacity={0.5}>
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.96.96 0 01.464-.104c.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03a3.3 3.3 0 01-.538-.074 5.04 5.04 0 00-1.273-.135 4.71 4.71 0 00-.913.074c-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884a4.71 4.71 0 00-.928-.074c-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226a.723.723 0 01-.055-.225c-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809a3.58 3.58 0 01-.346-.119c-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
    </svg>
  ),
  Conversion: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Strategy: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const categoryGradients: Record<string, string> = {
  "Meta Ads": "from-blue-500/10 via-indigo-500/5 to-transparent",
  "Google Ads": "from-emerald-500/10 via-teal-500/5 to-transparent",
  Creative: "from-pink-500/10 via-rose-500/5 to-transparent",
  "Snapchat Ads": "from-yellow-400/10 via-amber-400/5 to-transparent",
  Conversion: "from-orange-500/10 via-amber-500/5 to-transparent",
  Strategy: "from-purple-500/10 via-pink-500/5 to-transparent",
};

interface BlogThumbnailProps {
  coverImage: string;
  category: string;
  title: string;
  size?: "sm" | "md" | "lg";
}

export default function BlogThumbnail({ coverImage, category, title, size = "md" }: BlogThumbnailProps) {
  const height = size === "lg" ? "h-64" : size === "sm" ? "h-36" : "h-44";
  const gradient = categoryGradients[category] || categoryGradients.Strategy;
  const icon = categoryIcons[category] || categoryIcons.Strategy;

  if (coverImage) {
    return (
      <div className={`relative ${height} w-full overflow-hidden rounded-t-[var(--radius-xl)] -mx-6 -mt-6 mb-5`} style={{ width: "calc(100% + 3rem)" }}>
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent opacity-60" />
      </div>
    );
  }

  return (
    <div className={`relative ${height} w-full overflow-hidden rounded-t-[var(--radius-xl)] -mx-6 -mt-6 mb-5`} style={{ width: "calc(100% + 3rem)" }}>
      {/* Base */}
      <div className="absolute inset-0 bg-[var(--color-surface)]" />
      {/* Category gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center text-[var(--text-primary)]">
        {icon}
      </div>
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--color-surface)]/60 to-transparent" />
      {/* Hover effect */}
      <div className="absolute inset-0 bg-[var(--accent-green)]/0 group-hover:bg-[var(--accent-green)]/[0.03] transition-colors duration-500" />
    </div>
  );
}
