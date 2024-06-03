import Trait from '../Trait';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';

export type VariableType =
  | { variableType: 'global'; data: { componentId: string; name: string } }
  | { variableType: 'parameter'; data: { default: string } };

export function renderJsTraitVariable(value: VariableType, paramJsName?: string) {
    switch (value?.variableType) {
      case 'parameter':
        const defaultValue = value.data?.default ?? '';
        return paramJsName ? `${paramJsName} ?? '${defaultValue}'`: (defaultValue ?`'${defaultValue}'`: 'undefined');
      case 'global':
        const {componentId, name} = value.data;
        return componentId && name ? `window.globalScriptParams['${componentId}'].vars['${name}']` : 'undefined';
      // case 'fixed':
      //     return 'undefined'
      default:
        return 'undefined';
    }
  }


export default class TraitVariable extends TraitObject<VariableType> {
  constructor(target: Trait<VariableType>) {
    super(target);
    target.opts.editable = false;
    // const variableType = this.value.variableType ??  'parameter';
    // const data = this.value.data
    // this.value = {variableType: 'parameter', ...this.value}
  }

  private getComponentWithVariables(em: EditorModel): SelectOption[] {
    return Object.entries(em.Components.componentsById)
      .filter(([id, comp]) => comp.scriptSubComp && Object.keys(comp.scriptSubComp.states).length > 0)
      .map(([id, comp]) => ({ value: id, name: `${comp.getName()}-${id}` }));
  }

  private getVariableNames(componentSelector: TraitObjectItem) {
    return (em: EditorModel): SelectOption[] => {
      const compId = componentSelector.value;
      if (compId){
        const component = em.Components.getById(compId);
        return component.scriptSubComp ? Object.keys(component.scriptSubComp.states) : [];
      }
      return [];
    };
  }

  protected initChildren() {
    const { target } = this;
    // const data = Object.values(target.em.Components.componentsById)[0];
    // const compId = target.value?.componentId ?? data?.id;
    const typeSelection = new TraitObjectItem('variableType', this, {
      type: 'select',
      options: ['parameter', 'global', 'fixed'],
      default: 'parameter',
      noLabel: true,
      width: 100,
    });
    // typeSelection.value = typeSelection.value;
    console.log('setValueinitChildren', '');
    console.log('setValueValue', typeSelection.value);
    return [typeSelection, ...this.selectedTraits(typeSelection.value)];
  }

  private selectedTraits(selectedType: 'parameter' | 'global' | 'fixed') {
    const dataTrait = new TraitObjectItem('data', this, { type: 'object', noLabel: true, width: 100 });
    // dataTrait.value = {};
    switch (selectedType) {
      case 'parameter':
        return [new TraitObjectItem('default', dataTrait, { type: 'text', default: '', width: 100 })];
      case 'global':
        const componentSelector = new TraitObjectItem('componentId', dataTrait, {
            type: 'select',
            options: this.getComponentWithVariables,
            noLabel: true,
            width: 50,
          })
        return [
          componentSelector,
          new TraitObjectItem('name', dataTrait, { type: 'select', options: this.getVariableNames(componentSelector), noLabel: true, width: 50 }),
        ];
      case 'fixed':
        return [];
      default:
        return [];
    }
  }

  private static onVariableTypeChange(tr: TraitVariable) {
    return () => {
      console.log('setValue', 'onVariableTypeChange');
      console.log('setValue', tr.children);
      console.log('setValue', tr);
      // tr.childrenChanged();
      // tr.setValueFromModel();
    };
  }

  //   protected overrideValue(value: { componentId: string; name: string }) {
  //     console.log(value);
  //     console.log('/////////////////////////////////////////////////');
  //     return jsModifier(
  //       jsVariable(
  //         (value?.componentId &&
  //           value?.name &&
  //           `(callback) => window.globalVariables['${value.componentId}']['${value.name}']`) ||
  //           'undefined'
  //       )
  //     )(value);
  //   }

  protected setValue(value: VariableType): void {
    if (this.value.variableType != value.variableType) {
      console.log('setValuechildrenChanged', value);
      this.childrenChanged();
    }
    if (this.value.variableType == 'global' && this.value.data.componentId) {
      const comp = this.em.Components.getById(this.value.data.componentId)
      comp.scriptSubComp?.removeStateRef(this.updateEventName)
    }
    super.setValue(value);
    console.log('setValue', this.children, this);
    // this.setValueFromModel();
    const variablesTrait = this.children?.find(tr => tr.name == 'name');
    if (variablesTrait && value.variableType == 'global') {
      console.log('setValueValue', value);
      const compId = value.data.componentId;
      if (compId) {
        const comp = this.em.Components.getById(compId)
        comp.scriptSubComp?.addStateRef(this.updateEventName, {componentId: this.component.getId(),  name: value.data.name})
        // variablesTrait.opts.options = this.getVariableNames(compId);
        // variablesTrait.onUpdateEvent();
      }
    }
    this.onUpdateEvent();
  }

  static renderJs(value: VariableType, paramJsName?: string) {
    switch (value?.variableType) {
      case 'parameter':
        const defaultValue = value.data?.default ?? '';
        return paramJsName ? `${paramJsName} ?? '${defaultValue}'`: (defaultValue ?`'${defaultValue}'`: 'undefined');
      case 'global':
        const {componentId, name} = value.data;
        return componentId && name ? `window.globalScriptParams['${componentId}'].vars['${name}']` : 'undefined';
      // case 'fixed':
      //     return 'undefined'
      default:
        return 'undefined';
    }
  }
}
