import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPostBySlug, getAllSlugs } from '@/lib/posts';
import { marked } from 'marked';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | 玉洞子星相古學堂`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'Blog' });

  const htmlContent = await marked(post.content);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/blog" className="hover:text-amber-600">{t('breadcrumbBlog')}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{post.title}</span>
        </nav>

        {/* Article header */}
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{post.category}</span>
              <time className="text-xs text-gray-400">{post.date}</time>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
            <p className="text-gray-500 text-base leading-relaxed border-l-4 border-amber-300 pl-4">{post.summary}</p>
          </header>

          {/* Article body */}
          <div
            className="prose prose-amber max-w-none
              prose-headings:font-bold prose-headings:text-gray-800
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-8 prose-p:my-4
              prose-li:text-gray-700 prose-li:leading-8
              prose-strong:text-amber-700
              prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
              prose-table:border-collapse
              prose-th:bg-amber-50 prose-th:border prose-th:border-amber-200 prose-th:px-4 prose-th:py-2
              prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2
              prose-hr:border-amber-200
            "
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>

        {/* CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-amber-700 to-amber-600 rounded-xl text-white text-center">
          <p className="text-lg font-semibold mb-2">{t('ctaTitle')}</p>
          <p className="text-amber-200 text-sm mb-4">{t('ctaDesc')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/consultation">
              <button className="px-5 py-2 bg-white text-amber-700 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                {t('ctaConsult')}
              </button>
            </Link>
            <Link href="/login">
              <button className="px-5 py-2 border border-white text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                {t('ctaChart')}
              </button>
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/blog" className="text-amber-600 hover:text-amber-700 font-medium">
            &larr; {t('backToBlog')}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
