import { VariableType } from "../../../common/traits/model/js-traits/TraitVariable";
import { ParamType } from "./MetaVariableTypes";

export interface ISignal{
    componentId?: string;
    slot?: string;
    optType?: ParamType;
    params?: Record<string, ParamType>;
}

export default class Signal implements ISignal{
    componentId: string;
    slot: string;
    optType: ParamType = {type: 'unkown'};
    params: Record<string, ParamType>;

    constructor(compId: string, slotName:string, params: Record<string, ParamType> = {}){
        this.componentId = compId;
        this.slot = slotName;
        this.params = params;
    }

    asyncMetaData(optTypePromise: Promise<ParamType>){
        optTypePromise.then(type => this.optType = type);
        return this;
    }
}