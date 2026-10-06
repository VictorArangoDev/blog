import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, author, category, excerpt, coverImage, content, date } = body;

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Título y contenido son requeridos' }), { status: 400 });
    }

    // Build slug from title
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);

    const postDate = date || new Date().toISOString();

    const markdown = `---
title: "${title.replace(/"/g, '\\"')}"
author: "${(author || 'Anónimo').replace(/"/g, '\\"')}"
category: "${(category || 'General').replace(/"/g, '\\"')}"
excerpt: "${(excerpt || '').replace(/"/g, '\\"')}"
coverImage: "${(coverImage || '').replace(/"/g, '\\"')}"
date: "${postDate}"
---

${content}
`;

    const store = getStore('posts');
    await store.set(slug, markdown);

    return new Response(JSON.stringify({ slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Error interno' }), { status: 500 });
  }
};
