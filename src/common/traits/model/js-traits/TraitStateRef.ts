import Trait from '../Trait';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import { ParamType } from '../../../../dom_components/model/modules/MetaVariableTypes';
import { StateType } from './TraitState';

export type StateRef = { componentId: string; stateName: string }


export default class TraitStateRef extends TraitObject<StateRef> {
  constructor(target: Trait<StateRef>) {
    super(target);
    target.opts.editable = false;
  }

  private static getAllSelectableParam(meta: ParamType, select: ParamType["type"], names: string[]): {names: string[], meta: ParamType}[] {
    let list: {names: string[], meta: ParamType}[] = []
    if(meta?.type == select){
      list.push({names, meta})
    }
    if (meta?.type == 'object' && meta.params) {
      list.push(...Object.entries(meta.params).map(([name, meta]) => this.getAllSelectableParam(meta, select, [...names, name])).flat())
    }
    return list
  }

  private  static filterWithSelectType(states: Record<string, StateType>, selectType: ParamType['type']){
    const result =  Object.entries(states).map(([name, state])=> this.getAllSelectableParam(state?.meta, selectType, [name])).flat()
    return result
  }

  private getComponentWithStates(selectType: ParamType['type']) {
    return (em: EditorModel) => {
      return Object.entries(em.Components.componentsById)
        .filter(([id, comp]) => comp.scriptSubComp && 
        TraitStateRef.filterWithSelectType(comp.scriptSubComp.states, selectType).length > 0)
        .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));
      }
  }

  private getStateNames(componentSelector: TraitObjectItem, selectType: ParamType['type']) {
    return (em: EditorModel): SelectOption[] => {
      const compId = componentSelector.value;
      if (compId){
        const component = em.Components.getById(compId);
        return component.scriptSubComp ? TraitStateRef.filterWithSelectType(component.scriptSubComp.states, selectType)
        .map(d => {return {name: d.names.join(':'), value: d.names.join('?.')}}) : [];
      }
      return [];
    };
  }

  protected initChildren() {
    // const data = Object.values(target.em.Components.componentsById)[0];
    // const compId = target.value?.componentId ?? data?.id;
    const componentSelector = new TraitObjectItem('componentId', this, {
        type: 'select',
        options: this.getComponentWithStates(this.selectType.type),
        noLabel: true,
        width: 50,
      })
    return [
      componentSelector,
      new TraitObjectItem('stateName', this, { type: 'select', options: this.getStateNames(componentSelector, this.selectType.type), noLabel: true, width: 50 }),
    ];
  }


  protected setValue(value: StateRef): void {
    if (this.value.componentId) {
      const comp = this.em.Components.getById(this.value.componentId)
      comp.scriptSubComp?.removeStateRef(this.updateEventName)
    }
    super.setValue(value);
    console.log('setValue', this.children, this);
    // this.setValueFromModel();
    console.log('setValueValue', value);
    const compId = value.componentId;
    if (compId) {
        const comp = this.em.Components.getById(compId)
        comp.scriptSubComp?.addStateRef(this.updateEventName, {componentId: this.component.getId(),  stateName: value.stateName})
        // variablesTrait.opts.options = this.getVariableNames(compId);
        // variablesTrait.onUpdateEvent();
    }
    this.onUpdateEvent();
  }

  static renderJs(value: StateRef) {
    const {componentId, stateName} = value ?? {};
    return componentId && stateName ? `window.globalScriptParams['${componentId}'].vars.${stateName}` : 'undefined';
  }

  get selectType(){
    return this.opts['selectType'] ?? {type: 'unkown'};
  }
}
