import { put, list } from '@vercel/blob';
const KEY = 'inventaris.json';

async function read() {
  const { blobs } = await list({ prefix: KEY });
  if (!blobs.length) return [];
  const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
  return r.ok ? r.json() : [];
}
const write = data => put(KEY, JSON.stringify(data), {
  access: 'public', addRandomSuffix: false, allowOverwrite: true,
  contentType: 'application/json', cacheControlMaxAge: 60
});

export default async function handler(req, res) {
  try {
    let data = await read();
    if (req.method === 'GET') return res.status(200).json(data);
    if (req.method === 'POST') {
      const { nama, jumlah, lokasi } = req.body || {};
      if (!nama || jumlah === undefined || jumlah === '') return res.status(400).json({ error: 'Data tidak lengkap' });
      data.unshift({ id: Date.now().toString(36), nama: String(nama).slice(0, 80), jumlah: Number(jumlah), lokasi: String(lokasi || '').slice(0, 80) });
      await write(data);
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      data = data.filter(i => i.id !== req.query.id);
      await write(data);
      return res.status(200).json(data);
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
