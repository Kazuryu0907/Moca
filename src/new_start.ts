import { SheetService,sheet_credential_type } from "./api/spread"
import { DriveService,drive_credential_type } from "./api/gdrive"

import {existsSync,mkdirSync,readFileSync,writeFileSync} from "fs"
import {join} from "path";





const sheet_service = new SheetService();
const drive_service = new DriveService();

const env_base_path = "./env";
const sheet_credential_path = "./sheet_credential.json";
const drive_credential_path = "./drive_credential.json";

// console.log(existsSync(join(env_base_path,sheet_credential_path)));
// writeFileSync(join(env_base_path,sheet_credential_path),"{}");
// writeFileSync(join(env_base_path,drive_credential_path),"{}");

function is_exit_credentials(
    full_sheet_credential_path:string,
    full_drive_credential_path:string):{sheet:boolean,drive:boolean} {
    return {
        sheet:existsSync(full_sheet_credential_path),
        drive:existsSync(full_drive_credential_path)
    };
}

const full_sheet_credential_path = join(process.cwd(),env_base_path,sheet_credential_path);
const full_drive_credential_path = join(process.cwd(),env_base_path,drive_credential_path);

const exit_res = is_exit_credentials(full_sheet_credential_path,full_drive_credential_path);
console.log(exit_res);

// 存在しなかったときと，認証できなかった時の処理は単一化する
if(!exit_res.sheet){
    console.log("sheet credential is not found");
}
if(!exit_res.drive){
    console.log("drive credential is not found");
}

// 認証process

function read_sheet_credential(full_sheet_credential_path:string):sheet_credential_type{
    // TODO parseとkeyのエラーハンドリング
    const data = readFileSync(full_sheet_credential_path).toString();
    const json = JSON.parse(data);
    return {
        client_email:json.client_email,
        private_key:json.private_key
    };
}

// 対称性を持たせるためだけのmethod
function read_drive_credential(full_drive_credential_path:string):drive_credential_type{
    return {
        credential_full_path:full_drive_credential_path
    };
}

const sheet_credential = read_sheet_credential(full_sheet_credential_path);
const drive_credential = read_drive_credential(full_drive_credential_path);

(async () => {
    await sheet_service.auth(sheet_credential);
    drive_service.auth(drive_credential);
    // await sheet_service.loadTeams();
    // console.log(sheet_service.teamData);
    // console.log(drive_service.clientCheck("196WPHkI1H6TpBsyuhR3jaqDgrYmF9Io-"))
})();