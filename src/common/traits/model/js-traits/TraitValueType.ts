import Trait from '../Trait';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import { ParamType } from '../../../../dom_components/model/modules/MetaVariableTypes';


// export function renderJsTraitVariable(value: StateType, paramJsName?: string) {
//     switch (value?.stateType) {
//       case 'parameter':
//         const defaultValue = value.data?.default ?? '';
//         return paramJsName ? `${paramJsName} ?? '${defaultValue}'`: (defaultValue ?`'${defaultValue}'`: 'undefined');
//       case 'global':
//         const {componentId, name} = value.data;
//         return componentId && name ? `window.globalScriptParams['${componentId}'].vars['${name}']` : 'undefined';
//       // case 'fixed':
//       //     return 'undefined'
//       default:
//         return 'undefined';
//     }
//   }


export default class TraitValueType extends TraitObject<ParamType> {
  constructor(target: Trait<ParamType>) {
    super(target);
    target.opts.editable = false;
  }

  protected initChildren() {
    const { target } = this;
    // const data = Object.values(target.em.Components.componentsById)[0];
    // const compId = target.value?.componentId ?? data?.id;
    const typeSelection = new TraitObjectItem('type', this, {
      type: 'select',
      options: ['string', 'bool', 'object', 'list'],
      default: 'string',
      noLabel: true,
      width: 100,
    });
    // typeSelection.value = typeSelection.value;
    console.log('setValueinitChildren', '');
    console.log('setValueValue', typeSelection.value);
    return [typeSelection, ...this.selectedTraits(typeSelection.value)];
  }

  private selectedTraits(selectedType:  ParamType['type']) {
    // const dataTrait = new TraitObjectItem('default', this, { type: 'object', noLabel: true, width: 100 });
    // dataTrait.value = {};
    switch (selectedType) {
      case 'string':
        return []//[new TraitObjectItem('default', this, { type: 'text', default: '', width: 100 })];
    //   case 'bool':
    //     return [new TraitObjectItem('default', this, { type: 'checkbox', default: false, width: 100 })];
      case 'object':
        return [new TraitObjectItem('params', this, { type: 'unique-list', width: 100, traits: {type: 'value'} })];
      case 'list':
        return [new TraitObjectItem('itemType', this, { type: 'value', width: 100})];
      default:
        return [];
    }
  }

  protected setValue(value: ParamType): void {
    if (this.value.type != value.type) {
      console.log('setValuechildrenChanged', value);
      this.childrenChanged();
    }
    // if (this.value.variableType == 'global' && this.value.data.componentId) {
    //   const comp = this.em.Components.getById(this.value.data.componentId)
    //   comp.scriptSubComp?.removeStateRef(this.updateEventName)
    // }
    super.setValue(value);
    console.log('setValue', this.children, this);
    // this.setValueFromModel();
    // const variablesTrait = this.children?.find(tr => tr.name == 'name');
    // if (variablesTrait && value.variableType == 'global') {
    //   console.log('setValueValue', value);
    //   const compId = value.data.componentId;
    //   if (compId) {
    //     const comp = this.em.Components.getById(compId)
    //     comp.scriptSubComp?.addStateRef(this.updateEventName, {componentId: this.component.getId(),  name: value.data.name})
    //     // variablesTrait.opts.options = this.getVariableNames(compId);
    //     // variablesTrait.onUpdateEvent();
    //   }
    // }
    this.onUpdateEvent();
  }


}
