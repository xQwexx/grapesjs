import { ParamType } from '../../../../dom_components/model/modules/MetaVariableTypes';
import { ISignal } from '../../../../dom_components/model/modules/Signal';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import TraitParent from '../TraitParent';
import TraitVariable, { VariableType } from './TraitVariable';

export default class TraitSignal extends TraitObject<ISignal & {variables: Record<string, VariableType>}> {
  constructor(target: Trait<ISignal & {variables: Record<string, VariableType>}>) {
    super(target);
    target.opts.editable = false;
  }

  get selectType(){
    return this.opts.selectType;
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
    const compId = target.value?.componentId ?? data?.id as string;
    console.log("really important staff2222", target.value, this.value);
    const paramsTrait =        
    new TraitObjectItem('variables', this, {
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
    },this.onSlotChange(paramsTrait, this.value.params ?? {}))
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

  private onSlotChange(trait: TraitObjectItem, params: Record<string, ParamType>){
    return (value: ISignal) =>{
      const {componentId, slot} = value;
      if (componentId && slot){
        const selected = trait.em.Components.getById(componentId).slots[slot];
        console.log("really important staff333", trait.value, value, selected, selected.params, params);
        (trait.target as any).childrenChanged()
        console.log(slot, selected.params)
        if (selected.params){
          //@ts-ignore
          // trait.opts = {...trait.opts, traits: {type: 'variable', params: this.value.params}}
          trait.value = Object.fromEntries(Object.keys(selected.params).map(name => [name, {params, selectType: selected.params[name]}]))
          trait.onUpdateEvent();
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

  // protected overrideValue(value: ISignal & {variables: Record<string, VariableType>}) {
  //   console.log(value);
  //   console.log('/////////////////////////////////////////////////');

  //   // const {componentId, slot} = value;
  //   // if (componentId && slot){
  //   //   const selected = this.em.Components.getById(componentId).slots[slot]
  //   //   value.params = Object.fromEntries(Object.keys(selected.params).map(name => [name, '']))
  //   // }
  //   const {componentId, slot, variables = {}} = value;
  //   // const targetSlot = em.Components.getById(componentId).scriptSubComp!.slots[slot]
  //   const data = Object.entries(variables).map(([name, param]) => `'${name}': ${TraitVariable.renderJs(param)}`).join(",")
  //   console.log("setParams", value)
  //   return jsModifier(
  //     jsVariable(
  //       (componentId && slot &&
  //         `((data) => {
  //           console.log(data);
  //         window.globalScriptParams['${componentId}'].el?.dispatchEvent(new MessageEvent('${slot}', {data: {${data}, ...data}}))})`) ||
  //         '() => {}'
  //     )
  //   )(value);
  // }

  protected setValue(value: ISignal & {variables: Record<string, VariableType>}): void {
    super.setValue({...this.value, ...value});
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
