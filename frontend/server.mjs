import http from 'node:http';
import https from 'node:https';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.FRONTEND_PORT || 5173);
const backend = new URL(process.env.API_TARGET || 'http://127.0.0.1:8080');
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/src/app.js', ['src/app.js', 'text/javascript; charset=utf-8']],
  ['/src/api.js', ['src/api.js', 'text/javascript; charset=utf-8']],
  ['/src/domain.js', ['src/domain.js', 'text/javascript; charset=utf-8']],
  ['/src/styles.css', ['src/styles.css', 'text/css; charset=utf-8']],
]);

export function createServer(target = backend) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (/^\/api\/(supply(?:\/\d+)?|offal|sales)$/.test(url.pathname)) {
      const upstream = new URL(url.pathname.slice(4) + url.search, target);
      const transport = upstream.protocol === 'https:' ? https : http;
      const proxy = transport.request(upstream, {
        method: req.method,
        headers: { ...req.headers, host: upstream.host },
      }, (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      });
      proxy.setTimeout(15000, () => proxy.destroy(new Error('API timeout')));
      proxy.on('error', () => {
        if (res.headersSent) return res.destroy();
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Сервер API недоступен. Проверьте, запущен ли backend.' }));
      });
      req.on('aborted', () => proxy.destroy());
      req.pipe(proxy);
      return;
    }
    const file = files.get(url.pathname);
    if (!file || !['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(404).end('Not found');
      return;
    }
    try {
      const body = await readFile(path.join(root, file[0]));
      res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(500).end('Unable to read frontend asset');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer().listen(port, '127.0.0.1', () => {
    console.log(`МясоПром CRM: http://127.0.0.1:${port}`);
    console.log(`API proxy: ${backend.origin}`);
  });
}
