export type gdriveFile = {
  id: string;
  kind: string;
  md5Checksum: string;
  mimeType: string;
  modifiedTime: string;
  name: string;
};

// export class spreadTeamType{
//   teamName: string = "";
//   teamAbbrevitation: string = "";
//   playerNames: string[] = [];
//   accountIds: string[] = [];
// }

export const Browsers = [
  "/icon",
  "/playerName",
  "/score",
  "/nextMatch",
  "/transition",
  "/boost",
  "/stats",
] as const;
export type BrowserType = (typeof Browsers)[number];

export type dataType = {
  cmd: string;
  data: any;
};

export type spreadMatchInfoType = {
  blue: string;
  orange: string;
  name: string;
  bo: string;
};

export type gdriveGlobType = {
  dir: string;
  files: gdriveFile[];
};

export type localGlobType = {
  dir: string;
  map: Map<string, string>;
};
