import { GoogleSpreadsheet } from 'google-spreadsheet';
import {JWT} from 'google-auth-library';
import type {
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
  GoogleSpreadsheet as GoogleSpreadsheetType
} from 'google-spreadsheet';
import { spreadMatchInfoType as matchInfoType } from '../web/components/types';

export class TeamType {
  teamName: string = '';
  teamAbbreviation: string = '';
  playerNames: string[] = [];
  accountIds: string[] = [];
}

export class SheetService {
  doc: GoogleSpreadsheetType;
  sheet: GoogleSpreadsheetWorksheetType | undefined;
  isAuthorized: boolean;
  teamData: TeamType[];
  idTable: Record<string, string>;
  matchInfo: matchInfoType;
  sheetId: string;
  clientEmail: string;
  privateKey: string;
  serviceAccountAuth: JWT;

  constructor(env: any) {
    this.sheetId = env.SHEET_ID;
    this.clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    this.privateKey = env.GOOGLE_PRIVATE_KEY;
    this.serviceAccountAuth = new JWT({
      email:env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:env.GOOGLE_PRIVATE_KEY,
      scopes:['https://www.googleapis.com/auth/spreadsheets']
    });
    this.doc = new GoogleSpreadsheet(this.sheetId,this.serviceAccountAuth);
    this.isAuthorized = false;
    this.teamData = [];
    this.idTable = {};
    this.matchInfo = { blue: 'none', orange: 'none', name: '', bo: '' };
  }
  hasPrivateKey() {
    return this.privateKey ? true : false;
  }
  /**
   * SheetIDを設定 
   * @param id スプレッドシートID
   * @return void
   */
  setSheetID(id: string) {
    this.doc = new GoogleSpreadsheet(id,this.serviceAccountAuth);
    this.isAuthorized = false;
  }
  
  /**
   * 認証(スプシ読み込み) 
   * @return void
   */
  //auth Run this first
  async auth() {
    await this.doc.loadInfo();
    this.isAuthorized = true;
  }

    /**
   * 全チームの{名前,略称,選手名,アカウントID}を取得 
   * @return void
   */
  //thisに残すようにした
  async loadTeams() {
    this.sheet = this.doc.sheetsByIndex[0];
    console.log(this.sheet.rowCount);
    //15チーム分は取得
    await this.sheet.loadCells(`A1:O${(3 + 1) * 15}`);
    let teamData: TeamType[] = [];
    let sheetIndex = 2;
    let loopCount = 0;
    // ESLintで怒られるから50チーム分取得
    while (loopCount < 50) {
      if (!this.sheet.getCellByA1(`B${sheetIndex}`).formattedValue) break;
      let teamOb: TeamType = new TeamType();
      teamOb.teamName = this.sheet.getCellByA1(`B${sheetIndex}`).formattedValue ?? "";
      teamOb.teamAbbreviation = this.sheet.getCellByA1(
        `C${sheetIndex}`
      ).formattedValue ?? "";
      for (let i = 0; i < 3; i++) {
        teamOb.playerNames.push(
          this.sheet.getCellByA1(`D${sheetIndex + i}`).formattedValue ?? ""
        );
        teamOb.accountIds.push(
          this.sheet.getCellByA1(`I${sheetIndex + i}`).formattedValue ?? ""
        );
      }
      teamData.push(teamOb);
      sheetIndex += 4;
      loopCount++;
    }
    this.teamData = teamData;
  }

  /**
   * 進行管理から試合情報を取得 
   * @return matchInfo
   */
  //thisに残すようにした
  async getMatchInfo() {
    this.sheet = this.doc.sheetsByTitle['進行管理'];
    //最小サイズLoad
    await this.sheet.loadCells('A1:C4');
    const blueTeam: string = this.sheet.getCellByA1('A3').formattedValue ?? "";
    const orangeTeam: string = this.sheet.getCellByA1('C3').formattedValue ?? "";
    const matchName: string = this.sheet.getCellByA1('B2').formattedValue ?? "";
    const bo: string = this.sheet.getCellByA1('B4').formattedValue ?? "";
    this.matchInfo = {
      blue: blueTeam,
      orange: orangeTeam,
      name: matchName,
      bo: bo
    };
    return this.matchInfo;
  }

  get cachedMatchInfo() {
    return this.matchInfo;
  }

   /**
   * アカウントIDとプレイヤー名の対応表を取得 
   * @return idTable
   */ 
  //loadTeamsに依存
  getIds() {
    //それぞれ一次元
    const accountIds = this.teamData.map((t) => t.accountIds).flat();
    const vNames = this.teamData.map((t) => t.playerNames).flat();
    this.idTable = {};
    for (let i = 0; i < accountIds.length; i++) {
      if (accountIds[i] != null) this.idTable[accountIds[i]] = vNames[i];
    }
    return this.idTable;
  }

}
