import { isArray, isObject } from 'underscore';
import Trait, { OnUpdateView, TraitProperties } from './Trait';
import TraitElement from './TraitElement';

export default class TraitObjectItem<TraitValueType extends { [id: string]: any } = any> extends TraitElement<any> {
  onValueChange?: (value: any) => void;
  _name: string;
  get name(): string {
    return this._name;
  }
  constructor(name: string, target: Trait<TraitValueType>, opts: any, onValueChange?: (value: any) => void) {
    super(target, opts);
    this._name = name;
    // if (!isObject(this.target.value)) {
    //   this.target.value = {} as TraitValueType;
    // }
    this.onValueChange = onValueChange;
    // this.value = this.value;
  }

  get defaultValue(){
    const { name } = this;
    return this.value ?? this.opts.default ?? undefined//this.target.value?.hasOwnProperty(name) ? this.value : undefined;
  }


  protected getValue(): any {
    const { name } = this;
    return this.target.value[name as keyof TraitValueType];
  }

  protected setValue(value: any): void {
    console.log('setValue', value);
    console.log('setValueTarget', this.target);
    const { name } = this;
    const values = { ...this.target.value, [name]: value };
    // this.target.value[name] = value;
    // const values = this.target.value;
    console.log('setValue', values);
    this.target.value = values;
    this.onValueChange && this.onValueChange(values);

    // this.target.onUpdateEvent()
  }

  onUpdateEvent() {
    console.log('ChangeScriptEVENTSetInitElement',this.view, this, this.target)
    this.target.onUpdateEvent();
  }

  // triggerTraitChanged(event?: string){
  //   const {name} = this
  //   this.target.triggerTraitChanged(event?.replace(/^/, name + ':') ?? name)
  // }


}
