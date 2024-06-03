import { isObject } from 'underscore';
import Trait from './Trait';
import TraitFactory from './TraitFactory';
import TraitObjectItem from './TraitObjectItem';
import TraitParent from './TraitParent';

export default class TraitListUnique extends TraitParent<TraitObjectItem, { [id: string]: any }> {
  constructor(target: Trait<{ [id: string]: any }>) {
    target.opts.changeProp = true;
    super(target);
    // if (!isObject(this.value)) {
    //   this.setValue({});
    // }
  }

  protected initChildren() {
    console.log("urlTestTriggerParentValue", this.value)
    const values = (isObject(this.value)) ? Object.keys(this.value) : [];

    return values.map(key => {
      // const opts = isArray(trait.templates) ? trait.templates.find(tr => tr.name ==id) : trait.templates;
      return new TraitObjectItem(key, this, this.target.templates);
    });
  }

  get defaultValue(){
    return Object.fromEntries(this.children.map(tr => [tr.name, tr.defaultValue]))
  }

  add(name: string) {
    // if (typeof this.value[name] == 'undefined') {
    //   this.childrenChanged();
    //   this.value = { ...this.value, [name]: this.defaultValue}
    //   this.refreshChildren();
    // }
    this.addChildren(new TraitObjectItem(name, this, this.target.templates))
    console.log("Tryed to select", this)
    console.log("Tryed to select", this.children)
    
  }

  remove(name: string) {
    const { value } = this;
    this.removeChildren(name)
    // if (typeof value[name] != 'undefined') {
    //   delete value[name];
    //   this.childrenChanged();
    //   this.value = value;
    //   // this.refreshChildren();
    // }
  }
}
