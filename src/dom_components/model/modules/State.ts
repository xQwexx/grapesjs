import { VariableType } from "../../../common/traits/model/js-traits/TraitVariable";
import { ParamType } from "./MetaVariableTypes";

export interface IState{
    componentId?: string;
    stateName?: string;
    optType?: ParamType;
}

export default class State implements IState{
    componentId: string;
    stateName: string;
    meta: ParamType = {type: 'unkown'};
    params: Record<string, ParamType>;

    constructor(compId: string, stateName:string, params: Record<string, ParamType> = {}){
        this.componentId = compId;
        this.stateName = stateName;
        this.params = params;
    }

    asyncMetaData(optTypePromise: Promise<ParamType>){
        optTypePromise.then(type => this.meta = type);
        return this;
    }
}