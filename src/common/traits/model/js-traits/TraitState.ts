import Trait from '../Trait';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import EditorModel from '../../../../editor/model/Editor';
import { SelectOption } from '../../view/TraitSelectView';
import { ParamType } from '../../../../dom_components/model/modules/MetaVariableTypes';
import TraitUrl, { UrlType } from './TraitUrl';
import { SlotType } from '../../../../dom_components/model/modules/ScriptSubComponent';

export type StateType = {
    meta: ParamType;
} & ({type:"default", default: any} | {type:"query", url: UrlType, dataSrc: string}  | {type:"function", default: string});


export default class TraitState extends TraitObject<StateType> {
  constructor(target: Trait<StateType>) {
    super(target);
    target.opts.editable = false;
    console.log("a;sldkfj;alskdjfeibv;xkjz;", this.value, this.defaultValue)

  }

  protected initChildren() {
    const metaSelection = new TraitObjectItem('meta', this, {
      type: 'value',
      default: {type: 'string'},
      width: 100,
    });

    const typeTrait = new TraitObjectItem('type', this, { type: 'select', default: 'default', options: ['default', 'query', 'function']});

    return [metaSelection, typeTrait, ...this.selectValueTrait(typeTrait.value, metaSelection.value)];
  }

  private selectValueTrait(type: StateType['type'], selectedType: ParamType){
    switch (type){
        case 'default':
            return [new TraitObjectItem('default', this, this.selectedTraits(selectedType))];
        case 'query':
            return [new TraitObjectItem('url', this, { type: 'url'})];
        case 'function':
            return [new TraitObjectItem('default', this, { type: 'function'})];
        default:
            console.log(type, selectedType)
            return [];

    }
  }

  private selectedTraits(selectedType: ParamType): any {
    // const dataTrait = new TraitObjectItem('default', this, { type: 'object', noLabel: true, width: 100 });
    // dataTrait.value = {};
    console.log('setValueinitChildrenasdfasdfesas', selectedType);
    switch (selectedType?.type) {
      case 'string':
        return  {type: 'text', default: '', width: 100 };
    //   case 'bool':
    //     return [new TraitObjectItem('default', this, { type: 'checkbox', default: false, width: 100 })];
      case 'object':
        return { type: 'object', width: 100, default: {},
        traits: Object.entries(selectedType.params ?? {}).map(([name, p]) => {return {name, ...this.selectedTraits(p)}})};
      case 'list':
        return { type: 'list', width: 100, default: [],  traits: this.selectedTraits(selectedType.itemType)};
      default:
        return {};
    }
  }


  protected setValue(value: StateType): void {
    if (this.value.type == 'query'){
        const comp = this.em.Components.getById(this.component.getId())
        comp.scriptSubComp?.removeSlot(this.name)
    }
    if (this.value != value){
      this.childrenChanged();
    }
    super.setValue(value);

    if (this.value.type == 'query'){
        const comp = this.em.Components.getById(this.component.getId())
        comp.scriptSubComp?.addSlot(this.name, TraitState.getSlot(this.value, this.name))
    }
    this.onUpdateEvent();
  }

  static getSlot(value: { url: UrlType, dataSrc: string}, name: string): SlotType{
    const script = `(opts)=>{
        var cachedInput;
        var cachedData;
        return (i)=>{
  const url = ${TraitUrl.renderJs(value.url, 'i.data')};
      if (cachedInput != i?.data || typeof cachedData == 'undefined'){
        url && $.get(url).done(data => {
          console.log("fromSite", data)
          cachedData = data;
          cachedInput = i?.data;
          opts.slots['updateState']({data: {'${name}': data}});
        });
      }
    }}`;
    return {script, params: {}}
  }

  static renderJs(value: StateType, name: string) {
    switch (value?.type) {
      case 'default':
        const defaultValue = value?.default ?? '';
        return  defaultValue ?`'${defaultValue}'`: 'undefined';
      case 'query':
        return 'undefined';
      default:
        return 'undefined';
    }
  }

  static renderValueJs(value: StateType, name: string) {
    switch (value?.type) {
      case 'default':
        const defaultValue = value?.default ?? '';
        return  defaultValue ?`${JSON.stringify(defaultValue)}`: 'undefined';
      case 'query':
        return `undefined`;
      default:
        return 'undefined';
    }
  }
}
