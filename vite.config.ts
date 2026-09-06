import { createLogger, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* The console polls /api/state every 1.5 s and is designed to run perfectly
   well with no simulator attached — it falls back to the seed data in
   src/data. Vite logs a full ECONNREFUSED stack trace for every failed poll,
   which buries the dev server in noise within seconds and makes a working
   setup look broken. Its proxy error handler is attached after `configure`
   runs, so it cannot be removed there; filtering the logger is the supported
   way. The condition is still reported once, by the proxy handler below.

   Only this exact case is suppressed — any other proxy failure still prints. */
const logger = createLogger()
const baseError = logger.error
logger.error = (msg, options) => {
  if (msg.includes('http proxy error') && msg.includes('ECONNREFUSED')) return
  baseError(msg, options)
}

export default defineConfig({
  customLogger: logger,

  plugins: [react()],

  optimizeDeps: {
    // MapLibre ships its own web worker as a separate ESM entry. Vite's dep
    // pre-bundler rewrites the main module but does not always emit the worker
    // alongside it, which surfaces on dev start as:
    //   "The file does not exist at .../deps/maplibre-gl-worker.mjs"
    // Excluding it from pre-bundling lets Vite serve the package as authored,
    // worker included. Costs a little dev cold-start, nothing at build time.
    exclude: ['maplibre-gl'],
  },

  build: {
    rollupOptions: {
      output: {
        // MapLibre is ~900 kB on its own and changes far less often than the
        // console does — splitting it keeps app rebuilds cheap to re-download.
        manualChunks: {
          maplibre: ['maplibre-gl'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          // Reports the offline simulator once, in plain language, and answers
          // the request so the client's fetch rejects fast instead of hanging.
          let warned = false
          proxy.on('error', (err: NodeJS.ErrnoException, _req, res) => {
            const offline = err.code === 'ECONNREFUSED'

            if (offline) {
              if (!warned) {
                warned = true
                // eslint-disable-next-line no-console
                console.log(
                  [
                    '',
                    '  [simulator] not running on :4000 — console is using seed data.',
                    '  Start it with:  node app/simulator/server.js',
                    '',
                  ].join('\n')
                )
              }
            } else {
              // eslint-disable-next-line no-console
              console.error('[proxy]', err.message)
            }

            // Nothing else is listening now, so always close the request.
            if (res && 'writeHead' in res) {
              if (!res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' })
              }
              res.end(JSON.stringify({ error: offline ? 'simulator offline' : 'proxy error' }))
            } else if (res && 'end' in res) {
              // WebSocket upgrade: `res` is a raw socket, not a response.
              try {
                ;(res as { end: () => void }).end()
              } catch {
                /* already closed */
              }
            }
          })
        },
      },
    },
  },
})
