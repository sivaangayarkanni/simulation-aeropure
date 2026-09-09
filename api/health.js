export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  res.status(200).json({
    ok: true,
    service: 'aeropure-sim',
    version: '3.0.0',
    endpoints: ['/api/sim-state', '/api/agents', '/api/health'],
    ts: new Date().toISOString(),
  });
}
