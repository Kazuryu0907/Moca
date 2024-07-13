export class Caches {
    stats: Object = {};
    setPoint: Object = {};
    currentScore: { blue: number; orange: number } = { blue: 0, orange: 0 };

    constructor() {
    }
    
    create_cmd_function() {
        const cmd = (input:{cmd:string,data:any}) => {
            // deep copy
            this.stats = JSON.parse(JSON.stringify(input.data));
        }
        return cmd;
    }

    create_onConnection_function(){
        const func = (ws:WebSocket) => {
            ws.send(JSON.stringify({ cmd: 'stats', data: this.stats }));
        }
        return func;
    }
}