import fs from 'fs';
import path from 'path';

const dist = path.resolve(__dirname, '../../dist');
console.log(dist);
const files = fs.readdirSync(dist, { recursive: true });

// ファイルをbase64にエンコードしてroutes.jsonに書き出す
const promises = files
  .filter((fileName) => {
    // もしfileNameがディレクトリなら無視
    return !fs.statSync(path.resolve(dist, fileName.toString())).isDirectory();
  })
  .map(async (fileName) => {
    const absolutePath = path.resolve(dist, fileName.toString());
    const urlPath = path.join('/', fileName.toString());

    const file = fs.readFileSync(absolutePath);

    return {
      path: urlPath,
      contentType: Bun.file(absolutePath).type,
      base64: Buffer.from(file).toString('base64'),
    };
  });
// {path : {contentType,base64}}の形式に成形
const routes = (await Promise.all(promises)).reduce(
  (acc, { path, contentType, base64 }) => {
    acc[path] = { contentType, base64 };
    return acc;
  },
  {}
);
// /の時はindex.htmlと同じ内容を返す
routes['/'] = routes['\\index.html'];
routes["/favicon.ico"] = routes["\\vite.svg"];

// ./routes.jsonを生成
fs.writeFileSync(
  path.resolve(__dirname, 'routes.json'),
  JSON.stringify(routes)
);
