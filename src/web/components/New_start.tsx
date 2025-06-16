
import { ChangeEvent, useState } from "react";
import {auth_process_connection_type} from "@/common/types";
import { useNavigate } from "react-router";
//https://www.npmjs.com/package/react-step-progress 
import StepProgressBar from "react-step-progress";
export const New_start = () => {
    const [id_input,set_id_input] = useState("");
    const [auth_process_connection,set_auth_connection] = useState({} as auth_process_connection_type);
    const navigate = useNavigate();

    window.app.on("start:send_from_main",(_event:any,data:auth_process_connection_type) => {
        set_auth_connection(data);
        console.log(data);
    })
    const submit = () => {
        const send_data:auth_process_connection_type = {
            auth_type:auth_process_connection.auth_type,
            text:id_input
        }
        window.app.send_to_main(send_data);
    }
    // 成功時遷移
    if(auth_process_connection.auth_type === "success"){
        setTimeout(() => navigate("/overlay") ,2000);
    }

    return (
        <div>
        <h1>Start</h1>
        {/* <h1>{auth_process_connection.auth_type}</h1> */}
        {/* <h1>{auth_process_connection.text}</h1> */}
        {(auth_process_connection.auth_type === "credential") &&
            <div>
                <h1>Credential.jsonを選択してください</h1>
                <input type="file"
                // /* @ts-expect-error */
                // webkitdirectory=""
                // /* @ts-expect-error */
                // directory=""
                onChange={async(event: ChangeEvent<HTMLInputElement>) => {
                    const files = event.currentTarget.files;
                    console.log(files);
                    console.log(event.target.files);
                    if(!files || files.length === 0) return;
                    const file = files[0];
                    const file_text = await file.text();
                    const send_data:auth_process_connection_type = {
                        auth_type:auth_process_connection.auth_type,
                        text:file_text
                    }
                    console.log(file.name);
                    window.app.send_to_main(send_data);
                    // window.app.send_to_main(file);
                    // setFile(file);
                }}/>
            </div>
        }
        {
            (auth_process_connection.auth_type === "sheet_id" || auth_process_connection.auth_type === "drive_id") && 
            <div>
                <h1>{auth_process_connection.text}</h1>
                <input type="text" value={id_input} onChange={e => set_id_input(e.target.value)}/>
                <button type="submit" className="btn btn-primary" onClick={submit}>Submit</button>
            </div>
        }
        {
            (auth_process_connection.auth_type === "download_directory") && 
            <div>
                <h1>Google Driveの保存先フォルダを選択してください</h1>
            </div>
        }
        {
            (auth_process_connection.auth_type === "success") && <h1>Success</h1>
        }
        </div>
    );
}