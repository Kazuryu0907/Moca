import { FC, useState } from "react";
import {CheckIcon} from "@heroicons/react/24/outline";
import {Loading,Checked} from "./Loading";
export type teamNameType = {
  blue: string;
  orange: string;
};

export type Props = {
  isGetting: boolean | undefined;
  teamNames: teamNameType;
};

const defaultProps = (): Props => ({
  isGetting: undefined,
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

export const Teams = () => {
  const [team, setTeam] = useState(defaultProps());
  const onclick = async () => {
    //ロードのフラグを立てる
    setTeam({ ...team, isGetting: true });
    const teamName: teamNameType = await window.app.getTeam();
    setTeam({ ...team, teamNames: teamName, isGetting: false });
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
          Get Team
        </button>
        {team.isGetting !== undefined && (team.isGetting ? loading() : checked())}
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
      <button className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300">
        Send To Overlay
      </button>
    </div>
  );
};
