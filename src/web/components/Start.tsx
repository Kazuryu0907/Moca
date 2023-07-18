import { Component, useEffect, useMemo, useState } from "react";

type stateType = "loading" | "success" | "fail";

type propsType = {
    spread:stateType;
    drive:stateType;
    errorText:String;
};


export const Start = () => {
    const [envStatus,setEnvStatus] = useState<propsType>({spread:"loading",drive:"loading",errorText:""});
    const onload = async () => {
        const [spreadId,driveId] = await Promise.all([window.app.SPREADSHEET_ID(),window.app.GOOGLEDRIVE_ID()]);
        if(spreadId == null)setEnvStatus({...envStatus,spread:"fail",errorText:"spreadID is null!"});
        if(driveId == null)setEnvStatus({...envStatus,drive:"fail",errorText:"driveID is null!"});
        if(spreadId == null || driveId == null)return;
        console.log(spreadId,driveId);

        await window.app.setSheetID(spreadId);
        let res = await window.app.spreadAuth();
        //Auth失敗
        if(res == false){
            setEnvStatus({...envStatus,spread:"fail",errorText:"spread auth has failed!"});
            return;
        }
        //driveのフォルダーID失敗時
        res = await window.app.driveAuth(driveId);
        if(res == false){
            setEnvStatus({...envStatus,drive:"fail",errorText:"drive auth has failed!"});
            return;
        }
        //Success時
        setEnvStatus({...envStatus,spread:"success",drive:"success"});

        
    }
    useMemo(onload,[]);
    return (
        <div>
            {envStatus.spread}<br/>
            {envStatus.drive}<br/>
            {envStatus.errorText}
        </div>
    )
}