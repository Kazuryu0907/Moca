import {GoogleSpreadsheet} from "google-spreadsheet";
import type {
    GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
    GoogleSpreadsheet as GoogleSpreadsheetType
} from "google-spreadsheet";
import {spreadTeamType as teamNameType} from "../web/components/types";
import * as path from "path";
// `C:\Users\kazum\Desktop\programings\electron\electron-react-ts\src`
require("dotenv").config({path:path.join(String.raw`D:\github\Moca\src`,".env")});

const sheetId = process.env.SHEET_ID;
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

export class TeamType{
  teamName: string = "";
  teamAbbrevitation: string = "";
  playerNames: string[] = [];
  accountIds: string[] = [];
}

export class SheetService{
    doc:GoogleSpreadsheetType;
    sheet:GoogleSpreadsheetWorksheetType | undefined;
    isAuthed: boolean;
    teamData: TeamType[];
    idTable: Record<string,string>;
    teamInfo:teamNameType; 
    constructor(){
        this.doc = new GoogleSpreadsheet(sheetId);
        this.isAuthed = false;
        this.teamData = [];
        this.idTable = {};
        this.teamInfo = {blue:"none",orange:"none",name:"",bo:"",blueMembers:[],orangeMembers:[]};
    }
    hasPrivateKey(){
        return privateKey ? true : false;
    }

    setSheetID(id:string){
        this.doc = new GoogleSpreadsheet(id);
        this.isAuthed = false;
    }
    //auth Run this first.
    async auth(){
        try{
            await this.doc.useServiceAccountAuth({
                client_email: clientEmail ?? "",
                private_key: privateKey ?? "",
            });
            this.isAuthed = true;
        }catch{
            this.isAuthed = false;
        }
        await this.doc.loadInfo();
        return this.isAuthed;
    }

    //thisに残すようにした
    //getStaticTeamが先
    async getTeamName(){
        await this.doc.loadInfo();
        this.sheet = this.doc.sheetsByTitle["進行管理"];
        await this.sheet.loadCells();
        const blueTeam:string = this.sheet.getCellByA1("A3").formattedValue;
        const orangeTeam:string = this.sheet.getCellByA1("C3").formattedValue;
        const matchName:string = this.sheet.getCellByA1("B2").formattedValue;
        const bo:string = this.sheet.getCellByA1("B4").formattedValue;
        // if(!this.teamData.length)await this.getStaticTeam().catch(console.error);
        // //多分自明なはず...
        // console.log(this.teamData);
        const blueMembers = this.teamData.filter(t => t.teamName === blueTeam)[0].playerNames;
        const orangeMembers = this.teamData.filter(t => t.teamName === orangeTeam)[0].playerNames;
        this.teamInfo = {blue:blueTeam,orange:orangeTeam,name:matchName,bo:bo,blueMembers:blueMembers,orangeMembers:orangeMembers};
        return this.teamInfo;
    }
    //thisに残すようにした
    async getStaticTeam(){
        this.sheet = this.doc.sheetsByIndex[0];
        await this.sheet.loadCells();

        let teamData:TeamType[] = [];
        let sheetIndex = 2;
        while(1){
            if(!this.sheet.getCellByA1(`B${sheetIndex}`).formattedValue)break;
            let teamOb:TeamType = new TeamType();
            teamOb.teamName = this.sheet.getCellByA1(`B${sheetIndex}`).formattedValue;
            teamOb.teamAbbrevitation = this.sheet.getCellByA1(`C${sheetIndex}`).formattedValue;
            for(let i = 0;i<3;i++){
                teamOb.playerNames.push(this.sheet.getCellByA1(`D${sheetIndex+i}`).formattedValue);
                teamOb.accountIds.push(this.sheet.getCellByA1(`I${sheetIndex+i}`).formattedValue);
            }
            teamData.push(teamOb);
            sheetIndex += 4;
        }
        this.teamData = teamData;
        this.getIds();
        return teamData;
    }

    getIds(){
        //それぞれ一次元
        const accountIds = this.teamData.map((t) => t.accountIds).flat();
        const vNames = this.teamData.map((t) => t.playerNames).flat();
        for(let i = 0;i < accountIds.length;i++){
            if(accountIds[i] != null)this.idTable[accountIds[i]] = vNames[i];
        }
        return this.idTable;
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

