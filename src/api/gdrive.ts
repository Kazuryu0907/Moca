import { readFile, writeFile } from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import { authenticate } from "./local_auth";
import { google, drive_v3 } from "googleapis";
import { BrowserWindow } from "electron";
import { OAuth2Client } from "googleapis-common";

import { getHashesFromFolder, HashType } from "./hash";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TOKEN_PATH = path.resolve(__dirname, "./../src", "token.json");
const CREDENTIAL_PATH = path.resolve(__dirname, "./../src", "credentials.json");

export class DriveService {
  drive: drive_v3.Drive | undefined;
  isAuthed: boolean = false;
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.drive = undefined;
  }
  /*
    init this class. Run this function first.
    */
  async init() {
    const client: any = await this.authorize();

    if (client) {
      this.isAuthed = true;
      this.mainWindow.webContents.on("did-finish-load", () => {
        this.mainWindow.webContents.send("gdrive:isAuthed", true);
      });
    } else {
      this.mainWindow.webContents.on("did-finish-load", () => {
        this.mainWindow.webContents.send("gdrive:isAuthed", false);
      });
    }
    this.drive = client
      ? google.drive({ version: "v3", auth: client })
      : undefined;
  }
  /*
        load saved credentials if exitst.

        return:
            JSONClient or null
    */
  async loadSavedCredentialsIfExist() {
    try {
      const token = await readFile(TOKEN_PATH, "utf8");
      const credentials = JSON.parse(token);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  async saveCredentials(client: OAuth2Client) {
    const credentials = await readFile(CREDENTIAL_PATH, "utf-8");
    const keys = JSON.parse(credentials);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await writeFile(TOKEN_PATH, payload);
  }

  async authorize() {
    let loadedClient = await this.loadSavedCredentialsIfExist();
    this.isAuthed = true;
    this.mainWindow?.webContents.send("gdrive:isAuthed", this.isAuthed);
    if (loadedClient) {
      return loadedClient;
    }
    console.log(CREDENTIAL_PATH);
    let client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIAL_PATH,
    });
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
  }

  //再帰なし
  async filesFromFolderID(folderID: string, base = "") {
    //フォルダ特定
    //and mimeType != 'application/vnd.google-apps.folder'
    //\'${folderID}\' in parents and
    type globType = {
      dir: string;
      files: drive_v3.Schema$File[] | globType[];
    };
    let filesArray: globType[] = [];
    const params: drive_v3.Params$Resource$Files$List = {
      //フォルダ除外
      q: `\'${folderID}\' in parents and trashed = false`,
      fields:
        "nextPageToken,files(kind,mimeType,id,name,modifiedTime,md5Checksum)",
    };
    if (this.drive === undefined) return [];
    const res = await this.drive.files.list(params);
    const files = res.data.files?.filter(
      (f) => f.mimeType !== "application/vnd.google-apps.folder"
    );
    //確定したのを格納
    if (files) filesArray.push({ dir: base, files: files });
    const folders = res.data.files?.filter(
      (f) => f.mimeType === "application/vnd.google-apps.folder"
    );
    if (folders) {
      for (const f of folders) {
        if (f.id && f.name) {
          const dir = base + "/" + f.name;
          //再帰
          const subFiles = await this.filesFromFolderID(f.id, dir);
          
          if (subFiles) filesArray.push(...subFiles);
        }
      }
    }
    return filesArray.flat();
  }

  async downloadFileFromID(fileId: string, outName: string) {
    //DL用に alt=media
    const params: drive_v3.Params$Resource$Files$Get = {
      fileId: fileId,
      alt: "media",
    };
    if (this.drive === undefined) return;
    //streamでbuffer溢れに対応
    const res = await this.drive.files.get(params, { responseType: "stream" });
    const dest = fs.createWriteStream(outName, "utf8");
    res.data.on("data", (chunk) => dest.write(chunk));
    res.data.on("end", () => dest.end());
  }

  getHash(files: drive_v3.Schema$File[] | undefined) {
    if (files === undefined) return [];
    //drive_v3.Schema$File[]からHashType[]へ変換
    else
      return files.map((d) => {
        let h: HashType = {
          id: d?.id ?? "",
          name: d?.name ?? "",
          hash: d?.md5Checksum ?? "",
        };
        return h;
      });
  }
  //
  getmodifiedTime(files: drive_v3.Schema$File[] | undefined) {
    if (files === undefined) return [];
    else
      return files.map((d) => {
        return { id: d.id, name: d.name, modifiedTime: d.modifiedTime };
      });
  }
}

// if(require.main === module)(async ()=>{
//     const FOLDER_ID = "1ztwAvNoRlXkou-GuAUaqBWM69bW_Z771";
//     // const FOLDER_ID = "1z-o8afoaVzdJXgbuaoNBxxkTDT1TF0Q8";
//     const SAVE_DIR = "./graphics";

//     const ds = new DriveService();await ds.init();
//     const dsFiles = await ds.filesFromFolderID(FOLDER_ID);
//     console.log(dsFiles);
//     // const dsHashes = ds.getHash(dsFiles);

//     // const localHashes = await getHashesFromFolder(SAVE_DIR,/.*\.jpg$/);
//     // if(dsFiles === undefined)return;
//     // const diffFiles = dsHashes.filter(f => f.hash !== localHashes.get(f.name));
//     // console.log(diffFiles);
//     // diffFiles.forEach(f => {
//     //     if(f.id === undefined)return;
//     //     // ds.downloadFileFromID(f.id,path.join(SAVE_DIR,f.name));
//     // })

//     // console.log(await md5("./41.jpg") === f?.hash);
//     // if(files)ds.downloadFileFromID(f!.id ?? "",f!.name ?? "")
// })();
