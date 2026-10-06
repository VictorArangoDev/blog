import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import matter from 'gray-matter';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug requerido' }), { status: 400 });
  }

  try {
    const store = getStore('posts');
    const raw = await store.get(slug);
    if (!raw) {
      return new Response(JSON.stringify({ error: 'Post no encontrado' }), { status: 404 });
    }

    const { data: frontmatter, content } = matter(raw);

    return new Response(JSON.stringify({
      slug,
      ...frontmatter,
      content,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
