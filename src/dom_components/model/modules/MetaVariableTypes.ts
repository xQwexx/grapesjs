import { isArray, isObject } from "underscore"

export type ParamType = {type: 'list', itemType: ParamType}|{type: 'object', params: Record<string, ParamType>}|{type: 'string'}|{type: 'unkown'}


export function getMetaVariable(param: any): ParamType {
    if (isArray(param)) {
        return {
            type: 'list', 
            itemType: param.length > 0 ? getMetaVariable(param[0]) : {type: 'unkown'}
        }
    } else if (isObject(param)){
        return {
            type: 'object', 
            params: Object.fromEntries(Object.keys(param).map(key => [key, getMetaVariable(param[key])]))
        }
    } else {
        return {
            type: 'string'
        }
    }
}