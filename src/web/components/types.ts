export type gdriveFile = {
  id:string,
  kind:string, 
  md5Checksum:string,
  mimeType:string,
  modifiedTime:string,
  name:string
}

// export class spreadTeamType{
//   teamName: string = "";
//   teamAbbrevitation: string = "";
//   playerNames: string[] = [];
//   accountIds: string[] = [];
// }

export type spreadTeamType = {
  blue:string,
  orange:string,
  name:string,
  bo:string,
  blueMembers:string[],
  orangeMembers:string[]
};


export type gdriveGlobType = {
    dir: string;
    files: gdriveFile[];
  };

export type localGlobType = {
  dir:string,
  map:Map<string,string>
}