import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'files/' });
      return res.status(200).json(blobs.map(b => ({
        url: b.url, name: b.pathname.replace('files/', ''), size: b.size, uploadedAt: b.uploadedAt
      })).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)));
    }
    if (req.method === 'POST') {
      const name = (req.query.name || 'file').replace(/[^\w.\- ]/g, '_');
      const blob = await put('files/' + name, req, { access: 'public', addRandomSuffix: true, contentType: req.headers['content-type'] });
      return res.status(201).json(blob);
    }
    if (req.method === 'DELETE') {
      await del(req.query.url);
      return res.status(200).json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
