import { socketComm } from './socketComm';
import { ws_cmd_func_type, ws_onConnection_type } from "../common/types";

export class setPointModule {
  //GameScoreはsetPointの方の数字
  matchingScore = { blue: 0, orange: 0 };
  gameScore = { blue: 0, orange: 0 };
  preMatchingTeams  = {blue:'',orange:''};
  matchingTeams = {blue:'',orange:''};
  matchId = '';
  preMatchId = '';

  //cmd:goalsが来たら点数をincrement
  create_cmd_function(ws:socketComm) {
    const func:ws_cmd_func_type = (input) => {
      const {cmd,data} = input;
      if(cmd === "teamNames"){
        const teamNamesData: {blue: string,orange: string,matchId:string} = data;
        this.matchId = teamNamesData.matchId;
        // スコアリセット
        this.resetScore();
        // チーム名が違うプラベに入ったとき
        if(!this.is_same_teams()){
          this.resetGameScore();
          // 更新
          ws.sendData("/boost",{cmd: "currentScore",data: this.matchingScore});
          ws.sendData("/boost",{cmd: "setPoint",data: this.gameScore});
        }
        // pre系更新
        this.matchingTeams.blue = teamNamesData.blue;this.matchingTeams.orange = teamNamesData.orange;
        this.preMatchId = this.matchId;
      }else if(cmd === "goals"){
        const goal_data: {
            assistId: string;
            scoreId: string;
            team: 'blue' | 'orange';
        } = data;
        const scoredTeam = goal_data.team;
        this.matchingScore[scoredTeam]++;
        ws.sendData(['/boost',"/stats"], {
            cmd: 'currentScore',
            data: this.matchingScore
        });
      // Match終了時
      }else if(cmd === "end"){
        const winnerTeam = this.matchingScore.blue > this.matchingScore.orange ? 'blue' : 'orange';
        this.gameScore[winnerTeam]++;
        //setPoint送信
        ws.sendData('/boost', { cmd: 'setPoint', data: this.gameScore });
      }
    }
    return func;
  }

  // /boostに再接続したときにscoreリセット
  create_onConnection_function(){
    const func:ws_onConnection_type = (ws,path) => {
      if(path === "/boost"){
        ws.send(JSON.stringify({ cmd: 'currentScore', data: this.matchingScore }));
      }
    }
    return func;
  }

  private is_same_teams(){
    return this.matchingTeams.blue === this.preMatchingTeams.blue && this.matchingTeams.orange === this.preMatchingTeams.orange;
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
    this.matchingScore = {...score};
  }

  get getMatchingScore() {
    return this.matchingScore;
  }

  set setGameScore(score: { blue: number; orange: number }) {
    this.gameScore = {...score};
  }
  
  get getGameScore() {
    return this.gameScore;
  }
}
