import Trait from './Trait';
import TraitElement from './TraitElement';
import TraitParent from './TraitParent';

export default abstract class TraitModifier<TraitValueType> extends TraitParent<TraitValueType> {
  protected abstract overrideValue(value: TraitValueType): any;

  constructor(target: Trait<TraitValueType>) {
    super(target);
    this.value = this.value;
    this.children = this.initChildren();
  }

  get name(): string {
    return this.target.name;
  }

  protected initChildren(): TraitElement[] {
    return [];
  }

  get em() {
    return this.target.em;
  }

  protected getValue(): TraitValueType {
    return this.target.value;
  }

  protected setValue(value: TraitValueType): void {
    this.target.value = this.overrideValue(value);
    console.log('sss', this.target.value);
  }

  refreshTrait(forced: boolean) {
    const children = this.initChildren();
    console.log(
      'setValueRefreshTrait',
      this.children.map(tr => tr.name).toString(),
      children.map(tr => tr.name).toString()
    );
    if (this.children.map(tr => tr.name).toString() != children.map(tr => tr.name).toString()) {
      this.children = children;
      // this.view?.onUpdateEvent(this.value, true);
    }
    console.log('setValueFromModel', this.children);
  }
}
