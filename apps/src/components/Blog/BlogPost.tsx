import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { getBlogPostById } from '../../data/blogData';
import { CodeBlock } from './CodeBlock';
import { BlogHeader } from './BlogHeader';

type ChildrenProps = { children?: ReactNode };

/* -------------------------------------------------------------------------- */
/*                                  GRAPHICS                                  */
/* -------------------------------------------------------------------------- */

// Dot Matrix User Icon (15x20 grid roughly)
const UserIcon = ({ x, y, scale = 1, opacity = 1 }: { x: number; y: number; scale?: number; opacity?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    {/* Head - 4x4ish cluster */}
    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    <circle cx="16" cy="4" r="1.5" fill="currentColor" />
    <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />

    {/* Shoulders/Body - Pyramidal dot structure */}
    <circle cx="14" cy="14" r="1.5" fill="currentColor" />

    <circle cx="10" cy="18" r="1.5" fill="currentColor" />
    <circle cx="14" cy="18" r="1.5" fill="currentColor" />
    <circle cx="18" cy="18" r="1.5" fill="currentColor" />

    <circle cx="6" cy="22" r="1.5" fill="currentColor" />
    <circle cx="10" cy="22" r="1.5" fill="currentColor" />
    <circle cx="14" cy="22" r="1.5" fill="currentColor" />
    <circle cx="18" cy="22" r="1.5" fill="currentColor" />
    <circle cx="22" cy="22" r="1.5" fill="currentColor" />

    <circle cx="2" cy="26" r="1.5" fill="currentColor" />
    <circle cx="6" cy="26" r="1.5" fill="currentColor" />
    <circle cx="10" cy="26" r="1.5" fill="currentColor" />
    <circle cx="14" cy="26" r="1.5" fill="currentColor" />
    <circle cx="18" cy="26" r="1.5" fill="currentColor" />
    <circle cx="22" cy="26" r="1.5" fill="currentColor" />
    <circle cx="26" cy="26" r="1.5" fill="currentColor" />
  </g>
);

// Dot Matrix Monitor Icon
const MonitorIcon = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Screen Dots 7x5 */}
    {Array.from({ length: 5 }).map((_, row) =>
      Array.from({ length: 9 }).map((_, col) => (
        <circle key={`m-${row}-${col}`} cx={col * 4} cy={row * 4} r="1.2" fill={row === 4 ? "#9D7BFF" : "#9D7BFF"} opacity={row < 4 ? 0.9 : 0.5} />
      ))
    )}
    {/* Stand */}
    <rect x="12" y="22" width="8" height="6" rx="1" fill="#444" />
    <rect x="8" y="28" width="16" height="2" rx="1" fill="#444" />
  </g>
);

// Puzzle Piece with Glow
const PuzzlePiece = ({ x, y, rotation = 0, color = "#8B5CF6", scale = 1.5 }: { x: number; y: number; rotation?: number; color?: string; scale?: number }) => (
  <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
    <defs>
      <filter id={`glow-${x}-${y}`}>
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Simple jigsaw shape path */}
    <path
      d="M16 0H12C12 2.2 10.2 4 8 4C5.8 4 4 2.2 4 0H0V4C2.2 4 4 5.8 4 8C4 10.2 2.2 12 0 12V16H4C4 13.8 5.8 12 8 12C10.2 12 12 13.8 12 16H16V12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4V0Z"
      fill={color}
      filter={`url(#glow-${x}-${y})`}
    />
  </g>
);

/* -------------------------------------------------------------------------- */
/*                               HERO GRAPHIC                                 */
/* -------------------------------------------------------------------------- */

