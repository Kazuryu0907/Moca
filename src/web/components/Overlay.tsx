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


export const Overlay = () => {
  const [props, setProps] = useState<PropsType>({
    isAuthed: undefined,
    inputError: "none",
  });

  window.app.on("gdrive:isAuthed", (_e: any, d: any) => {
    setProps({ ...props, isAuthed: d });
  });

  const onclick = async () => {
    const folderElm = document.getElementById("folder_id") as HTMLInputElement;
    const folderID = folderElm.value as string | undefined;
    //Empty input
    if (!folderID) {setProps({ ...props, inputError: "empty" });return;}
    const folders = await window.app.getDrive(folderID);
    //Error処理だよ
    if(!folders) {setProps({...props,inputError:"error"});return;}
    
    //Successのときだよ
    setProps({...props,inputError:"success"});
    console.log(folders);
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
        />
        {renderFolderIDError(props.inputError)}
      </div>
      <button
        onClick={onclick}
        className="mt-6 py-1 px-2 rounded shadow text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300"
      >
        Update
      </button>
    </div>
  );
};
