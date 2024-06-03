import { any, isArray } from 'underscore';
import { Model } from '../..';
import Trait, { TraitProperties } from './Trait';
import TraitElement from './TraitElement';
import TraitFactory from './TraitFactory';

export default class TraitListItem extends TraitElement<any> {
  public readonly index: number;
  public get name() {
    return this.index + '';
  }


  // traits: (TraitGroupItem|TraitGroup)[];
  constructor(index: number, target: Trait<any[]>, opts: TraitProperties) {
    // super({ ...opts, changeProp: true } as any);
    super(target, { ...opts, changeProp: true });
    this.index = index;
    // if (!isArray(this.target.value)) {
    //   this.target.value = [];
    // }

    //   this.traits = []
    console.log('alamr', this.target.value);
  }

  // get traits() {
  //   return this.value.map(v => this.initTrait(v.id, v.value));
  // }

  get defaultValue(){
    const { index } = this;
    return this.target.value?.length > index? this.value : undefined;
  }

  private initTrait(index: string, value?: any) {
    const { templates } = this;
    const traits = this.templates;
    // console.log(this.traits)
    // const index = this.traits.length as any
    // if (isArray(templates) && templates.length > 1) {
    //   return new TraitGroup(index, this, { name: index, traits, value });
    // } else {
    //   return new TraitGroupItem(index, this, { ...traits, value });
    // }
  }

  protected getValue(): any {
    const { index } = this;
    return this.target.value[index];
  }

  protected setValue(value: any): void {
    const { index } = this;
    const values = this.target.value; //, [this.index]: value];
    values[index] = value;
    this.target.value = values;
  }


  //   public add() {
  //     this.setValue([...this.value, { id: this.value.length + '', value: '' }]);
  //     // this.model.trigger(`change:${this.name}`);
  //   }

  //   public remove(id: string) {
  //     const { value } = this;
  //     const index = value?.findIndex(tr => tr.id == id) ?? -1;
  //     if (index > -1) {
  //       value.splice(index, 1);
  //     }
  //     this.setValue(value);
  //   }

  // triggerTraitChanged(event?: string){
  //   const {name} = this
  //   this.target.triggerTraitChanged(event?.replace(/^/, name + ':') ?? name)
  // }
}
