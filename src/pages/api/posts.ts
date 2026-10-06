import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import matter from 'gray-matter';

export const GET: APIRoute = async () => {
  try {
    const store = getStore('posts');
    const { blobs } = await store.list();

    const posts = await Promise.all(
      blobs.map(async (blob: { key: string }) => {
        const raw = await store.get(blob.key);
        if (!raw) return null;
        const { data } = matter(raw);
        return { slug: blob.key, ...data };
      })
    );

    const sorted = posts
      .filter(Boolean)
      .sort((a: any, b: any) => {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });

    return new Response(JSON.stringify(sorted), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
