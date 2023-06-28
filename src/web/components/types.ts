export type gdriveFile = {
  id:string,
  kind:string, 
  md5Checksum:string,
  mimeType:string,
  modifiedTime:string,
  name:string
}

export type gdriveGlobType = {
    dir: string;
    files: gdriveFile[];
  };

export type localGlobType = {
  dir:string,
  map:Map<string,string>
}