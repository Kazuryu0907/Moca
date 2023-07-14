import { FC, useState } from "react";
import {CheckIcon,XMarkIcon} from "@heroicons/react/24/outline";
import {Loading,Checked} from "./Loading";
import {dataType, spreadTeamType as teamNameType} from "./types";
// export type teamNameType = {
//   blue: string;
//   orange: string;
// };

export type Props = {
  authStatus: "loading" | "success" | "failed" | "none";
  teamNames: Pick<teamNameType,"blue" | "orange">;
};

const defaultProps = (): Props => ({
  authStatus: "none",
  teamNames: {
    blue: "None",
    orange: "None",
  },
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
  const send2Overlay = () => {
    //StateからTeam情報とってくる
    let data:dataType = {cmd:"teamNames",data:team.teamNames};
    window.app.sendSocket({path:"/NextMatch",data:data});
    window.app.getTeamInfo().then(console.log);
  }
  const onclick = async () => {
    //ロードのフラグを立てる
    setTeam({ ...team, authStatus: "loading" });
    // const idElm = document.getElementById("spread_id") as HTMLInputElement;
    // const id = idElm.value;
    const id = await window.app.SPREADSHEET_ID() ?? "";
    //SpreadSheetのIDセット
    await window.app.setSheetID(id);
    //Auth
    try{
      await window.app.spreadAuth();
      const teamName: teamNameType = await window.app.getTeam();
      console.log(teamName);
      setTeam({ ...team, teamNames: teamName, authStatus: "success" });
    }catch(e){
      setTeam({ ...team, authStatus: "failed" });
    }

  };

  return (
    <div className="m-6 p-6 max-w-sm  bg-white border border-gray-200 rounded-lg shadow">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        Update Team from Google-SpreadSheet
      </h5>
      <p className="mt-3 font-semibold text-gray-600">
        GoogleSpreadSheet Authing...
      </p>

      <div className="flex">
        <button
          id="getTeam"
          onClick={onclick}
          className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
        >
          チーム更新
        </button>
        {team.authStatus !== "none" && (team.authStatus === "loading" ? loading() : (team.authStatus === "success" ? checked() : failed()))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-y-2 gap-x-2 border border-gray-200 rounded-lg p-2">
        <p className="my-auto text-center text-blue-800 font-bold ">
          Blue Team
        </p>
        <p className="col-span-2 text-center text-blue-800 font-bold bg-blue-200">
          {team.teamNames.blue}
        </p>
        <hr className="col-span-3" />
        <p className="my-auto text-center text-orange-800 font-bold">
          Orange Team
        </p>
        <p className=" col-span-2 text-center text-orange-800 font-bold bg-orange-200">
          {team.teamNames.orange}
        </p>
      </div>
      <button onClick={send2Overlay} className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
        Send To Overlay
      </button>
    </div>
  );
};
