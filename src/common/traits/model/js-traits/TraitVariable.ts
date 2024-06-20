import Trait from '../Trait';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import { ParamType } from '../../../../dom_components/model/modules/MetaVariableTypes';
import TraitStateRef, { StateRef } from './TraitStateRef';
import { StateType } from './TraitState';

const variableTypes = ['fixed', 'parameter', 'global'] as const

export type VariableType = {selectType: ParamType, params: Record<string, ParamType>}
  & ({ variableType: 'global'; data: StateRef }
  | { variableType: 'parameter'; data: { param: string, default: string } }
  | { variableType: 'fixed'; data: { default: string } });



export default class TraitVariable extends TraitObject<VariableType> {
  constructor(target: Trait<VariableType>) {
    super(target);
    target.opts.editable = false;
  }

  private static getAllSelectableParam(meta: ParamType, select: ParamType["type"], names: string[]): {names: string[], meta: ParamType}[] {
    let list: {names: string[], meta: ParamType}[] = []
    if(meta.type == select){
      list.push({names, meta})
    }
    if (meta.type == 'object' && meta.params) {
      list.push(...Object.entries(meta.params).map(([name, meta]) => this.getAllSelectableParam(meta, select, [...names, name])).flat())
    }
    return list
  }

  protected initChildren() {

    const typeSelection = new TraitObjectItem('variableType', this, {
      type: 'select',
      options: ((em: EditorModel) => (Object.keys(this.value.params ?? {}).length == 0) ? [variableTypes[0], variableTypes[2]] : variableTypes).bind(this),
      default: variableTypes[0],
      noLabel: true,
      width: 100,
    });
    return [typeSelection, ...this.selectedTraits(typeSelection.value)];
  }

  private selectedTraits(selectedType: typeof variableTypes[number]) {
    const dataTrait = new TraitObjectItem('data', this, { type: 'object', noLabel: true, width: 100 });
    const paramOpts = TraitVariable.getAllSelectableParam({ type: 'object', params: this.value.params ?? {}}, this.selectType.type, [])
    .map(d => {return {name: d.names.join('|'), value: d.names.join('?.')}})
    // dataTrait.value = {};
    switch (selectedType) {
      case 'parameter':
        return [new TraitObjectItem('param', dataTrait, { type: 'select', options: paramOpts, width: 100 }),
        new TraitObjectItem('default', dataTrait, { type: 'text', default: '', width: 100 })];
      case 'global':
        return [new TraitObjectItem('data', this, { type: 'state-ref', selectType: this.selectType, noLabel: true, width: 100 }) ];
      case 'fixed':
        return [new TraitObjectItem('default', dataTrait, { type: 'text', default: '', width: 100 })];
      default:
        return [];
    }
  }

  protected setValue(value: VariableType): void {
    if (this.value.variableType != value.variableType) {
      this.childrenChanged();
    }
    super.setValue(value);
  }

  static renderJs(value: VariableType, paramJsName?: string) {
    switch (value?.variableType) {
      case 'parameter':
        const defaultValue = value.data?.default ?? '';
        const param = paramJsName + (value.data.param ? `?.${value.data.param}` : '')
        return param ? `${param} ?? '${defaultValue}'`: (defaultValue ?`'${defaultValue}'`: 'undefined');
      case 'global':
        return TraitStateRef.renderJs(value.data);
      case 'fixed':
          return `'${value.data?.default}'` ?? 'undefined'
      default:
        return 'undefined';
    }
  }

  get selectType(){
    return this.value.selectType ?? {type: 'unkown'};
  }
}
