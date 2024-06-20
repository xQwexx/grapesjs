import Trait from '../Trait';
import TraitListUnique from '../TraitListUnique';
import TraitModifier from '../TraitModifier';
import { jsModifier, jsVariable } from '../TraitModifierJs';
import TraitObject from '../TraitObject';
import TraitObjectItem from '../TraitObjectItem';
import TraitVariable, { VariableType } from './TraitVariable';

export type UrlType = { url: string; variables: { [id: string]: VariableType } };

export default class TraitUrl extends TraitObject<UrlType> {
  constructor(target: Trait<UrlType>) {
    super(target);
    // target.opts.type = 'object';
    const variables = Object.entries(target.value.variables ?? {});
    console.log(variables);
    console.log('traits');

    // const targetJsModifier = new TraitModifierJs(trait, jsVariable(this.renderJs))
    // const parseVariables = new TraitModifier(this, TraitUrl.overrideValue)
    // parseVariables.registerForUpdateEvent(this);
  }

  protected initChildren() {
    const { target } = this;

    const variablesTrait = new TraitObjectItem('variables', this, {
        type: 'unique-list',
        traits: { type: 'variable' },
        label: false,
        editable: false,
      })
    return [
      new TraitObjectItem('url', this, { type: 'text', label: 'url' }, this.onUrlChange(this)),
      variablesTrait
    ];
  }

  private onUrlChange(urlTrait: TraitUrl){
    return (value: UrlType) => {
      // this.setValueFromModel();

      // console.log("setValueFromModel",this)
      // const variablesTrait = this.children.find(tr => tr.name == 'variables')! as TraitListUnique;
      // const variableNames = TraitUrl.parseUrlToVariables(value.url);
      // console.log("setValueFromModel",value, Object.fromEntries(variableNames.map(name => [name, variablesTrait.value[name]])))
      // console.log("setValueFromModel",variablesTrait.value)
      // variablesTrait.childrenChanged();
      // variablesTrait.value = {}//Object.fromEntries(variableNames.map(name => [name, variablesTrait.value[name]]));
      // console.log("setValueFromModel",variablesTrait.value)

      // variablesTrait?.setValueFromModel()
      // variablesTrait.onUpdateEvent();
      // variablesTrait.refreshChildren()
    }
  }

  // private static overrideValue(value: { url: string; variables: { [id: string]: string } }) {
  //   const variableNames = TraitUrl.parseUrlToVariables(value.url);
  //   console.log('aaa', variableNames);
  //   const oldVariables = value.variables ?? {};
  //   const variables = Object.fromEntries(variableNames.map(name => [name, oldVariables[name]]));
  //   console.log('aaa', variables);
  //   return { ...value, variables };
  // }

  protected static overrideValue(value: UrlType) {
    let {url = ''} = value;
    console.log(value);
    console.log(value.url);
    const variableNames = TraitUrl.parseUrlToVariables(url);
    console.log(variableNames);
    // variableNames.forEach(name => {
    //   let variable = value.variables[name] ?? '';
    //   console.log(variable);
    //   url = url.replaceAll(`<${name}>`, `\${${variable}}`);
    // });
    // console.log(url);

    const oldVariables = value.variables ?? {};
    const variables: { [id: string]: VariableType } = 
      Object.fromEntries(variableNames.map(name => [name, {...oldVariables[name], selectType: {type: 'string'}, params: {}}]));
    console.log('urlTe', variables);
    // return jsModifier(jsVariable('`' + url + '`'))({ ...value, variables });
    return { url, variables };
  }

  static renderJs(value?: UrlType, paramJsName?: string) {
    let {url, variables = {}} = value ?? {};
    console.log(value);
    console.log(value?.url);
    const variableNames = TraitUrl.parseUrlToVariables(url);
    console.log(variableNames);
    variableNames.forEach(name => {
      let variable = TraitVariable.renderJs(variables[name], paramJsName && `${paramJsName}?.${name}`);
      console.log(",variable",variable);
      url = url?.replaceAll(`<${name}>`, `\${${variable}}`);
    });
    console.log('urlTest', url, variableNames, value?.variables);
    return url ? '`' + url + '`': undefined;
  }

  private static parseUrlToVariables(url?: string): string[] {
    return url ? Array.from(url.matchAll(/(?<=<)[\w\d]+(?=>)/g), m => m[0]) : [];
  }

  protected setValue(value: UrlType): void {
    super.setValue(TraitUrl.overrideValue(value));
    console.log('setValue', value);
    console.log('setValue', this.children);

    const variablesTrait = this.children.find(tr => tr.name == 'variables');
    console.log('setValue', variablesTrait);
    // if (variablesTrait){
    //     variablesTrait.children =
    //   Object.keys(this.value.variables).map(name => new TraitObjectItem(name, variablesTrait, {type: "variable"}))
    // }

    // variablesTrait?.setValueFromModel()
    variablesTrait?.refreshChildren();
    
    // this.setValueFromModel();
    this.onUpdateEvent();
    // this.target.view?.onUpdateEvent(this.value, true);

    console.log('aaa', this.value);
  }

  get defaultValue(): UrlType{
    // console.log('importantValueDefault', keypars)
    // console.log('importantValueDefault', keyparsDefault)
    return Object.fromEntries(this.children.map(tr => [tr.name, tr.defaultValue])) as any
  }

}
