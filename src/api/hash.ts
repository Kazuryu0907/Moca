import * as fs from "fs";
import * as path from "path";

import {createHash} from "crypto";
import { PathLike } from "fs";

interface GlobType {
    name: string,
    dir: PathLike
}

export interface HashType{
    name: string,
    id?: string,
    dir?: PathLike,
    hash:string,
}

//classじゃなくて，getHashesFromFolderだけexportしたほうがいい？
    //calc md5 hash using stream.
function md5(filePath:PathLike) : Promise<string>{
    return new Promise((resolve,reject) => {
        let readStream = fs.createReadStream(filePath);
        let md5hash = createHash("md5");
        md5hash.setEncoding("hex");
        readStream.pipe(md5hash);
        readStream.on("end",() => {
            resolve(md5hash.read());
        });
        readStream.on("error",(e) => {
            reject(e);
        });
    })
}

    //glob（再帰なし）
function glob(filePath:PathLike,patt:RegExp) {
    let filesArray:GlobType[] = [];
    const files = fs.readdirSync(filePath,{withFileTypes:true,encoding:"utf-8"});
    files.forEach(f => {
        if(f.isFile() && patt.test(f.name))filesArray.push({name:f.name,dir:path.join(filePath.toString(),f.name)});
        // else if(f.isDirectory())filesArray.push(glob(path.join(filePath,f.name),patt));
    });
    return filesArray;
}


//glob (再帰あり)
function glob2(filePath:string,patt:RegExp) {
    let filesArray:string[] = [];
    const files = fs.readdirSync(filePath,{withFileTypes:true,encoding:"utf-8"});
    files.forEach(f => {
        if(f.isFile() && patt.test(f.name)){
            filesArray.push(path.join(filePath.toString(),f.name));
        }else if(f.isDirectory()){
            const p = path.join(filePath,f.name)
            filesArray.push(...glob2(p,patt));
        }
    });
    return filesArray.flat();
}

    //run this.
export async function getHashesFromFolder(filePath:string,patt:RegExp){
    const filesArray = glob2(filePath,patt);
    const hashesPromis = filesArray.map(f => md5(f));
    const hashes = await Promise.all(hashesPromis);
    let id2HashTable = new Map<string,string>();
    //ファイル名 to hash
    hashes.map((h,i) => id2HashTable.set(path.basename(filesArray[i]),h));
    return id2HashTable;
}

if(require.main === module){
    console.log(glob2(String.raw`C:\Users\kazum\Desktop\programings\GBC_dev\graphics`,/.*\.(jpg|png)$/));
}
