import * as fs from 'fs';
import * as path from 'path';

import { createHash } from 'crypto';
import { PathLike } from 'fs';

//classじゃなくて，getHashesFromFolderだけexportしたほうがいい？
//calc md5 hash using stream.
function md5(filePath: PathLike): Promise<string> {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);
    const md5hash = createHash('md5');
    md5hash.setEncoding('hex');
    readStream.pipe(md5hash);
    readStream.on('end', () => {
      resolve(md5hash.read());
    });
    readStream.on('error', (e) => {
      reject(e);
    });
  });
}

type globType = {
  dir: string;
  files: string[];
};

//glob (再帰あり)
function glob2(filePath: string, patt: RegExp, base = '') {
  const filesArray: globType[] = [];
  const dir = fs.readdirSync(filePath, {
    withFileTypes: true,
    encoding: 'utf-8'
  });
  const files = dir.filter((f) => f.isFile()).filter((f) => patt.test(f.name));
  const folders = dir.filter((f) => f.isDirectory());
  //確定したのを格納
  if (files) filesArray.push({ dir: base, files: files.map((f) => f.name) });
  //再帰
  if (folders) {
    for (const f of folders) {
      const dir = base + '/' + f.name;
      const subFiles = glob2(path.join(filePath, f.name), patt, dir);
      if (subFiles) filesArray.push(...subFiles);
    }
  }

  return filesArray.flat();
}

//HashesFromFolder Type
export type HFFType = {
  dir: string;
  map: Map<string, string>;
};
//run this.
export async function getHashesFromFolder(basePath: string, patt: RegExp) {
  const filesArray = glob2(basePath, patt);
  const outArray: HFFType[] = [];
  for (const files of filesArray) {
    const fileHashMap = new Map<string, string>();
    for (const f of files.files) {
      const fullPath = path.join(basePath, files.dir, f);
      const hash = await md5(fullPath);
      //file名 to hash
      fileHashMap.set(f, hash);
    }
    outArray.push({ dir: files.dir, map: fileHashMap });
  }
  return outArray;
}

if (require.main === module) {
  console.log(
    glob2(
      String.raw`C:\Users\kazum\Desktop\programings\GBC_dev\graphics`,
      /.*\.(jpg|png)$/
    )
  );
}
