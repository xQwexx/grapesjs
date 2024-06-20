import { Model } from "../../../common";
import TraitStateRef from "../../../common/traits/model/js-traits/TraitStateRef";
import TraitUrl from "../../../common/traits/model/js-traits/TraitUrl";
import Component from "../Component";
import ScriptSubComponent from "./ScriptSubComponent";

export type PropsType = {name: string, type: 'link'|'url'|'state-ref', render?: (value: any) => any}


export default class PropComponent {
    private model?: Component;
    private script: ScriptSubComponent
    private renderValue?: (value: any) => any;
    name: string;

    constructor(script: ScriptSubComponent, opts: PropsType){
        this.script = script;
        this.name = opts.name;
        this.renderValue = opts.render;
        if (opts.type == "url"){
            this.renderValue = TraitUrl.renderJs;
        }
        if (opts.type == "state-ref"){
            this.renderValue = TraitStateRef.renderJs
        }
    }

    register(comp: Component){
        this.model = comp;
        this.model.on(`change:${this.name}`, this.propChange, this);
    }

    deregister(){
        this.model?.off(`change:${this.name}`, this.propChange, this);
        this.model = undefined;
    }

    private propChange(){
        this.script.onChange();
    }

    static linkToComponent(comp: ScriptSubComponent, name: string){
        return new PropComponent(comp, {name, type: 'link'})
    }

    get value(){
        const value = this.model!.get(this.name)
        // console.log("asdfasdfasdfasdfasdfsadfasdf", value , this.renderValue!(value))
        return this.renderValue ? this.renderValue(value) : value;
    }

    private renderValueWithFunction(value: any){
        const tmpFunc: string[] = [];
        function jsonReplacer(key: any, val: any) {
            if (typeof val === 'function' || val && val.constructor === RegExp) {
                tmpFunc.push(val.toString());
                return `{func_${tmpFunc.length - 1}}`;
            }
            return val
          }
        function funcReplacer(match: any, id: number) {
            return tmpFunc[id];
         };
        return JSON.stringify(value, jsonReplacer).replace(/"\{func_(\d+)\}"/g, funcReplacer)
    }

    render(){
        if (typeof this.value == 'undefined'){
            return undefined;
        }
        else if (this.renderValue){
            return `get ${this.name}(){return ${this.value}}`
        }
        else {
            return `${this.name}: ${this.renderValueWithFunction(this.value)}`
        }
    }
}