import { isArray, isObject } from 'underscore';
import Trait from './Trait';
import TraitElement from './TraitElement';
import TraitObjectItem from './TraitObjectItem';
import TraitParent from './TraitParent';

export default class TraitObject<
  TraitValueType extends { [id: string]: any } = any
> extends TraitParent<TraitElement, TraitValueType> {
  constructor(target: Trait<TraitValueType>) {
    target.opts.changeProp = true;
    super(target);
    // if (!isObject(this.target.value)) {
    //   this.value = {} as TraitValueType;
    // }
    // this.refreshChildren();
  }

  protected initChildren() {
    console.error("really important stasfrf",this)

    const values = isArray(this.templates) ? this.templates : [this.templates];
    return values.map(tr => { return new TraitObjectItem(tr.name, this, tr) });
  }

  get defaultValue(): TraitValueType{
    console.log('importantValueDefault', this.children, this.value, {...Object.fromEntries(this.target.templates.map(tr => [tr.name as any, this.children.find(c => c.name == tr.name)?.defaultValue])), ...this.value})
    const keypars = this.target.templates.map(tr => [tr.name, this.children.find(c => c.name == tr.name)?.defaultValue])
    const keyparsDefault = keypars.filter((keypar)=> keypar[1] != undefined)
    if (keyparsDefault.length > 0){
      return {...Object.fromEntries(keyparsDefault), ...this.value}
    }
    // console.log('importantValueDefault', keypars)
    // console.log('importantValueDefault', keyparsDefault)
    return undefined as any
  }

  get viewType() {
    return 'object';
  }

  get editable(): boolean {
    return this.opts.editable ?? true;
  }

  protected getValue(): TraitValueType {
    return isObject(this.target.value) ? this.target.value : {} as any;
  }
}
