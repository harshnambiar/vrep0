import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return defineConfig({
    plugins: [tailwindcss()],

    server: {
      proxy: {
        '/api/vouch': {
          target: 'https://app.getvouch.io',
          changeOrigin: true,
          secure: false,

          // This is the key part that fixes the Authorization header issue
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Optional: ensure the host header is correct
              proxyReq.setHeader('Host', 'app.getvouch.io');
            });

            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Force proper CORS headers on the response that comes back to the browser
              proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';

              // Remove any conflicting headers from the original server
              delete proxyRes.headers['access-control-allow-origin'];
              delete proxyRes.headers['access-control-allow-headers'];
            });
          },

          // Clean rewrite - remove the /api/vouch prefix before sending to real server
          rewrite: (path) => path.replace(/^\/api\/vouch/, ''),
        }
      }
    },

    define: {
      // ... your existing define block remains unchanged
      'process.env.VITE_RPC_URL': JSON.stringify(env.VITE_RPC_URL),
      'process.env.VITE_CHAIN_ID': JSON.stringify(env.VITE_CHAIN_ID),
      'process.env.VITE_VL_CUSTOMER_ID': JSON.stringify(env.VITE_VL_CUSTOMER_ID),
      'process.env.VITE_VL_API_KEY': JSON.stringify(env.VITE_VL_API_KEY),
      'process.env.VITE_VL_WEBHOOK_SECRET': JSON.stringify(env.VITE_VL_WEBHOOK_SECRET),
      'process.env.VITE_LINKEDIN_DATA_SOURCE_ID': JSON.stringify(env.VITE_LINKEDIN_DATA_SOURCE_ID),
      'process.env.VITE_X_DATA_SOURCE_ID': JSON.stringify(env.VITE_X_DATA_SOURCE_ID),
      'process.env.VITE_GITHUB_DATA_SOURCE_ID': JSON.stringify(env.VITE_GITHUB_DATA_SOURCE_ID),
    }
  });
};
