import {GoogleSpreadsheet} from "google-spreadsheet";
import type {
    GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
    GoogleSpreadsheet as GoogleSpreadsheetType
} from "google-spreadsheet";
import * as path from "path";

require("dotenv").config({path:path.join(String.raw`C:\Users\kazum\Desktop\programings\electron\electron-react-ts\src`,".env")});

const sheetId = process.env.SHEET_ID;
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

export class SheetService{
    doc:GoogleSpreadsheetType;
    sheet:GoogleSpreadsheetWorksheetType | undefined;
    isAuthed: boolean;

    constructor(){
        this.doc = new GoogleSpreadsheet(sheetId);
        this.isAuthed = false;
    }
    //auth Run this first.
    async init(){
        await this.doc.useServiceAccountAuth({
            client_email: clientEmail ?? "",
            private_key: privateKey ?? "",
        }).catch(e => console.warn(e));
        this.isAuthed = true;
        await this.doc.loadInfo();
    }
    async getTeamName(){
        this.sheet = this.doc.sheetsByTitle["進行管理"];
        await this.sheet.loadCells();
        const blueTeam = this.sheet.getCellByA1("A3");
        const orangeTeam = this.sheet.getCellByA1("C3");
        return {blue:blueTeam.formattedValue,orange:orangeTeam.formattedValue};
        // console.log(`blue:${blueTeam.formattedValue} orange:${orangeTeam.formattedValue}`);
    }

    async getTeam(){
        this.sheet = this.doc.sheetsByIndex[0];
        await this.sheet.loadCells();
        let i = 0+2;
        //nullセル何回跨げばbreakするか
        let space = 0;

        let preName = "";
        class TeamType{
            teamName: string = "";
            teamAbbrevitation: string = "";
            playerNames: string[] = [];
            accountIds: string[] = [];
        }
        let teamData:TeamType[] = [];
        let data = new TeamType();

        while(1){
            const name = this.sheet.getCellByA1(`D${i}`).formattedValue;
            //data push(次データ確定時+)
            if(preName === null && name !== null){
                teamData.push(data);
                data = new TeamType();
            }
            if(name !== null){//チーム内
                if(preName === null){//チーム始め
                    data.teamName = this.sheet.getCellByA1(`B${i}`).formattedValue;
                    data.teamAbbrevitation = this.sheet.getCellByA1(`C${i}`).formattedValue;
                }
                data.playerNames.push(name);
                data.accountIds.push(this.sheet.getCellByA1(`I${i}`).formattedValue);
            }
            //チームの最後の行
            if(name === null)space++;
            else space = 0;
            if(space === 2){
                //最後の1つ
                teamData.push(data);
                break;
            }
            preName = name;
            i++;
        }
        console.log(teamData);
    }
}
if(require.main === module){
    const ss = new SheetService();
    ss.init().then(_ => ss.getTeam());
}
