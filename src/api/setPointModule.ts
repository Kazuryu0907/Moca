import { socketComm } from './socketComm';
export class setPointModule {
  //GameScoreはsetPointの方の数字
  matchingScore = { blue: 0, orange: 0 };
  gameScore = { blue: 0, orange: 0 };
  preMatchingTeams  = {blue:'',orange:''};
  matchingTeams = {blue:'',orange:''};
  matchId = '';
  preMatchId = '';

  //cmd:goalsが来たら点数をincrement
  hook(input: { cmd: string; data: any }, sock: socketComm) {
    const cmd = input.cmd;
    // cmd:TeamNames
    // プラベ入室時に発火
    if(cmd == "teamNames"){
        const teamNamesData: {blue: string,orange: string,matchId:string} = input.data;
        this.matchId = teamNamesData.matchId;
        // ゲームScoreリセット
        this.resetScore();
        // チーム名が違うプラベに入ったとき
        if(this.matchingTeams.blue != teamNamesData.blue || this.matchingTeams.orange != teamNamesData.orange){
          //setPointリセット
          this.resetGameScore();
          //明示的に送信
          sock.sendData("/boost",{cmd: "currentScore",data: this.matchingScore});
          sock.sendData("/boost",{cmd: "setPoint",data: this.gameScore});
        }
        //
        this.matchingTeams.blue = teamNamesData.blue;this.matchingTeams.orange = teamNamesData.orange;
        this.preMatchId = this.matchId;
    // 得点時
    } else if(cmd == "goals"){
        const data: {
            assistId: string;
            scoreId: string;
            team: 'blue' | 'orange';
        } = input.data;
        const scoredTeam = data.team;
        //add Score
        this.matchingScore[scoredTeam]++;
        sock.sendData(['/boost',"/stats"], {
            cmd: 'currentScore',
            data: this.matchingScore
        });
    // Match終了時
    }else if(cmd == "end"){
        const winnerTeam = this.matchingScore.blue > this.matchingScore.orange ? 'blue' : 'orange';
        this.gameScore[winnerTeam]++;
        //setPoint送信
        sock.sendData('/boost', { cmd: 'setPoint', data: this.gameScore });
    }
  }

  resetScore() {
    this.matchingScore.blue = 0;
    this.matchingScore.orange = 0;
  }
  resetGameScore() {
    this.gameScore.blue = 0;
    this.gameScore.orange = 0;
  }
  // /boostに再接続したときにscoreリセット
  onAccessHtml(path: string, sock: socketComm) {
    if (path == '/boost') {
    //   const cachedMatchInfo = this.ss.cachedMatchInfo;
    //   const currentMatchingTeams =
    //     cachedMatchInfo.blue + cachedMatchInfo.orange;
    //   if (this.preMatchingTeams != currentMatchingTeams) {
    //     this.gameScore.blue = 0;
    //     this.gameScore.orange = 0;
    //   }
      sock.sendData('/boost', {
        cmd: 'currentScore',
        data: this.matchingScore
      });

    //   this.preMatchingTeams = currentMatchingTeams;
      
    }
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
