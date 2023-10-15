import {GoogleSpreadsheet} from "google-spreadsheet";
import type {
    GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
    GoogleSpreadsheet as GoogleSpreadsheetType
} from "google-spreadsheet";
import {spreadMatchInfoType as matchInfoType} from "../web/components/types";

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
    matchInfo:matchInfoType; 
    sheetId:string;
    clientEmail:string;
    privateKey:string;

    constructor(env:any){
        this.sheetId = env.SHEET_ID;
        this.clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        this.privateKey = env.GOOGLE_PRIVATE_KEY;

        this.doc = new GoogleSpreadsheet(this.sheetId);
        this.isAuthed = false;
        this.teamData = [];
        this.idTable = {};
        this.matchInfo = {blue:"none",orange:"none",name:"",bo:""};
    }
    hasPrivateKey(){
        return this.privateKey ? true : false;
    }

    setSheetID(id:string){
        this.doc = new GoogleSpreadsheet(id);
        this.isAuthed = false;
    }
    //auth Run this first.
    async auth(){
        try{
            await this.doc.useServiceAccountAuth({
                client_email: this.clientEmail ?? "",
                private_key: this.privateKey ?? "",
            });
            this.isAuthed = true;
        }catch{
            this.isAuthed = false;
        }
        await this.doc.loadInfo();
        return this.isAuthed;
    }

    //thisに残すようにした
    async loadTeams(){
        this.sheet = this.doc.sheetsByIndex[0];
        console.log(this.sheet.rowCount);
        //15チーム分は取得
        await this.sheet.loadCells(`A1:O${(3+1)*15}`);
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
    }

    //thisに残すようにした
    async getMatchInfo(){
        this.sheet = this.doc.sheetsByTitle["進行管理"];
        //最小サイズLoad
        await this.sheet.loadCells("A1:C4");
        const blueTeam:string = this.sheet.getCellByA1("A3").formattedValue;
        const orangeTeam:string = this.sheet.getCellByA1("C3").formattedValue;
        const matchName:string = this.sheet.getCellByA1("B2").formattedValue;
        const bo:string = this.sheet.getCellByA1("B4").formattedValue;
        this.matchInfo = {blue:blueTeam,orange:orangeTeam,name:matchName,bo:bo};
        return this.matchInfo;
    }

    //loadTeamsに依存
    getIds(){
        //それぞれ一次元
        const accountIds = this.teamData.map((t) => t.accountIds).flat();
        const vNames = this.teamData.map((t) => t.playerNames).flat();
        this.idTable = {};
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

