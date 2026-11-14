import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createServer } from '../server.mjs';

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return `http://127.0.0.1:${server.address().port}`;
}

test('Статика и прокси сохраняют маршрут, метод, тело и HTTP-ошибку API', async (t) => {
  const received = [];
  const backend = http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    received.push({ url: req.url, method: req.method, body });
    res.writeHead(req.method === 'DELETE' ? 400 : 200, { 'Content-Type': 'application/json' });
    res.end(req.method === 'DELETE' ? '{"error":"Связанная продажа"}' : '[]');
  });
  const backendUrl = await listen(backend);
  t.after(() => backend.close());
  const frontend = createServer(new URL(backendUrl));
  const url = await listen(frontend);
  t.after(() => frontend.close());
  const html = await fetch(url);
  assert.match(await html.text(), /МясоПром/);
  assert.equal(html.headers.get('content-type'), 'text/html; charset=utf-8');
  for (const asset of ['app.js', 'api.js', 'domain.js', 'styles.css']) assert.equal((await fetch(`${url}/src/${asset}`)).status, 200);
  await fetch(`${url}/api/supply`);
  await fetch(`${url}/api/offal`);
  await fetch(`${url}/api/sales`);
  const body = JSON.stringify({ weight: 500, commingFrom: 'Агроферма' });
  await fetch(`${url}/api/supply/17`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
  const error = await fetch(`${url}/api/supply/17`, { method: 'DELETE' });
  assert.equal(error.status, 400);
  assert.deepEqual(await error.json(), { error: 'Связанная продажа' });
  assert.deepEqual(received.map(({ url, method }) => [url, method]), [['/supply', 'GET'], ['/offal', 'GET'], ['/sales', 'GET'], ['/supply/17', 'PUT'], ['/supply/17', 'DELETE']]);
  assert.equal(received[3].body, body);
  assert.equal((await fetch(`${url}/.env`)).status, 404);
  assert.equal((await fetch(`${url}/api/arbitrary`)).status, 404);
});

test('Недоступный backend возвращает понятную ошибку 502', async (t) => {
  const unused = http.createServer();
  const target = await listen(unused);
  await new Promise((resolve) => unused.close(resolve));
  const server = createServer(new URL(target));
  const url = await listen(server);
  t.after(() => server.close());
  const response = await fetch(`${url}/api/supply`);
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /API недоступен/);
});
