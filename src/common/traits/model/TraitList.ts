import { isArray } from 'underscore';
import Trait from './Trait';
import TraitFactory from './TraitFactory';
import TraitListItem from './TraitListItem';
import TraitParent from './TraitParent';

export default class TraitList extends TraitParent<any[]> {
  constructor(target: Trait<any[]>) {
    target.opts.changeProp = true;
    super(target);
  }

  protected initChildren() {
    console.log(this.value);
    const values = (isArray(this.value)) ? this.value : [];
    return values.map((value, index) => {
      return new TraitListItem(index, this, this.target.templates as any);
    });
  }

  get defaultValue(){
    return isArray(this.value) ? this.value : this.children.map(tr => tr.defaultValue).filter(value => value != undefined)
  }

  add() {
    // this.childrenChanged();
    // this.value = [ ...this.value, '']
    this.addChildren(new TraitListItem(this.value.length, this, this.target.templates as any))
    console.log("Tryed to select", this)
    console.log("Tryed to select", this.children)
    
  }
  remove(id: number) {
    // const { value } = this;
    this.removeChildren(`${id}`);
    // if (typeof value[id] != 'undefined') {
    //   value.splice(id, 1);
    //   this.childrenChanged();
    //   this.value = value;
    //   // this.refreshChildren()
    //   console.log("Tryed to select Remove", id, value, this.value)
    // }
  }
}
