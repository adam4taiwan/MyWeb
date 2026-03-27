import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPosts } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '命理知識文章 | 玉洞子星相古學堂',
  description: '玉洞子老師親撰命理知識文章，涵蓋八字入門、大運解析、流年運勢等主題，帶你深入了解傳統命理智慧。',
};

export default function BlogPage() {
  const posts = getAllPosts();

  const categories = Array.from(new Set(posts.map(p => p.category)));

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-900 to-amber-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-pacifico)' }}>
          命理知識文章
        </h1>
        <p className="text-amber-200 text-lg max-w-xl mx-auto">
          玉洞子老師親撰，帶你認識八字、紫微斗數的核心智慧
        </p>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">目前尚無文章，請稍後再來。</p>
        ) : (
          <>
            {/* Category tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(cat => (
                <span key={cat} className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full border border-amber-200">
                  {cat}
                </span>
              ))}
            </div>

            {/* Post list */}
            <div className="space-y-6">
              {posts.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-xl border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all p-6 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{post.category}</span>
                      <time className="text-xs text-gray-400">{post.date}</time>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 hover:text-amber-700 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{post.summary}</p>
                    <span className="inline-block mt-3 text-amber-600 text-sm font-medium">閱讀全文 &rarr;</span>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
