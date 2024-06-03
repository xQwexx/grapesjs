import { ParamType } from '../../../../dom_components/model/modules/MetaVariableTypes';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import TraitParent from '../TraitParent';
import TraitVariable from './TraitVariable';

export default class TraitSignal extends TraitObject<{ componentId: string; slot: string, params:  {type: 'list', itemType: ParamType}|{type: 'object', params: Record<string, ParamType>} }> {
  constructor(target: Trait<{ componentId: string; slot: string, params:  {type: 'list', itemType: ParamType}|{type: 'object', params: Record<string, ParamType>} }>) {
    super(target);
    target.opts.editable = false;
  }


  private getComponentWithSlots(): (em: EditorModel) => SelectOption[] {
    const dataType = this.dataType
    console.log("getComponentWithSlots",this.value)
    return(em: EditorModel) => {
    return Object.entries(em.Components.componentsById)
      .filter(([id, comp]) => Object.values(comp.slots).length > 0)//.filter(slot => slot.params?.type == dataType).length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));
  }
}

  private getSlotNames(compId: string) {
    console.log('vaasl;dfkj;asldkjf', this.dataType)
    const dataType = this.dataType;
    return (em: EditorModel): SelectOption[] => {
      const component = em.Components.getById(compId);
      return component?.scriptSubComp ? Object.keys(component.scriptSubComp.slots) : [];
      // return component?.scriptSubComp ? Object.entries(component.scriptSubComp.slots).filter(([key, slot]) => slot.params.type == dataType).map(s => s[0]) : [];
    };
  }

  protected initChildren() {
    const { target } = this;
    const data = Object.values(target.em.Components.componentsById)[0];
    const compId = target.value?.componentId ?? data?.id;

    const paramsTrait =        
    new TraitObjectItem('params', this, {
      type: 'unique-list',
      traits: {type: 'variable'},
      noLabel: true,
      editable: false,
      width: 100,
    })
    const slotTrait =  new TraitObjectItem('slot', this, {
      type: 'select',
      options: this.getSlotNames(compId),
      noLabel: true,
      width: 50,
    },this.onSlotChange(paramsTrait))
    return [
      new TraitObjectItem(
        'componentId',
        this,
        { type: 'select', options: this.getComponentWithSlots(), default: data?.id, noLabel: true, width: 50 },
        this.onComponentIdChange(slotTrait)
      ),
      slotTrait,
      paramsTrait
    ];
  }

  private onComponentIdChange(slotTrait: TraitObjectItem){
    return (compId: string) => {
      // this.setValueFromModel();
      // slotTrait.value = undefined;
      // slotTrait.opts.options = this.getSlotNames(compId);
      // slotTrait.onUpdateEvent();
    }
  }

  private onSlotChange(trait: TraitObjectItem){
    return (value: { componentId: string; slot: string, params: Record<string, string> }) =>{
      const {componentId, slot} = value;
      if (componentId && slot){
        const selected = trait.em.Components.getById(componentId).slots[slot];
        (trait.target as any).childrenChanged()
        console.log(slot, selected.params)
        if (selected.params){
          trait.value = Object.fromEntries(Object.keys(selected.params).map(name => [name, '']))
        } else{
          trait.value = {};
        }
        // trait.setValueFromModel();
        // (trait.target as TraitParent).childrenChanged();
        // trait.target.setValueFromModel();
        console.log("setParams1", trait.value)
        console.log("setParams2", trait)
      }
      // trait.value = 
    // this.setValueFromModel();
    }
  }

  protected overrideValue(value: { componentId: string; slot: string, params: Record<string, any> }) {
    console.log(value);
    console.log('/////////////////////////////////////////////////');

    // const {componentId, slot} = value;
    // if (componentId && slot){
    //   const selected = this.em.Components.getById(componentId).slots[slot]
    //   value.params = Object.fromEntries(Object.keys(selected.params).map(name => [name, '']))
    // }
    const {componentId, slot, params = {}} = value;
    // const targetSlot = em.Components.getById(componentId).scriptSubComp!.slots[slot]
    const data = Object.entries(params).map(([name, param]) => `'${name}': ${TraitVariable.renderJs(param)}`).join(",")
    console.log("setParams", value)
    return jsModifier(
      jsVariable(
        (componentId && slot &&
          `((data) => {
            console.log(data);
          window.globalScriptParams['${componentId}'].el?.dispatchEvent(new MessageEvent('${slot}', {data: {${data}, ...data}}))})`) ||
          '() => {}'
      )
    )(value);
  }

  protected setValue(value: { componentId: string; slot: string, params:  {type: 'list', itemType: ParamType}|{type: 'object', params: Record<string, ParamType>} }): void {
    super.setValue(this.overrideValue(value));
    const variablesTrait = this.children.find(tr => tr.name == 'slot');
    if (variablesTrait) {
      const compId = value?.componentId;
      if (compId) {
        variablesTrait.opts.options = this.getSlotNames(compId);
        variablesTrait.onUpdateEvent();
      }
    }
    this.onUpdateEvent();
  }

  get dataType(): 'object'|'list'|'unkown'{
    const {componentId, slot} = this.value
    // this.em.Components.getById(componentId)?.slots[slot].params 
    console.log(this.value)
    //@ts-ignores
    return this.value?.optType?.type ?? 'unkown';
  }
}
