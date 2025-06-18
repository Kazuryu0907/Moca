import { WsOnConnectionType } from "@/common/types";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";
import type {
  GoogleSpreadsheet as GoogleSpreadsheetType,
  GoogleSpreadsheetWorksheet as GoogleSpreadsheetWorksheetType,
} from "google-spreadsheet";
import { spreadMatchInfoType as matchInfoType } from "../web/components/types";

export class TeamType {
  teamName: string = "";
  teamAbbreviation: string = "";
  playerNames: string[] = [];
  accountIds: string[] = [];
}

export type SheetCredentialType = {
  client_email: string;
  private_key: string;
};

const DUMMY_SHEET_ID = "1WNHOaQjfulA5KJzUqcOYM4w5UNDy2YJ9c9mWUGMqitc";
export class SheetService {
  doc: GoogleSpreadsheetType | undefined;
  sheet: GoogleSpreadsheetWorksheetType | undefined;
  isAuthorized: boolean;
  teamData: TeamType[];
  idTable: Record<string, string>;
  matchInfo: matchInfoType;
  sheetId: string;
  client_email: string;
  private_key: string;
  serviceAccountAuth: JWT;

  constructor() {
    // this.sheetId = env.SHEET_ID;
    this.doc = undefined;
    this.sheetId = DUMMY_SHEET_ID;
    this.client_email = "";
    this.private_key = "";
    this.serviceAccountAuth = new JWT();
    this.isAuthorized = false;
    this.teamData = [];
    this.idTable = {};
    this.matchInfo = { blue: "none", orange: "none", name: "", bo: "" };
  }
  /**
   * 認証(スプシ読み込み)
   * @return void
   */
  // auth Run this first
  async auth({ client_email, private_key }: SheetCredentialType) {
    this.client_email = client_email;
    this.private_key = private_key;
    this.serviceAccountAuth = new JWT({
      email: this.client_email,
      key: this.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.doc = new GoogleSpreadsheet(this.sheetId, this.serviceAccountAuth);
    await this.doc.loadInfo();
    this.isAuthorized = true;
  }
  // ? What is that?
  hasPrivateKey() {
    return this.private_key ? true : false;
  }
  /**
   * SheetIDを設定
   * @param id スプレッドシートID
   * @return void
   */
  async setSheetID(id: string) {
    this.doc = new GoogleSpreadsheet(id, this.serviceAccountAuth);
    // this.isAuthorized = false;
    await this.doc.loadInfo();
  }

  // ws接続時にこれを送りつける
  create_onConnection_function() {
    const func: WsOnConnectionType = (ws) => {
      ws.send(JSON.stringify({ cmd: "idTable", data: this.idTable }));
      ws.send(JSON.stringify({ cmd: "teamData", data: this.teamData }));
      ws.send(JSON.stringify({ cmd: "matchInfo", data: this.matchInfo }));
    };
    return func;
  }

  /**
   * 全チームの{名前,略称,選手名,アカウントID}を取得
   * @return void
   */
  // thisに残すようにした
  async loadTeams() {
    if (!this.doc) throw new Error("run auth first");
    this.sheet = this.doc.sheetsByTitle["エントリー一覧/管理表"];
    // console.log(this.sheet.rowCount);
    // 15チーム分は取得
    await this.sheet.loadCells(`A1:O${(3 + 1) * 15}`);
    const teamData: TeamType[] = [];
    let sheetIndex = 2;
    let loopCount = 0;
    // ESLintで怒られるから50チーム分取得
    while (loopCount < 50) {
      if (!this.sheet.getCellByA1(`B${sheetIndex}`).formattedValue) break;
      const teamOb: TeamType = new TeamType();
      teamOb.teamName = this.sheet.getCellByA1(`B${sheetIndex}`).formattedValue ?? "";
      teamOb.teamAbbreviation = this.sheet.getCellByA1(
        `C${sheetIndex}`,
      ).formattedValue ?? "";
      for (let i = 0; i < 3; i++) {
        teamOb.playerNames.push(
          this.sheet.getCellByA1(`D${sheetIndex + i}`).formattedValue ?? "",
        );
        teamOb.accountIds.push(
          this.sheet.getCellByA1(`I${sheetIndex + i}`).formattedValue ?? "",
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
  // thisに残すようにした
  async getMatchInfo() {
    if (!this.doc) throw new Error("run auth first");
    this.sheet = this.doc.sheetsByTitle["進行管理"];
    // 最小サイズLoad
    await this.sheet.loadCells("A1:C4");
    const blueTeam: string = this.sheet.getCellByA1("A3").formattedValue ?? "";
    const orangeTeam: string = this.sheet.getCellByA1("C3").formattedValue ?? "";
    const matchName: string = this.sheet.getCellByA1("B2").formattedValue ?? "";
    const bo: string = this.sheet.getCellByA1("B4").formattedValue ?? "";
    this.matchInfo = {
      blue: blueTeam,
      orange: orangeTeam,
      name: matchName,
      bo: bo,
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
  // loadTeamsに依存
  getIds() {
    // それぞれ一次元
    const accountIds = this.teamData.map((t) => t.accountIds).flat();
    const vNames = this.teamData.map((t) => t.playerNames).flat();
    this.idTable = {};
    for (let i = 0; i < accountIds.length; i++) {
      if (accountIds[i] != null) this.idTable[accountIds[i]] = vNames[i];
    }
    return this.idTable;
  }
}
