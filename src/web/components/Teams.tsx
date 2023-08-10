import { FC, useState } from "react";
import {CheckIcon,XMarkIcon} from "@heroicons/react/24/outline";
import {Loading,Checked} from "./Loading";
import {dataType, spreadMatchInfoType as matchInfoType} from "./types";
// export type matchInfoType = {
//   blue: string;
//   orange: string;
// };

export type Props = {
  authStatus: "loading" | "success" | "failed" | "none";
  teamNames: matchInfoType;
};

let teamName:matchInfoType;

window.app.on("cachedMatchInfo",(e: Electron.IpcRendererEvent,d:matchInfoType) => {
  teamName = d;
})

const defaultProps = (): Props => ({
  authStatus: "none",
  teamNames: teamName
});

const loading = () => {
  return(
    <div className="mt-7 ml-5">
          <Loading css="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"/>
    </div>
  )
};

const checked = () => {
    return(
      <div className="mt-7 ml-5">
        <Checked css="w-6 h-6 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0"/>
      </div>
    );
}
const failed = () => {
  return (
    <div className="mt-7 ml-5">
        <XMarkIcon className="w-6 h-6 mr-1.5 text-red-500 dark:text-red-400 flex-shrink-0"/>
    </div>
  );
};



export const Teams = () => {
  const [team, setTeam] = useState(defaultProps());

  const getIdsANDStream = async() => {
    await window.app.loadTeams().then(console.log);
    const idTable = await window.app.getIdTable();
    console.log(idTable);
    await window.app.stream({cmd:"idTable",data:idTable});
  }

  const getMatchInfo = async () => {
    //ロードのフラグを立てる
    setTeam({ ...team, authStatus: "loading" });
    try{
      teamName = await window.app.getMatchInfo();
      setTeam({ ...team, teamNames: teamName, authStatus: "success" });
    }catch(e){
      setTeam({ ...team, authStatus: "failed" });
    }

  };

  const sendMatchInfo = async () => {
    await window.app.stream({cmd:"matchInfo",data:teamName});
  };

  return (
    <div className="m-6 p-6 max-w-md  bg-white border border-gray-200 rounded-lg shadow">
      <div className="mt-5 border border-gray-200 rounded-lg p-2">
        <div className="flex flex-row">
          <p className="flex-auto text-center font-bold text-white bg-gray-400">{team.teamNames.name}</p>
        </div>
        <div className="flex flex-row w-full">
          <p className="text-center basis-2/5 text-blue-800 font-bold bg-blue-200">
            {team.teamNames.blue}
          </p>
          <p className="text-center flex-auto my-auto">VS</p>
          <p className="text-center basis-2/5 text-orange-800 font-bold bg-orange-200">
            {team.teamNames.orange}
          </p>
        </div>
        <div className="flex flex-grow">
          <p className="flex-auto text-center font-bold">{team.teamNames.bo}</p>
        </div>

      </div>
      <button onClick={getIdsANDStream} className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
        ユーザーID更新
      </button>
      <button
          id="getTeam"
          onClick={getMatchInfo}
          className="ml-5 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
        >
          試合情報更新
        </button>
        <button
          id="getTeam"
          onClick={sendMatchInfo}
          className="ml-5 mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
        >
          試合情報送信
        </button>
    </div>
  );
};


