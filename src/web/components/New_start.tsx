
import { FC,ChangeEvent, useEffect, useMemo, useState } from "react";
import {auth_process_connection_type} from "@/common/types";
export const New_start:FC = () => {
    const [id_input,set_id_input] = useState("");
    const [auth_type,set_auth_type] = useState("" as auth_process_connection_type["auth_type"] | "");
    window.app.on("start:send_from_main",(_event,value:auth_process_connection_type["auth_type"]) => {
        set_auth_type(value);
        console.log(value);
    })
    const submit = () => {
        if(auth_type === "")return;
        const send_data:auth_process_connection_type = {
            auth_type:auth_type,
            text:id_input
        }
        window.app.send_to_main(send_data);
    }

    return (
        <div>
        <h1>Start</h1>
        <h1>{auth_type}</h1>
        {(auth_type === "credential") &&
        <input type="file" accept=".json" onChange={async(event: ChangeEvent<HTMLInputElement>) => {
            const files = event.currentTarget.files;
            if(!files || files.length === 0) return;
            const file = files[0];
            const file_text = await file.text();
            const send_data:auth_process_connection_type = {
                auth_type:auth_type,
                text:file_text
            }
            console.log(file.name);
            window.app.send_to_main(send_data);
            // window.app.send_to_main(file);
            // setFile(file);
        }}/>
        }
        {
            (auth_type === "sheet_id" || auth_type === "drive_id") && 
            <div>
                <input type="text" value={id_input} onChange={e => set_id_input(e.target.value)}/>
                <button type="submit" className="btn btn-primary" onClick={submit}>Submit</button>
            </div>
        }
        </div>
    );
}