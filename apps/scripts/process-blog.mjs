import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processBlogPosts() {
  const docsDir = path.join(__dirname, '../docs');
  const outputFile = path.join(__dirname, '../src/data/blogData.ts');

  // Ensure docs directory exists
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Find all markdown files in docs/
  const files = await glob('**/*.md', { cwd: docsDir });

  const posts = [];

  const extractFirstImage = (markdown) => {
    const match = markdown.match(/!\[[^\]]*\]\(([^)]+)\)/);
    return match ? match[1] : '';
  };

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter and content
    const { data, content } = matter(fileContent);

    // Generate ID from filename
    const id = path.basename(file, '.md');

    const thumbnail =
      data.thumbnail ||
      data.cover ||
      data.image ||
      extractFirstImage(content);

    posts.push({
      id,
      title: data.title || 'Untitled',
      excerpt: data.excerpt || '',
      content: content.trim(),
      date: data.date || new Date().toISOString().split('T')[0],
      author: data.author || 'Duskpool Team',
      readTime: data.readTime || '5 min read',
      category: data.category || 'Protocol',
      thumbnail: thumbnail || '',
      tags: data.tags || [],
    });
  }

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate TypeScript file
  const output = `// This file is auto-generated from markdown files in docs/
// Do not edit manually - run 'pnpm run process-blog' to regenerate

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  thumbnail: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)};

export function getBlogPostById(id: string): BlogPost | undefined {
  return blogPosts.find(post => post.id === id);
}

export function searchBlogPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery) ||
    post.excerpt.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
`;

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, output, 'utf-8');
  console.log(`✅ Processed ${posts.length} blog posts from docs/`);
  console.log(`📝 Generated: ${outputFile}`);
}

processBlogPosts().catch(console.error);
