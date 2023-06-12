import { FC, useEffect, useState } from "react";
import { Loading, Checked } from "./Loading";

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

const folderIDError = (msg:string) => {
  return (
    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
      {msg}
    </p>
  );
};

type isAuthedType = boolean | undefined;
type InputErrorType = "none" | "empty" | "error" | "success";

type PropsType = {
  isAuthed: isAuthedType;
  inputError: InputErrorType;
  isLoading : boolean
};

const renderAuthStatus = (isAuthed: isAuthedType) => {
  if (isAuthed === undefined) return loading();
  if (isAuthed) return authed();
  else return authFailed();
};

const renderFolderIDError = (inputError:InputErrorType) => {
  if(inputError === "none")return false;
  if(inputError === "empty")return folderIDError("Field is Empty!");
  if(inputError === "error")return folderIDError("Folder ID Error!");
  if(inputError === "success")return(<p className="mt-2 text-sm text-green-600">Well Done!</p>);
}

//function conponentのほうがいいかお gdrive:isAuthedが複数セットされる
export const Overlay = () => {
  const [props, setProps] = useState<PropsType>({
    isAuthed: undefined,
    inputError: "none",
    isLoading: false
  });

  window.app.on("gdrive:isAuthed", (_e: any, d: any) => {
    setProps({ ...props, isAuthed: d });
  });

  type DriveFileType = {
    id:string,
    kind:string,
    md5Checksum:string,
    mimeType:string,
    modifiedTime:string,
    name:string,
  };

  const calcFilesDiff = (drive:DriveFileType[],localFiles:Map<string,string>):[string[],string[],Map<string,string>] => {
    let diffPlusFiles = drive.filter(d => !localFiles.has(d.name)).map(d => d.name);
    //local && drive
    const existedFiles = drive.filter(d => localFiles.has(d.name));
    //ハッシュが違うname取得
    const changedHashes = existedFiles.filter(d => d.md5Checksum !== localFiles.get(d.name)).map(d => d.name);
    //name => idテーブル
    let name2IdTable:Map<string,string> = new Map();
    drive.map(d => name2IdTable.set(d.name,d.id));
    //drive && localFiles(ベン図) からname取り出したやつ
    const localAndDriveNames = drive.filter(d => localFiles.has(d.name)).map(d => d.name);
    //localFilesと↑のdiff（計算済み）
    const diffMinusFiles = Array.from(localFiles.keys()).filter(lf => localAndDriveNames.indexOf(lf) === -1);
 
    diffPlusFiles = diffPlusFiles.concat(changedHashes);
    return [diffPlusFiles,diffMinusFiles,name2IdTable];
  }

  const onclick = async () => {
    //Loading表示
    setProps({...props,isLoading:true});
    const folderElm = document.getElementById("folder_id") as HTMLInputElement;
    const folderID = folderElm.value as string | undefined;
    //Empty input
    if (!folderID) {setProps({ ...props, inputError: "empty" ,isLoading:false});return;}
    const folders = await window.app.getDrive(folderID);
    //Error処理だよ
    if(!folders) {setProps({...props,inputError:"error",isLoading:false});return;}
    
    //Successのときだよ
    setProps({...props,inputError:"success",isLoading:false});
    //localFileh取得するよ
    //Error処理しつぉいて console.errorのところを独自関数にして，pタグとかで表示させるのはどうでしょう
    const localFiles = await window.app.glob().catch(console.error);
    //Diff計算するよ
    const [diffPlusFiles,diffMinusFiles,name2IdTable] = calcFilesDiff(folders,localFiles);
    console.log(diffPlusFiles,diffMinusFiles);
    diffPlusFiles.forEach(async fileName => {//[]じゃなかったらDL
      const path = await window.app.path_join(String.raw`C:\Users\kazum\Desktop\programings\GBC_dev\graphics\images`,fileName);
      const id = name2IdTable.get(fileName);
      await window.app.download([id,path]);
    })
    diffMinusFiles.forEach(async fileName => {//[]じゃなかったらrm
      const path = await window.app.path_join(String.raw`C:\Users\kazum\Desktop\programings\GBC_dev\graphics\images`,fileName);
      window.app.removeFile(path);
    });
  };

  return (
    <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        Overlay Element Update from Google-Drive
      </h5>
      {renderAuthStatus(props.isAuthed)}
      <div>
        <label
          className="block mt-5 text-sm font-medium text-gray-900"
          htmlFor="folder_id"
        >
          FolderID
        </label>
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 mt-2"
          type="text"
          id="folder_id"
          placeholder="1OzMEBHzkxbodHRL2rRVopIEh2B0c1JJu"
          defaultValue="1ztwAvNoRlXkou-GuAUaqBWM69bW_Z771"
        />
        {renderFolderIDError(props.inputError)}
      </div>
      <div className="flex">
      <button
        onClick={onclick}
        className="mt-6 py-1 px-2 rounded shadow text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
      >
        Update
      </button>
        {props.isLoading && <Loading css="ml-4 mt-7 w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"/>}
      </div>
    </div>
  );
};
