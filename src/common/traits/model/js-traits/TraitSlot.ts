import { ISignal } from '../../../../dom_components/model/modules/Signal';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import Trait from '../Trait';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import TraitParent from '../TraitParent';
import TraitVariable from './TraitVariable';

type SlotProp = { subscription: ISignal, params?: 'object'|'list'}

export default class TraitSlot extends TraitObject<SlotProp> {
  constructor(target: Trait<SlotProp>) {
    super(target);
    target.opts.editable = false;
  }

  private getComponentWithSignals(): (em: EditorModel)=> SelectOption[] {
    const dataType = this.dataType
    return (em: EditorModel) => {
      console.error(dataType)
      console.error(Object.entries(em.Components.componentsById).map(([id, comp]) => Object.values(comp.scriptSubComp?.signals ?? {}).map(s => s)))
      return Object.entries(em.Components.componentsById)
      .filter(([id, comp]) => Object.values(comp.scriptSubComp?.signals ?? {}).filter(s => s?.optType?.type == dataType).length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));
    }
  }

  private getSignalNames(compId: string) {
    const dataType = this.dataType
    return (em: EditorModel): SelectOption[] => {
      const component = em.Components.getById(compId);
      return component?.scriptSubComp ? Object.entries(component.scriptSubComp.signals).filter(([k, s]) => s.optType?.type == dataType).map(([key, s]) => key) : [];
    };
  }

  protected initChildren() {
    const { target } = this;
    const data = Object.values(target.em.Components.componentsById)[0];
    const compId = target.value.subscription?.componentId ?? data?.id as string;

    // console.log("testetstsdfezx", this.getSignalNames(compId)(this.target.em))
    const subscriptionTrait =        
    new TraitObject(new TraitObjectItem('subscription', this, {
      type: 'object',
      noLabel: true,
      width: 100,
    }))

    const paramsTrait =        
    new TraitObjectItem('params', subscriptionTrait, {
      type: 'unique-list',
      traits: {type: 'variable'},
      noLabel: true,
      editable: false,
      width: 100,
    })
    return [
      new TraitObjectItem(
        'componentId',
        subscriptionTrait,
        { type: 'select', options: this.getComponentWithSignals(), default: data?.id, noLabel: true, width: 50 },
        this.onComponentIdChange
      ),
      new TraitObjectItem('name', subscriptionTrait, {
        type: 'select',
        options: this.getSignalNames(compId),
        noLabel: true,
        width: 50,
      },this.onSignalChange(paramsTrait)),
      paramsTrait
    ];
  }

  private onComponentIdChange(value: string) {

    // this.setValueFromModel();
  }

  private onSignalChange(trait: TraitObjectItem){
    return (value: { componentId: string; name: string, params: Record<string, string> }) =>{
      const {componentId, name} = value;
      if (componentId && name){
        const selected = trait.em.Components.getById(componentId).scriptSubComp?.signals[name]
        trait.value = Object.fromEntries(Object.keys(selected?.optType ?? {}).map(name => [name, '']))
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

  // protected overrideValue(value: ISignal) {
  //   console.log(value);
  //   console.log('/////////////////////////////////////////////////');

  //   // const {componentId, slot} = value;
  //   // if (componentId && slot){
  //   //   const selected = this.em.Components.getById(componentId).slots[slot]
  //   //   value.params = Object.fromEntries(Object.keys(selected.params).map(name => [name, '']))
  //   // }
  //   const {componentId, name, params = {}} = value;
  //   const data = Object.entries(params).map(([name, param]) => `'${name}': ${TraitVariable.renderJs(param)}`).join(",")
  //   console.log("setParams", value)
  //   return jsModifier(
  //     jsVariable(
  //       (componentId && name &&
  //         `(() => window.globalScriptParams['${componentId}'].el?.addEventListener('${name}', {data: {${data}}})))`) ||
  //         '() => {}'
  //     )
  //   )(value);
  // }

  protected setValue(value: SlotProp): void {
    super.setValue(value);
    const variablesTrait = this.children?.find(tr => tr.name == 'name');
    if (variablesTrait) {
      const compId = value.subscription?.componentId;
      if (compId) {
        variablesTrait.opts.options = this.getSignalNames(compId);
        variablesTrait.onUpdateEvent();
      }
    }
    this.onUpdateEvent();
  }

  get dataType(): 'object'|'list'|'unkown'{
    // const {componentId, slot} = this.value.subscription
    // this.em.Components.getById(componentId)?.slots[slot].params 
    console.log("dataTypeasdfdsaf",this.value)
    console.log("dataTypeasdfdsaf",this)
    return this.value?.params ?? 'unkown';
  }
}
