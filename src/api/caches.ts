import { ws_cmd_func_type, ws_onConnection_type } from "@/common/types";

export class Caches {
  stats: object = {};
  setPoint: object = {};
  currentScore: { blue: number; orange: number } = { blue: 0, orange: 0 };

  create_cmd_function() {
    const cmd: ws_cmd_func_type = (input) => {
      // deep copy
      if (input.cmd === "stats") this.stats = JSON.parse(JSON.stringify(input.data));
    };
    return cmd;
  }

  create_onConnection_function() {
    const func: ws_onConnection_type = (ws) => {
      // 接続時にstats cacheを送りつける
      ws.send(JSON.stringify({ cmd: "stats", data: this.stats }));
    };
    return func;
  }
}
