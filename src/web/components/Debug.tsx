export const Debug = () => {
    const onclick = async() => {
        const elm = document.getElementById("input")! as HTMLInputElement;
        const data = elm.value;
        console.log(data);
        await window.app.sendSocketCommunication(data);
    }
    const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve,ms));
    const loadLog = async() => {
        const path = String.raw`C:\Users\kazum\Desktop\4DebugLog.txt`;
        const file = await window.app.readFile(path);
        const lines = file.split('\n');
        for(const line of lines){
            if(JSON.parse(line)["cmd"] == "time")continue;
            await window.app.sendSocketCommunication(line);
            // await sleep(100);
        }
        
    }
    return(
        <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
            <h1 className="font-bold text-lg">
            Socket Connection
            </h1>
            <input id="input" className="border rounded-lg" type="text" />
            <button
            onClick={onclick}
            className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
            >
                send To Moca
            </button>

            <h1 className="font-bold text-lg">
                Socket Log
            </h1>
            <button
            onClick={loadLog}
            className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
            >
                Load
            </button>
        </div>
    )
}