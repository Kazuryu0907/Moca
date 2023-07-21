import {useState} from "react";
import {BrowserWindow} from "electron"; 
import { SheetService } from "./spread";
import { DriveService } from "./gdrive";

type stateType = "loading" | "success" | "fail" | "none";

type propsType = {
  env:stateType;
  auth:stateType;
  fetch:stateType;
  errorText: String;
};


export const start = async (ss:SheetService,ds:DriveService,mainWindow:BrowserWindow) => {
    //only run once!
    const spreadId = process.env.SPREADSHEET_ID;
    const driveId = process.env.GOOGLEDRIVE_ID;
    let envStatus:propsType = {env:"loading",auth:"none",fetch:"none",errorText:""};
    const setEnvStatus = (props:propsType) => {
        console.log(props);
        envStatus = {...props};
        mainWindow.webContents.on('did-finish-load', ()=>mainWindow.webContents.send("startStepper",props)
        );
    }
    
    if (spreadId == null) {
      setEnvStatus({
        ...envStatus,
        env:"fail",
        errorText: "spreadID is null!",
      });
    }
    if (driveId == null) {
      setEnvStatus({
        ...envStatus,
        env:"fail",
        errorText: "driveID is null!",
      });
    }
    if (spreadId == null || driveId == null) return;
    setEnvStatus({...envStatus,env:"success",auth:"loading"});
    ss.setSheetID(spreadId);
    let res = await ss.auth().catch((e) =>{
        console.log(e);
        return false;
      })
    //Auth失敗
    if (res === false) {
      setEnvStatus({
        ...envStatus,
        auth:"fail",
        errorText: "spread auth has failed!",
      });
      return;
    }
    //driveのフォルダーID失敗時
    res = await ds.clientCheck(driveId).catch((e) => {
        console.log(e);
        return false;
      });
    if (res === false) {
      setEnvStatus({
        ...envStatus,
        auth: "fail",
        errorText: "drive auth has failed!",
      });
      return;
    }
    //Success時
    setEnvStatus({ ...envStatus, auth: "success",fetch:"loading" });

    //first get data
    //spread

    const teamInfo = await ss.getStaticTeam();
    const matchInfo = await ss.getTeamName();
    const idTable = ss.getIds();
    //Succes!
    setEnvStatus({...envStatus,fetch:"success"});
  };