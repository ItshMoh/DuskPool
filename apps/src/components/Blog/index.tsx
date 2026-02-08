import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, Bell, Maximize2, Search } from 'lucide-react';
import { blogPosts } from '../../data/blogData';
import BackgroundEffects from '../BackgroundEffects';
import HUDFrame from '../HUDFrame';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase();
};

const resolvePostImage = (postId: string) => {
  if (postId === 'whitepaper') return '/blog-assets/image.png';
  if (postId === 'introducing-duskpool') return '/blog-assets/image-1.png';
  return '';
};

type ArticleCardProps = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
};

const ArticleCard = ({ id, title, excerpt, category, date, author }: ArticleCardProps) => {
  const image = resolvePostImage(id);

  return (
    <Link to={`/blog/${id}`} className="group block">
      <article className="h-full border border-white/10 bg-black/30 hover:border-white/20 transition-colors">
        <div className="relative h-56 overflow-hidden border-b border-white/10">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-500"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-white/5 via-black/40 to-brand-stellar/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-4 right-4">
            <span className="bg-black/60 border border-white/10 text-[10px] px-2 py-1 font-mono text-white uppercase tracking-wider">
              {category}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono mb-3 uppercase tracking-wider">
            <span className="text-brand-stellar">{formatDate(date)}</span>
            <span className="w-[1px] h-3 bg-white/20" />
            <span>{author}</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-brand-stellar transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
            {excerpt || 'Read the latest update from the Duskpool team.'}
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-brand-stellar group-hover:text-white transition-colors">
            Read Article
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export function Blog() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const set = new Set(blogPosts.map((post) => post.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === 'ALL' || post.category === activeCategory;
      if (!query) return matchesCategory;
      const matchesQuery =
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  const handleScrollDown = () => {
    const target = document.getElementById('blog-featured');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <BackgroundEffects />
      <HUDFrame />

      <header className="fixed top-0 left-0 w-full z-40">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="px-6 py-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
              <div className="w-5 h-5 border border-white/60 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>
            </Link>
            <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
              <Search className="w-4 h-4 text-white/60" />
            </button>
            <div className="w-24 h-[1px] bg-white/20 hidden md:block" />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 top-0">
            <svg className="w-[400px] h-12" viewBox="0 0 400 50" fill="none">
              <path d="M120 0 L150 20 L250 20 L280 0" stroke="white" strokeOpacity="0.3" strokeWidth="1" fill="none" />
              <line x1="140" y1="10" x2="145" y2="15" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <line x1="260" y1="10" x2="255" y2="15" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
            </svg>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-24 h-[1px] bg-white/20 hidden md:block" />
            <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
              <Bell className="w-4 h-4 text-white/60" />
            </button>
            <button className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
              <Maximize2 className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 md:px-10 pt-32 pb-24 max-w-[1400px] mx-auto">
        <div className="mb-16 text-center relative">
          <div className="absolute left-1/2 top-6 -translate-x-1/2 w-[420px] h-[160px] bg-blue-500/15 blur-[120px] rounded-full -z-10" />
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-white/50 mb-4">
            Duskpool Journal
          </p>
          <h1 className="text-6xl md:text-8xl font-condensed font-bold uppercase tracking-[0.12em]">
            Transmissions
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-10 border-b border-white/10 pb-6">
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm font-mono tracking-[0.2em] uppercase">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={
                  activeCategory === category
                    ? 'text-white border-b-2 border-brand-stellar pb-1'
                    : 'text-white/50 hover:text-white transition-colors'
                }
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/20 px-4 py-2 pl-10 text-sm focus:outline-none focus:border-brand-stellar/50 transition-colors text-white font-mono placeholder-white/30"
            />
            <span className="absolute left-3 top-2.5 text-white/30 text-xs">⌘</span>
          </div>
        </div>

        {featuredPost ? (
          <section id="blog-featured" className="mb-16">
            <div className="border border-white/10 bg-black/40 overflow-hidden group">
              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0">
                <div className="relative min-h-[320px]">
                  {resolvePostImage(featuredPost.id) ? (
                    <img
                      src={resolvePostImage(featuredPost.id)}
                      alt={featuredPost.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-75 group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-black/50 to-brand-stellar/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="bg-brand-stellar/20 border border-brand-stellar/40 px-3 py-1 text-[10px] font-mono uppercase tracking-wider">
                      Featured
                    </span>
                    <span className="bg-black/40 border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-wider">
                      {featuredPost.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-[10px] text-white/50 font-mono mb-6 uppercase tracking-wider">
                    <span>{formatDate(featuredPost.date)}</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight group-hover:text-brand-stellar transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    {featuredPost.excerpt || 'Explore the latest technical update from the Duskpool protocol.'}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-stellar/70 to-purple-500/60" />
                    <span className="text-sm text-white/80">{featuredPost.author}</span>
                    <Link
                      to={`/blog/${featuredPost.id}`}
                      className="ml-auto text-[11px] font-mono uppercase tracking-wider text-brand-stellar hover:text-white transition-colors"
                    >
                      Read Article →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="py-16 text-center text-gray-400">
            No blog posts yet.
          </div>
        )}

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remainingPosts.map((post) => (
              <ArticleCard
                key={post.id}
                id={post.id}
                title={post.title}
                excerpt={post.excerpt}
                category={post.category}
                date={post.date}
                author={post.author}
              />
            ))}
          </div>
        </section>

        <section className="mt-20 border-y border-white/10 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-stellar/10 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 max-w-5xl mx-auto relative z-10">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-semibold mb-4">Stay in the Shadows</h2>
              <p className="text-gray-400 leading-relaxed">
                Subscribe to our transmission list for protocol updates, governance alerts, and market research.
              </p>
            </div>
            <div className="md:w-1/2 w-full">
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/5 border border-white/20 px-6 py-3 focus:outline-none focus:border-brand-stellar/40 text-white transition-colors placeholder-white/30 font-mono"
                />
                <button type="button" className="bg-white text-black px-8 py-3 font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors border border-white">
                  Subscribe
                </button>
              </form>
              <p className="mt-4 text-xs text-white/40 font-mono">
                * Unsubscribe any time. No spam, just signal.
              </p>
            </div>
          </div>
        </section>
      </main>

      <button
        onClick={handleScrollDown}
        className="fixed bottom-8 left-8 z-40 hidden md:flex items-center gap-4 group cursor-pointer"
      >
        <div className="w-12 h-12 border border-white/10 bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/10 group-hover:border-brand-stellar/30 transition-all duration-300">
          <ArrowDown className="w-5 h-5 text-white animate-bounce" />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors uppercase">
          Scroll Down
        </span>
      </button>
    </div>
  );
}

export { BlogPost } from './BlogPost';
