import { FC, useState } from "react";

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
        <div role="status" className="mt-7 ml-5">
        <svg
          aria-hidden="true"
          className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    )
};

const checked = () => {
    return(
        <div role="status" className="mt-7 ml-5">
        <svg
          aria-hidden="true"
          className="w-6 h-6 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          ></path>
        </svg>
        <span className="sr-only">Loading...</span>
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
