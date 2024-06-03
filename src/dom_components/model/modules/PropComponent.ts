import { Model } from "../../../common";
import TraitUrl from "../../../common/traits/model/js-traits/TraitUrl";
import Component from "../Component";
import ScriptSubComponent from "./ScriptSubComponent";

export type PropsType = {name: string, type: 'link'|'url', render?: (value: any) => any}


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
        return this.renderValue ? this.renderValue(value) : value;
    }

    render(){
        if (typeof this.value == 'undefined'){
            return undefined;
        }
        else if (this.renderValue){
            return `get ${this.name}(){return ${this.value}}`
        }
        else {
            return `${this.name}: ${JSON.stringify(this.value) }`
        }
    }
}