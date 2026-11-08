import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { buildDemo } from './demo-build.mjs';

await buildDemo();
const page = await readFile(new URL('../dist/login.html', import.meta.url));
const port = Number(process.env.PORT || 4173);
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method) || req.url.split('?')[0] !== '/') {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store'});
  res.end(req.method === 'HEAD' ? undefined : page);
});
server.listen(port, '127.0.0.1', () => console.log('Open http://127.0.0.1:' + server.address().port));
