import React from "react";

export const Debug = () => {
  return (
    <>
      <div className="flex">
        <DebugSocket/>
        <DebugStart/>
      </div>
      <div className="flex">
        <DebugMatchingScore/>
        <DebugGameScore/>
      </div>
    </>
  );

}

const DebugStart = () => {
  const onclick = async () => {
    await window.app.sendSocketCommunication(JSON.stringify({ cmd: 'start', data:"" }));
  };
  return (
    <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
      <h1 className="font-bold text-lg">Open Boost</h1>
      <button
        onClick={onclick}
        className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
      >Open</button>
    </div>
  );
};
const DebugSocket = () => {
  const onclick = async () => {
    const elm = document.getElementById('input')! as HTMLInputElement;
    const data = elm.value;
    console.log(data);
    await window.app.sendSocketCommunication(data);
  };
  // const sleep = (ms: number) =>
  //   new Promise((resolve) => setTimeout(resolve, ms));
  const loadLog = async () => {
    const path = String.raw`C:\Users\kazum\Desktop\4DebugLog.txt`;
    const file = await window.app.readFile(path);
    const lines = file.split('\n');
    for (const line of lines) {
      if (JSON.parse(line)['cmd'] == 'time') continue;
      await window.app.sendSocketCommunication(line);
      // await sleep(300);;
    }
  };
  return (
    <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
      <h1 className="font-bold text-lg">Socket Connection</h1>
      <input id="input" className="border rounded-lg" type="text" />
      <button
        onClick={onclick}
        className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
      >
        send To Moca
      </button>

      <h1 className="font-bold text-lg">Socket Log</h1>
      <button
        onClick={loadLog}
        className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
      >
        Load
      </button>
    </div>
  );
};

const DebugMatchingScore = () => {
  const onClickMatching = async() => {
    const scoreBlue = document.getElementById('input_score_blue')! as HTMLInputElement;
    const scoreOrange = document.getElementById('input_score_orange')! as HTMLInputElement;
    const score = {
      blue: Number(scoreBlue.value),
      orange: Number(scoreOrange.value),
    };
    await window.app.setMatchingScore(score);
  };
  return (
    <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
      <h1 className="font-bold text-lg">Manually Score Set</h1>
      <div className="flex mt-5">
        <div className="text-center">
          <div className="bg-blue-500 text-white font-bold px-2">Blue</div>
          <div className="bg-orange-500 text-white font-bold px-2">Orange</div>
        </div>
        <div className="w-[50%]">
          <input id="input_score_blue" className="block border rounded-lg w-[30%]" type="text" defaultValue={0}/>
          <input id="input_score_orange" className="block border rounded-lg w-[30%]" type="text" defaultValue={0} />
        </div>
      </div>
      <button
        onClick={onClickMatching}
        className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
      >
        send To Moca
      </button>
    </div>
  );
};

const DebugGameScore = () => {
  const onClickGameScore = async() => {
    const scoreBlue = document.getElementById('input_game_blue')! as HTMLInputElement;
    const scoreOrange = document.getElementById('input_game_orange')! as HTMLInputElement;
    const score = {
      blue: Number(scoreBlue.value),
      orange: Number(scoreOrange.value),
    };
    await window.app.setGameScore(score);
  };
  return (
    <div className="m-6 max-w-sm p-6 border-gray-200 bg-white border rounded-lg shadow">
      <h1 className="font-bold text-lg">Manually SetPoint Set</h1>
      <div className="flex mt-5">
        <div className="text-center">
          <div className="bg-blue-500 text-white font-bold px-2">Blue</div>
          <div className="bg-orange-500 text-white font-bold px-2">Orange</div>
        </div>
        <div className="w-[50%]">
          <input id="input_game_blue" className="block border rounded-lg w-[30%]" type="text" defaultValue={0}/>
          <input id="input_game_orange" className="block border rounded-lg w-[30%]" type="text" defaultValue={0} />
        </div>
      </div>
      <button
        onClick={onClickGameScore}
        className="ml-3 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
      >
        send To Moca
      </button>
    </div>
  );
};