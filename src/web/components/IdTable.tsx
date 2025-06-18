import { useState } from "react";
import { spreadMatchInfoType as matchInfoType } from "./types";

let idTable: Record<string, string> = {};

window.app.on(
  "cachedIdTable",
  (e: Electron.IpcRendererEvent, d: matchInfoType) => {
    console.log(d);
    idTable = d;
  },
);

const createColum = (name: string, id: string) => {
  return (
    <tr className="bg-white border-b">
      <th
        scope="row"
        className="px-3 font-medium text-gray-900 whitespace-nowrap"
      >
        {name}
      </th>
      <td className="px-3">{id}</td>
    </tr>
  );
};

export const IdTable = () => {
  const [Ids, setIds] = useState({});
  const createdTable: JSX.Element[] = [];
  Object.keys(idTable).forEach((id) => {
    const name = idTable[id];
    createdTable.push(createColum(name, id));
  });

  const getIdsANDStream = async () => {
    await window.app.loadTeams().catch(console.log);
    idTable = await window.app.getIdTable();
    console.log(idTable);
    await window.app.stream({ cmd: "idTable", data: idTable });
    setIds({ ...idTable });
  };

  return (
    <div className="m-6 p-6 max-w-md bg-white border border-gray-200 rounded-lg shadow">
      <h1 className="font-bold text-lg">
        Colums:{Object.keys(idTable).length}
      </h1>
      <div className="m-3 max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3">
                Player Name
              </th>
              <th scope="col" className="px-3 py-3">
                Player ID
              </th>
            </tr>
          </thead>
          <tbody>{...createdTable}</tbody>
        </table>
      </div>
      <button
        onClick={getIdsANDStream}
        className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300"
      >
        ユーザーID更新
      </button>
    </div>
  );
};
