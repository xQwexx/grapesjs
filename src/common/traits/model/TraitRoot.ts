import { Model, SetOptions } from '../..';
import Component from '../../../dom_components/model/Component';
import EditorModel from '../../../editor/model/Editor';
import Trait, { TraitProperties } from './Trait';
import TraitElement from './TraitElement';

export default class TraitRoot<
  TModel extends Model & { em: EditorModel },
  TraitValueType = any
> extends Trait<TraitValueType> {
  readonly model: TModel;
  private readonly _name: string;
  get name(): string {
    return this._name;
  }
  traitElement!: TraitElement;

  get component(): Component {
    return this.model as any
  }

  constructor(name: string, model: TModel, opts: any) {
    super({ name, ...opts } as any);
    this.model = model;
    this._name = name;

    model.on('change:' + name, (c, v)=>console.log("urlTestTriggerParentValueChanged", c, v));
    if (opts.type == 'list' || opts.type == 'object') {
      this.opts.changeProp = true;
    }
  }

  get em() {
    return this.model.em;
  }

  protected getValue(): TraitValueType {
    const { changeProp, model, name } = this;
    const value = changeProp
      ? model.get(name)
      : // TODO update post component update
        model.get('attributes')[name];

    return value;
  }

  protected setValue(value: TraitValueType, opts: SetOptions = {}): void {
    const { name, model, changeProp } = this;

    const props: any = { [name]: value };
    // This is required for the UndoManager to properly detect changes
    props.__p = opts.avoidStore ? null : undefined;

    const trait = this.traitElement;
    console.log('urlTestTrigger', value, this);
    if (changeProp) {
      trait && model.off('change:' + name, trait.setValueFromModel, trait);
      model.set(props, opts);
      // model.trigger(`change:${name}`);
      trait && model.on('change:' + name, trait.setValueFromModel, trait);
    } else {
      model.set('attributes', { ...model.get('attributes'), ...props }, opts);
    }
  }

  triggerTraitChanged(event: string){
    const { name, model } = this;
    // model.trigger(`trait:change:${event?.replace(/^/, name + ':') ?? name}`);
    model.trigger(event);
  }

  get updateEventName(){
    return 'trait:change:' + this.name;
  }

  setTraitElement(trait: TraitElement) {
    const { name, model } = this;
    console.log('ChangeScriptEVENTSetInit',  'change:' + name, trait, trait.value, trait.defaultValue)
    this.traitElement = trait;
    if(trait.defaultValue && trait.value != trait.defaultValue){
      trait.value = trait.defaultValue;
    }
    
    
    // this.value = trait.value;
    //this.value = trait.defaultValue;
    // trait.onUpdateEvent()

    // model.on('change:' + name, trait.setValueFromModel, trait);
  }
}
