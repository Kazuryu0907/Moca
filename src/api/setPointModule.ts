import { ws_cmd_func_type, ws_onConnection_type } from "../common/types";
import { socketComm } from "./socketComm";

export class setPointModule {
  // GameScoreはsetPointの方の数字
  matchingScore = { blue: 0, orange: 0 };
  gameScore = { blue: 0, orange: 0 };
  preMatchingTeams: { blue: string | undefined; orange: string | undefined } = { blue: "", orange: "" };
  matchingTeams = { blue: "", orange: "" };
  matchId = "";
  preMatchId = "";

  // cmd:goalsが来たら点数をincrement
  create_cmd_function(ws: socketComm) {
    const func: ws_cmd_func_type = (input) => {
      const { cmd, data } = input;
      if (cmd === "teamNames") {
        const teamNamesData: { blue: string; orange: string; matchId: string } = data;
        this.matchId = teamNamesData.matchId;
        this.matchingTeams = { blue: teamNamesData.blue, orange: teamNamesData.orange };
        // スコアリセット
        this.resetScore();
        // チーム名が違うプラベに入ったとき
        if (!this.is_same_teams()) {
          this.resetGameScore();
          console.log("teamNames changed");
          // 更新
          ws.sendData("/boost", { cmd: "currentScore", data: this.matchingScore });
          ws.sendData("/boost", { cmd: "setPoint", data: this.gameScore });
        }
        // pre系更新
        this.preMatchingTeams.blue = teamNamesData.blue;
        this.preMatchingTeams.orange = teamNamesData.orange;
        this.preMatchId = this.matchId;
      } else if (cmd === "goals") {
        const goal_data: {
          assistId: string;
          scoreId: string;
          team: "blue" | "orange";
        } = data;
        const scoredTeam = goal_data.team;
        this.matchingScore[scoredTeam]++;
        ws.sendData(["/boost", "/stats"], {
          cmd: "currentScore",
          data: this.matchingScore,
        });
        // Match終了時
      } else if (cmd === "end") {
        const winnerTeam = this.matchingScore.blue > this.matchingScore.orange ? "blue" : "orange";
        this.gameScore[winnerTeam]++;
        // setPoint送信
        ws.sendData("/boost", { cmd: "setPoint", data: this.gameScore });
        ws.sendData("/boost", { cmd: "END_GAME", data: "" });
      }
    };
    return func;
  }

  // /boostに再接続したときにscoreリセット
  create_onConnection_function() {
    const func: ws_onConnection_type = (ws, path) => {
      ws.send(JSON.stringify({ cmd: "setPoint", data: this.gameScore }));
      ws.send(JSON.stringify({ cmd: "preMatchId", data: this.preMatchId }));
      ws.send(JSON.stringify({ cmd: "currentScore", data: this.matchingScore }));

      if (path === "/boost") {
        ws.send(JSON.stringify({ cmd: "currentScore", data: this.matchingScore }));
      }
    };
    return func;
  }

  private is_same_teams() {
    console.log("is_same_teams");
    console.log(this.matchingTeams, this.preMatchingTeams);
    if (this.preMatchingTeams.blue === undefined) return true;
    return this.matchingTeams.blue === this.preMatchingTeams.blue
      && this.matchingTeams.orange === this.preMatchingTeams.orange;
  }

  resetScore() {
    this.matchingScore.blue = 0;
    this.matchingScore.orange = 0;
  }
  resetGameScore() {
    this.gameScore.blue = 0;
    this.gameScore.orange = 0;
  }

  set setMatchingScore(score: { blue: number; orange: number }) {
    this.matchingScore = { ...score };
  }

  get getMatchingScore() {
    return this.matchingScore;
  }

  set setGameScore(score: { blue: number; orange: number }) {
    this.gameScore = { ...score };
  }

  get getGameScore() {
    return this.gameScore;
  }
}
