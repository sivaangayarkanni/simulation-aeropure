/**
 * POST /api/agents
 * Body: { agentId, message, simSnapshot? }
 * Returns grounded markdown answer from product deck knowledge.
 */
import { AGENTS, answerFromKnowledge, PRODUCT_META } from './_lib/knowledge.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      engine: 'aeropure-agents',
      agents: AGENTS.map((a) => ({ id: a.id, name: a.name, role: a.role })),
      product: {
        title: PRODUCT_META.title,
        tagline: PRODUCT_META.tagline,
        author: PRODUCT_META.author,
        event: PRODUCT_META.event,
        sdg: PRODUCT_META.sdg,
        trl: PRODUCT_META.trl,
      },
    });
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};
    const agentId = String(body.agentId || 'nano');
    const message = String(body.message || '');
    const simSnapshot = body.simSnapshot || null;

    if (!message.trim()) {
      res.status(400).json({ ok: false, error: 'message is required' });
      return;
    }

    const answer = answerFromKnowledge(agentId, message, simSnapshot);
    res.status(200).json(answer);
    return;
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}
