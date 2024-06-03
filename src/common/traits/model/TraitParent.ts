import Trait from './Trait';
import TraitElement from './TraitElement';

export default abstract class TraitParent<CT extends Trait, TraitValueType = any> extends TraitElement<TraitValueType> {
  private updateChildren: boolean = false;
  // static  TraitFactory = () => (async () => {
  //   const factory = (await import('./TraitFactory')).default;
  //   return factory})()
  constructor(target: Trait<TraitValueType>) {
    super(target);
    // this.refreshChildren();
  }

  get name(): string {
    return this.target.name;
  }

  children!: CT[];

  // get children() {
  //   return this._children ?? [];
  // }

  // set children(children: CT[]) {
  //   console.log(children)
  //   this._children = children;
  // }


  protected abstract initChildren(): CT[];

   
  refreshChildren(){
    this.children?.forEach((tr, index) => delete this.children[index]);
    this.children = [];
    
    this.children = this.initChildren().map(tr => {
        console.log('urlTestTriggerParentValueFontos', tr);
        return this.em.Traits.TraitFactory.buildNestedTraits(tr)});
    // this.value = this.defaultValue;
    console.log('importantValue', this.value);

    console.log("urlTestTriggerParentValueChildren", this.name, this.children, this.value)
    // this.children.forEach(tr => tr.registerForUpdateEvent(()=> ))
    // this.onUpdateEvent();
  }


  protected getValue(): TraitValueType {
    return this.target.value;
  }

  protected setValue(value: TraitValueType): void {
    console.log('urlTestTriggerParent', this, value);
    this.target.value = value;
    if (this.updateChildren) {
      this.updateChildren = false;
      this.refreshChildren();
    }
  }

  childrenChanged() {
    this.updateChildren = true;
  }

  protected addChildren(tr: CT){
    this.children.push(this.em.Traits.TraitFactory.buildNestedTraits<CT>(tr));
    this.value = this.defaultValue;
    this.onUpdateEvent()
  }

  protected removeChildren(key: string){

    const traitIndex = this.children.findIndex(tr => tr.name == key)
    if (traitIndex != -1){
      this.children.splice(traitIndex, 1);
      this.value = this.defaultValue;
      this.onUpdateEvent()
    }
    
    // if (typeof value[name] != 'undefined') {
    //   delete value[name];
    //   this.childrenChanged();
    //   this.value = value;
    //   // this.refreshChildren();
    // }
  }

  get updateEventName(){
    return this.target.updateEventName;
  }

//   abstract initValue(): TraitValueType;

//   triggerTraitChanged(event: string){
//     const {name} = this
//     this.target.triggerTraitChanged(event ?? name)
//   }

  //   onUpdateEvent(){
  //     this.target.onUpdateEvent();
  //   }
}
