import { ParamType } from "./MetaVariableTypes";

export interface ISignal{
    componentId?: string;
    slot?: string;
    optType?: ParamType;
}

export default class Signal implements ISignal{
    componentId: string;
    slot: string;
    optType: ParamType = {type: 'unkown'};

    constructor(compId: string, slotName:string){
        this.componentId = compId;
        this.slot = slotName;
    }

    asyncMetaData(optTypePromise: Promise<ParamType>){
        optTypePromise.then(type => this.optType = type);
        return this;
    }
}