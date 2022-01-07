export default interface IStorage{

  store(data: {[id: string]: string}, clb?: (res?: any) => void, clbErr?: (err: any) => void): void;

  load(keys:string[], clb?:(res: any) => void, clbErr?: (err: any) => void):void;

};
