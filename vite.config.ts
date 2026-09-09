import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Dev-only middleware mirroring Vercel /api/* for local `vite` runs.
 * Loads knowledgeBase dynamically so production `tsc -b` stays clean.
 */
function aeropureApiPlugin(): Plugin {
  return {
    name: 'aeropure-api-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        void (async () => {
          const url = req.url?.split('?')[0] ?? ''
          if (!url.startsWith('/api/')) {
            next()
            return
          }

          const send = (code: number, data: unknown) => {
            res.statusCode = code
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify(data))
          }

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            res.end()
            return
          }

          const readBody = async (): Promise<Record<string, unknown>> => {
            const chunks: Buffer[] = []
            await new Promise<void>((resolve, reject) => {
              req.on('data', (c: Buffer) => chunks.push(c))
              req.on('end', () => resolve())
              req.on('error', reject)
            })
            try {
              return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as Record<
                string,
                unknown
              >
            } catch {
              return {}
            }
          }

          if (url === '/api/health') {
            send(200, {
              ok: true,
              service: 'aeropure-sim',
              version: '3.0.0',
              endpoints: ['/api/sim-state', '/api/agents', '/api/health'],
              env: 'vite-dev',
            })
            return
          }

          if (url === '/api/agents') {
            const kb = await server.ssrLoadModule('/src/lib/knowledgeBase.ts')
            const AGENTS = kb.AGENTS as Array<{ id: string; name: string; role: string }>
            const PRODUCT_META = kb.PRODUCT_META as {
              title: string
              tagline: string
              author: unknown
              event: string
              sdg: number[]
              trl: number
            }
            const answerFromKnowledge = kb.answerFromKnowledge as (
              agentId: string,
              message: string,
              simSnapshot?: Record<string, unknown> | null,
              source?: 'api' | 'client',
            ) => unknown

            if (req.method === 'GET') {
              send(200, {
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
              })
              return
            }
            if (req.method === 'POST') {
              const body = await readBody()
              const message = String(body.message ?? '')
              if (!message.trim()) {
                send(400, { ok: false, error: 'message is required' })
                return
              }
              const answer = answerFromKnowledge(
                String(body.agentId ?? 'nano'),
                message,
                (body.simSnapshot as Record<string, unknown>) ?? null,
                'api',
              )
              send(200, { ok: true, ...(answer as object) })
              return
            }
          }

          if (url === '/api/sim-state') {
            if (req.method === 'GET') {
              send(200, {
                ok: true,
                engine: 'aeropure-sim-state',
                defaults: {
                  status: 'running',
                  inletTempC: 220,
                  contaminationLoad: 0.65,
                  fanSpeedPct: 55,
                  serviceMode: false,
                },
                scenario: {
                  name: 'AeroPure modular multi-stage default',
                  notes: 'vite-dev mirror',
                },
              })
              return
            }
            if (req.method === 'POST') {
              const body = await readBody()
              const inletTemp = Number(body.inletTemp ?? body.inletTempC ?? 220)
              const fanSpeed = Number(body.fanSpeed ?? body.fanSpeedPct ?? 55)
              send(200, {
                ok: true,
                controls: body,
                metrics: {
                  inletTempC: inletTemp,
                  outletTempC: Math.max(28, inletTemp * 0.35),
                  deltaT: inletTemp - Math.max(28, inletTemp * 0.35),
                  filtrationEfficiencyPct: 82,
                  pressureDropPa: 220,
                  fanRpm: Math.round(800 + (fanSpeed / 100) * 3400),
                },
              })
              return
            }
          }

          next()
        })().catch(next)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), aeropureApiPlugin()],
  build: {
    chunkSizeWarningLimit: 1400,
  },
})
