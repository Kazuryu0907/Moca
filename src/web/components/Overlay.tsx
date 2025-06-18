import React, { useState } from "react";
import { Checked, Loading } from "./Loading";
import { gdriveFile, gdriveGlobType, localGlobType } from "./types";

// import {} from "@heroicons/react/solid";
const loading = () => {
  return (
    <div className="flex mt-3">
      <p className="font-semibold  text-gray-600">GoogleDrive Authing...</p>
      <div className="mt-1 ml-3">
        <Loading css="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
      </div>
    </div>
  );
};

const authFailed = () => {
  return (
    <div className="flex mt-3">
      <p className="font-semibold  text-gray-600">GoogleDrive Auth Error...</p>
      <div role="status" className="mt-1 ml-3">
        <svg
          className="w-5 h-5 mr-2 text-red-500 font-bold"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>

        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};
const authed = () => {
  return (
    <div className="flex mt-3">
      <p className="font-semibold  text-gray-600">GoogleDrive Authed!</p>
      <div className="mt-1 ml-3">
        <Checked css="w-5 h-5 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0" />
      </div>
    </div>
  );
};

const folderIDError = (msg: string) => {
  return <p className="mt-2 text-sm text-red-600 dark:text-red-500">{msg}</p>;
};

const renderDiffFiles = (fileName: string, color: "green" | "red") => {
  const gProps = "text-green-800";
  const rProps = "text-red-800";
  const props = color === "green" ? gProps : rProps;
  return (
    <p className={props + " font-bold ml-2 my-1"} key={fileName}>
      {fileName}
    </p>
  );
};

type isAuthedType = boolean | undefined;
type InputErrorType = "none" | "empty" | "error" | "success";

type PropsType = {
  isAuthed: isAuthedType;
  inputError: InputErrorType;
  isLoading: boolean;
};

const renderAuthStatus = (isAuthed: isAuthedType) => {
  if (isAuthed === undefined) return loading();
  if (isAuthed) return authed();
  else return authFailed();
};

const renderFolderIDError = (inputError: InputErrorType) => {
  if (inputError === "none") return false;
  if (inputError === "empty") return folderIDError("Field is Empty!");
  if (inputError === "error") return folderIDError("Folder ID Error!");
  if (inputError === "success") {
    return <p className="mt-2 text-sm text-green-600">Well Done!</p>;
  }
};

const calcFilesDiff = (
  drive: gdriveFile[],
  localFiles: Map<string, string>,
): [string[], string[], Map<string, string>] => {
  let diffPlusFiles = drive.filter((d) => !localFiles.has(d.name)).map((d) => d.name);
  // local && drive
  const existedFiles = drive.filter((d) => localFiles.has(d.name));
  // ハッシュが違うname取得
  const changedHashes = existedFiles.filter((d) => d.md5Checksum !== localFiles.get(d.name)).map((d) => d.name);
  // name => idテーブル
  const name2IdTable: Map<string, string> = new Map();
  drive.map((d) => name2IdTable.set(d.name, d.id));
  // drive && localFiles(ベン図) からname取り出したやつ
  const localAndDriveNames = drive.filter((d) => localFiles.has(d.name)).map((d) => d.name);
  // localFilesと↑のdiff（計算済み）
  const diffMinusFiles = Array.from(localFiles.keys()).filter(lf => localAndDriveNames.indexOf(lf) === -1);
  diffPlusFiles = diffPlusFiles.concat(changedHashes);
  return [diffPlusFiles, diffMinusFiles, name2IdTable];
};

// function componentのほうがいいかお gdrive:isAuthedが複数セットされる
export const Overlay = () => {
  const [props, setProps] = useState<PropsType>({
    isAuthed: true,
    inputError: "none",
    isLoading: false,
  });
  const [diffPlusState, setDiffPlusState] = useState<string[]>([]);
  const [diffMinusState, setDiffMinusState] = useState<string[]>([]);

  const onclick = async () => {
    // Loading表示
    setProps({ ...props, isLoading: true });
    // const folderElm = document.getElementById("folder_id") as HTMLInputElement;
    // const folderID = folderElm.value as string | undefined;
    const folderID = await window.app.GOOGLEDRIVE_ID();
    // Empty input
    if (!folderID) {
      setProps({ ...props, inputError: "empty", isLoading: false });
      return;
    }
    const gdriveFolders: gdriveGlobType[] = await window.app.getDrive(folderID);
    console.log("getDrive");
    console.log(gdriveFolders);
    // Error処理だよ
    if (!gdriveFolders) {
      setProps({ ...props, inputError: "error", isLoading: false });
      return;
    }

    // Successのときだよ
    setProps({ ...props, inputError: "success", isLoading: false });
    // localFileh取得するよ
    // Error処理しつぉいて console.errorのところを独自関数にして，pタグとかで表示させるのはどうでしょう
    // これは再帰あり
    const localFiles: localGlobType[] = await window.app.glob().catch(console.error);
    console.log("glob");
    console.log(localFiles);
    const downloadPromise: Promise<any>[] = [];
    const removePromise: Promise<void>[] = [];
    const allDiffPlusFiles: string[] = [];
    const allDiffMinusFiles: string[] = [];
    const graphicsPath = await window.app.graphicsDir();
    // Diff計算するよ
    for (const dg of gdriveFolders) {
      let map: Map<string, string>;
      const dir = dg.dir;
      const local = localFiles.filter(f => f.dir === dir);

      if (local.length > 0) { // 存在したら
        map = local[0].map;
      } else { // localにフォルダが存在しなかったら
        const dirPath = await window.app.path_join(graphicsPath, dir);
        // ファイル作成
        await window.app.mkdir(dirPath);
        // 空Map
        map = new Map<string, string>();
      }

      const [diffPlusFiles, diffMinusFiles, name2IdTable] = calcFilesDiff(dg.files, map);
      // Display用
      // to Relative Path
      allDiffPlusFiles.push(...diffPlusFiles.map(name => `${dir}/${name}`));
      allDiffMinusFiles.push(...diffMinusFiles.map(name => `${dir}/${name}`));
      // -----------Plus
      diffPlusFiles.forEach(async fileName => {
        const savePath = await window.app.path_join(graphicsPath, dir, fileName);
        const id = name2IdTable.get(fileName);
        // DLのPromiseをArrayに入れる
        downloadPromise.push(window.app.download([id, savePath]));
      });
      // ----------Minus
      diffMinusFiles.forEach(async fileName => {
        const graphicsPath = await window.app.graphicsDir();
        const rmPath = await window.app.path_join(graphicsPath, dir, fileName);
        removePromise.push(window.app.removeFile(rmPath));
      });
    }
    // 並列処理
    await Promise.all(downloadPromise);
    await Promise.all(removePromise);

    // state更新
    setDiffPlusState(allDiffPlusFiles);
    setDiffMinusState(allDiffMinusFiles);
  };

  return (
    <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        Overlay Element Update from Google-Drive
      </h5>
      {renderAuthStatus(props.isAuthed)}
      <div>
        {renderFolderIDError(props.inputError)}
      </div>
      <div className="flex">
        <button
          onClick={onclick}
          className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
        >
          Update
        </button>
        {props.isLoading && (
          <Loading css="ml-4 mt-7 w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />
        )}
      </div>
      <div className="mt-5 grid  grid-cols-2 gap-2">
        <div>
          <div className="text-center text-green-600 font-bold">
            <p>Downloaded Files</p>
            <p>{`+${diffPlusState.length} files`}</p>
          </div>
          <div className="bg-green-100 border-green-400 overflow-y-auto mt-1 ml-1 max-w-sm border rounded-lg h-28">
            {diffPlusState.map((fileName) => renderDiffFiles(fileName, "green"))}
          </div>
        </div>
        <div>
          <div className="text-center text-red-600 font-bold">
            <p>Removed LocalFiles</p>
            <p>{`-${diffMinusState.length} files`}</p>
          </div>
          <div className="bg-red-100  border-red-400 overflow-y-auto mt-1 rm-1 max-w-sm border rounded-lg h-28">
            {diffMinusState.map((fileName) => renderDiffFiles(fileName, "red"))}
          </div>
        </div>
      </div>
    </div>
  );
};
