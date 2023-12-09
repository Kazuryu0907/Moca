import { SheetService } from './spread';
import { socketComm } from './socketComm';
export class setPointModule {
  ss: SheetService;
  matchingScore = { blue: 0, orange: 0 };
  gameScore = { blue: 0, orange: 0 };
  preMatchingTeams = '';
  matchId = '';
  constructor(ss: SheetService) {
    this.ss = ss;
  }
  //cmd:goalsが来たら点数をincrement
  hook(input: { cmd: string; data: any }, sock: socketComm) {
    const cmd = input.cmd;

    if (cmd == 'goals') {
      const data: {
        assistId: string;
        scoreId: string;
        team: 'blue' | 'orange';
      } = input.data;
      const scoredTeam = data.team;
      //add Score
      this.matchingScore[scoredTeam]++;
      sock.sendData('/boost', {
        cmd: 'currentScore',
        data: this.matchingScore
      });
      sock.sendData('/stats', {
        cmd: 'currentScore',
        data: this.matchingScore
      });
    } else if (cmd == 'end') {
      //Match終了時
      //ScoreリセットはstartがfireされるまでScoreが映らないから大丈夫なはず
      const winnerTeam =
        this.matchingScore.blue > this.getMatchingScore.orange
          ? 'blue'
          : 'orange';
      this.gameScore[winnerTeam]++;
      sock.sendData('/boost', { cmd: 'setPoint', data: this.gameScore });
    } else if (cmd == 'matchId') {
      const data: { matchId: string } = input.data;
      console.log(`pre:${this.matchId} cur:${data.matchId}`);
      //違うプラベに入ったらスコアリセット
      if (this.matchId != data.matchId) {
        this.resetScore();
        //明示的に送信
        sock.sendData("/boost",{cmd: "currentScore",data: this.matchingScore});
      }
      this.matchId = data.matchId;
    }
  }

  resetScore() {
    this.matchingScore.blue = 0;
    this.matchingScore.orange = 0;
  }
  // /boostに再接続したときにscoreリセット
  onAccessHtml(path: string, sock: socketComm) {
    if (path == '/boost') {
      const cachedMatchInfo = this.ss.cachedMatchInfo;
      const currentMatchingTeams =
        cachedMatchInfo.blue + cachedMatchInfo.orange;
      if (this.preMatchingTeams != currentMatchingTeams) {
        this.gameScore.blue = 0;
        this.gameScore.orange = 0;
      }
      sock.sendData('/boost', {
        cmd: 'currentScore',
        data: this.matchingScore
      });

      this.preMatchingTeams = currentMatchingTeams;
      
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
