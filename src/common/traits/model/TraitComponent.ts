import Component from '../../../dom_components/model/Component';
import Trait from './Trait';
import TraitParent from './TraitParent';
import TraitRoot from './TraitRoot';

export default class TraitComponent<
  TraitValueType extends Component = Component
> extends TraitParent<TraitValueType> {
  constructor(target: Trait<TraitValueType>) {
    target.opts.changeProp = true;
    super(target);
    // if (!isObject(this.target.value)) {
    //   this.value = {} as TraitValueType;
    // }
    // this.refreshChildren();
    console.log("asklfjleksdj", this.value)
    this.value.on("all", (a) => console.log("asklfjleksdj", a), this)
  }

  protected initChildren() {
    console.log("really important stasfrf",this.value)

    // const values = isArray(this.templates) ? this.templates : [];
    // return values.map(tr => { return new TraitRoot(tr.name, this.value, tr) });
    return [];//this.value.traits as TraitRoot<any>[]
  }

  get defaultValue(): TraitValueType{
    console.log('importantValueDefault', this.children)
    return undefined as any;
  }

  get viewType() {
    return 'object';
  }

  get editable(): boolean {
    return this.opts.editable ?? true;
  }
}