const HeroGraphic = ({ title }: { title: string }) => (
  <div className="relative w-full bg-[#050505] rounded-xl overflow-hidden aspect-[16/10] md:aspect-[2/1] lg:aspect-[2.3/1] flex flex-col items-center shadow-2xl shadow-purple-900/10 mb-20 lg:mb-24 border border-white/5 select-none">

    {/* Ambient Background Glows */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_60%)] pointer-events-none" />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

    {/* Subtle Grid Pattern */}
    <div className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-overlay">
      <svg width="100%" height="100%">
        <pattern id="hero-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#666" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
    </div>

    {/* Inner Content Wrapper */}
    <div className="relative z-10 w-full h-full flex flex-col items-center pt-16 md:pt-20 lg:pt-24">

      {/* Graphic Title */}
      <div className="text-center z-20 px-4">
        <span className="block text-gray-400 font-normal text-sm md:text-lg mb-2 tracking-wide font-sans opacity-80">
          Duskpool Protocol
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-6xl font-medium tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9F7AEA] via-[#C4B5FD] to-[#818CF8]">
            {title}
          </span>
        </h2>
      </div>

      {/* Vector Graphics Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" className="w-full h-full">

          {/* --- Connection Definitions --- */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#555" />
            </marker>
            <linearGradient id="fade-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#444" stopOpacity="0.1"/>
              <stop offset="50%" stopColor="#666" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#444" stopOpacity="0.1"/>
            </linearGradient>
          </defs>

          {/* --- Bottom Left Group --- */}
          {/* User 1 (Top) */}
          <g className="text-gray-600">
             <UserIcon x={240} y={380} scale={1.2} opacity={0.6} />
             {/* Dashed line to Puzzle */}
             <path d="M 280 405 L 340 405" stroke="#444" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrowhead)" opacity="0.5"/>
          </g>
          {/* Puzzle 1 */}
          <PuzzlePiece x={350} y={390} color="#A78BFA" />

          {/* User 2 (Bottom) */}
          <g className="text-gray-600">
              <UserIcon x={240} y={480} scale={1.2} opacity={0.6} />
              {/* Dashed line to Puzzle */}
              <path d="M 280 505 L 340 505" stroke="#444" strokeWidth="1.5" strokeDasharray="4 4" markerEnd="url(#arrowhead)" opacity="0.5"/>
          </g>
          {/* Puzzle 2 */}
          <PuzzlePiece x={350} y={490} color="#8B5CF6" />


          {/* --- Connecting Curves to Center --- */}
          {/* From Top Puzzle */}
          <path d="M 380 405 C 460 405, 500 500, 560 520" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
          {/* From Bottom Puzzle */}
          <path d="M 380 505 C 460 505, 480 530, 560 530" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>


          {/* --- Center Monitor Group --- */}
          <g transform="translate(600, 540)">
             {/* Concentric Rings Effect */}
             <circle cx="16" cy="10" r="80" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
             <circle cx="16" cy="10" r="120" fill="none" stroke="#333" strokeWidth="1" strokeDasharray="6 6" opacity="0.1" />

             {/* Orbiting particle trace */}
             <path d="M -90 -40 A 100 100 0 0 1 120 -40" fill="none" stroke="url(#fade-line)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>

             {/* The Monitor Icon */}
             <g transform="translate(0, -10)">
               <MonitorIcon x={0} y={0} scale={1.3} />
             </g>

             {/* Purple Glow Underneath */}
             <circle cx="16" cy="20" r="40" fill="#7C3AED" fillOpacity="0.2" filter="blur(20px)" />
          </g>


          {/* --- Bottom Right Hint (Partial) --- */}
          <g opacity="0.4">
             <PuzzlePiece x={950} y={500} rotation={0} color="#4C1D95" />
             <path d="M 940 515 L 880 515" stroke="#444" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5"/>
          </g>

        </svg>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = id ? getBlogPostById(id) : undefined;

  if (!post) {
    return (
      <div className="w-full min-h-screen bg-white">
        <BlogHeader />
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center py-20">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-500 mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Link
              to="/blog"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <BlogHeader />

      {/* Main Content - shifted to right side */}
      <div className="w-full font-sans pt-16 md:pt-24 lg:pt-32 pl-6 md:pl-[10%] lg:pl-[15%] pr-6 md:pr-12">

        {/* Content Column */}
        <div className="max-w-[800px]">
          {/* Main H1 Title */}
          <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-normal tracking-[-0.015em] text-[#1a1a1a] leading-[1.2] mb-10">
            {post.title}
          </h1>

          {/* Author Info - below title */}
          <div className="flex items-center gap-4 mb-16 lg:mb-20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-stellar to-purple-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {post.author.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-gray-800 leading-snug">Written by {post.author}</span>
              <span className="text-[14px] text-gray-500 leading-snug mt-0.5">Published {formatDate(post.date)}</span>
            </div>
          </div>

          {/* ------------------- HERO GRAPHIC ------------------- */}
          <HeroGraphic title={post.title} />

          {/* ------------------- ARTICLE TEXT ------------------- */}
          <div className="w-full max-w-[680px]">
              <article className="blog-content font-serif">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ children }: ChildrenProps) => (
                      <h2 className="font-serif text-[1.75rem] md:text-[2rem] font-normal text-[#1a1a1a] mb-6 tracking-[-0.01em] mt-16 leading-[1.25]">
                        {children}
                      </h2>
                    ),
                    h2: ({ children }: ChildrenProps) => (
                      <h3 className="font-serif text-[1.5rem] md:text-[1.75rem] font-normal text-[#1a1a1a] mb-6 tracking-[-0.01em] mt-16 leading-[1.3]">
                        {children}
                      </h3>
                    ),
                    h3: ({ children }: ChildrenProps) => (
                      <h4 className="font-serif text-[1.25rem] md:text-[1.375rem] font-normal text-[#1a1a1a] mb-5 mt-14 leading-[1.35]">
                        {children}
                      </h4>
                    ),
                    p: ({ children }: ChildrenProps) => (
                      <p className="font-serif text-[1.0625rem] leading-[1.9] text-[#1a1a1a] mb-10">
                        {children}
                      </p>
                    ),
                    ul: ({ children }: ChildrenProps) => (
                      <ul className="list-disc list-outside ml-5 mb-10 text-[#1a1a1a] space-y-4">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }: ChildrenProps) => (
                      <ol className="list-decimal list-outside ml-5 mb-10 text-[#1a1a1a] space-y-4">
                        {children}
                      </ol>
                    ),
                    li: ({ children }: ChildrenProps) => (
                      <li className="font-serif text-[1.0625rem] leading-[1.9] pl-1">
                        {children}
                      </li>
                    ),
                    strong: ({ children }: ChildrenProps) => (
                      <strong className="font-semibold">
                        {children}
                      </strong>
                    ),
                    em: ({ children }: ChildrenProps) => (
                      <em className="italic">
                        {children}
                      </em>
                    ),
                    a: ({ href, children }: { href?: string } & ChildrenProps) => (
                      <Link
                        to={href || '#'}
                        className="text-[#1a1a1a] underline decoration-gray-400 underline-offset-2 hover:decoration-gray-900 transition-colors"
                      >
                        {children}
                      </Link>
                    ),
                    blockquote: ({ children }: ChildrenProps) => (
                      <blockquote className="border-l-[3px] border-gray-300 pl-6 mt-4 mb-10 text-[#444] italic font-serif text-[1.0625rem] leading-[1.9]">
                        {children}
                      </blockquote>
                    ),
                    pre: ({ children }: ChildrenProps) => (
                      <pre className="bg-[#0d0d0d] text-gray-100 rounded-lg p-5 overflow-x-auto my-12 text-[0.875rem] leading-[1.7]">
                        {children}
                      </pre>
                    ),
                    code: ({ className, children, ...props }: any) => {
                      // ReactMarkdown passes HTML attributes plus an `inline` flag.
                      // Use a permissive any here so the function shape matches the
                      // expected ComponentType signature and avoids a strict
                      // index-signature mismatch with HTMLAttributes.
                      const inline = (props?.inline as boolean | undefined) || !className;
                      return (
                        <CodeBlock className={className} inline={inline}>
                          {children}
                        </CodeBlock>
                      );
                    },
                    img: ({ src, alt }: { src?: string; alt?: string }) => (
                      <figure className="my-14">
                        <img
                          src={src}
                          alt={alt}
                          className="w-full rounded-lg"
                          loading="lazy"
                        />
                        {alt && (
                          <figcaption className="text-center text-sm text-gray-500 mt-4 font-sans">
                            {alt}
                          </figcaption>
                        )}
                      </figure>
                    ),
                    hr: () => (
                      <hr className="my-16 border-gray-200" />
                    ),
                    table: ({ children }: ChildrenProps) => (
                      <div className="overflow-x-auto my-12">
                        <table className="w-full border border-gray-200 border-collapse font-sans text-[0.9375rem]">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }: ChildrenProps) => (
                      <thead className="bg-gray-50 border-b border-gray-200">
                        {children}
                      </thead>
                    ),
                    th: ({ children }: ChildrenProps) => (
                      <th className="text-left p-4 text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0">
                        {children}
                      </th>
                    ),
                    td: ({ children }: ChildrenProps) => (
                      <td className="p-4 text-gray-700 border-b border-gray-100 border-r border-gray-200 last:border-r-0">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </article>

            {/* Back to blog */}
            <div className="mt-24 pt-12 border-t border-gray-200">
              <Link
                to="/blog"
                className="text-gray-400 hover:text-gray-900 transition-colors text-[14px]"
              >
                ← Back to all posts
              </Link>
            </div>

            <div className="h-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
