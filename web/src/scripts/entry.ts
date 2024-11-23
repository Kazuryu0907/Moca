import routes from './routes.json';
import path from "path";
const PORT = 5174;
const appUrl = `http://localhost:${PORT}`;

// Bunを使ってHTTPサーバーを立ち上げる
Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);
    console.log(url.pathname);
    console.log(Object.keys(routes));
    console.log(Object.keys(routes).includes(path.normalize(url.pathname)) || url.pathname === "/");
    const pathname = url.pathname === "/" ? "/" : path.normalize(url.pathname);
    const response = new Response(
      Buffer.from(routes[pathname].base64, 'base64').toString('utf-8')
    );
    response.headers.set('Content-Type', routes[pathname].contentType);
    return response;
  },
});

// コンソール表示
import { styleText } from 'node:util';

const announce = [
  [styleText('white', 'HTTP-server started:'), styleText('cyan', appUrl)],
  [styleText('white', 'Press Ctrl+C to stop the server.')],
];
announce.map((texts) => console.log(...texts));

// // ブラウザを開く
// import open from 'open';

// open(appUrl);
