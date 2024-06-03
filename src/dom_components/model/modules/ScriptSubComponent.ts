import { isArray, isFunction, isObject } from 'underscore';
import { Model } from '../../../common';

import EditorModel from '../../../editor/model/Editor';
import Component from '../Component';
import { ComponentProperties } from '../types';
 import TraitVariable, { renderJsTraitVariable, VariableType } from '../../../common/traits/model/js-traits/TraitVariable';
import PropComponent from './PropComponent';
import { ParamType } from './MetaVariableTypes';
import { ISignal } from './Signal';
import TraitFactory from '../../../common/traits/model/TraitFactory';

type includeType = {
  globalName: string;
  files: ({type: 'js', src: string}|{type:'style', href: string})[]
}
export type SlotType = { script: string | ((...params: any[]) => any), event: {type: string}, params:  {type: 'list', itemType: ParamType}|{type: 'object', params: Record<string, ParamType>}, subscription: {componentId?: string, name?: string}}
export interface ScriptData {
  main: string | ((...params: any[]) => any);
  includes?: includeType[];
  props: (string|{name: string, render: (value: any) => any})[];
  variables: Record<string, any | (() => any)>;
  signals: Record<string, { componentId?: string; slot?: string, optType: ParamType}>;
  slots: Record<string, { script: string | ((...params: any[]) => any), params: Record<string, ParamType>}>;
}
const escapeRegExp = (str: string) => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

function isFunctionEmpty(fn: string) {
  const content = fn.toString().match(/\{([\s\S]*)\}/m)?.[1] || ''; // content between first and last { }
  return content.replace(/^\s*\/\/.*$/gm, '').trim().length === 0; // remove comments
}

type MapJsItem = {
  ids: string[];
  code: string;
  includes: includeType[];
};

const updateState = function(props: any){
  return (event: any)=>{
    const data = event.data;
    //@ts-ignore
    console.log("Test out states",data, props);
    Object.keys(data ?? {}).forEach(name => {
      // window.globalScriptParams[opts.el.id].vars[name] = d[name]
      props.vars[name] = data[name]
      props.el.dispatchEvent(new MessageEvent(`state:change:${name}`, {data: data[name]}));
      console.log("Test out states",`state:change:${name}`, data[name]);
    });
    props.el.dispatchEvent(new MessageEvent(`state:change`, {data}));
  }
}

export default class ScriptSubComponent extends Model {
  defaults() {
    return {
      main: '',
      props: [],
      variables: {},
      signals: {},
      slots: {},
      states: {},
      stateRefs: {},
      scriptUpdated: false,
      statefull: false,
    };
  }

  constructor(component: Component, script: ScriptData) {
    super({ component, ...component.scriptSubComp });
    this.set(script)
    // if(this.get("statefull")){
      //@ts-ignore
      this.slots["updateState"] = { script: updateState, params: Object.fromEntries(Object.keys(this.states).map(state => [state, {type: "string"}]))}
      this.listenTo(this, 'change:states', (e,f) => {
        //@ts-ignore
        this.slots["updateState"] = { script: updateState, params: Object.fromEntries(Object.keys(this.states).map(state => [state, {type: "string"}]))}
      });
    // }
    
    this.setProps(script.props ?? [])
    this.initScriptProps()
    this.listenTo(this, 'change:main', this.scriptUpdated);
    this.listenTo(this, 'change', this.__scriptPropsChange);
    this.listenTo(this, 'change', (e,f) => console.log("Test out states",e, f));
    // const prevComp = this.component.scriptSubComp;

    // this.component.scriptSubComp?.stopListening(this.component, 'change:script', this.component.scriptSubComp.__scriptChange)
    // this.listenTo(this.component, 'change:script', this.__scriptChange);
    // this.listenTo(this, 'change:slots', this.__scriptPropsChange);
    this.register();
  }

  get component(): Component {
    return this.get('component');
  }

  get em()  {
    return this.component.em;
  }

  get props(): PropComponent[] {
    return this.get('props');
  }

  setProps(props: (string|{name: string, render: (value: any) => any})[]){
    console.log(props)
    const newProps = props.map(prop => 
      isObject(prop) ? new PropComponent(this, {type: 'link', ...prop}) : 
      new PropComponent(this, {name: prop, type: 'link'})
      )
    this.set('props', newProps)
  }

  get dataId() {
    return this.component.getId();
  }

  initScriptProps() {
    const { component } = this;
    const prop = 'props';
    const toListen: any = [`change:${prop}`, this.initScriptProps, this];
    this.off(...toListen);
    const prevProps: PropComponent[] = this.previous(prop) || [];
    const newProps: PropComponent[] = this.get(prop) || [];
    prevProps.forEach(prop => prop.deregister && prop.deregister())
    newProps.forEach(prop => prop.register(component))
    // @ts-ignore
    this.on(...toListen);
  }

  onChange(){
    this.component.trigger('rerender');
  }

  __scriptPropsChange(m?: any, v?: any, opts: any = {}) {
    if (opts.avoidStore) return;
    console.log('scriptPropsCHange');
    this.onChange();
  }

  private scriptUpdated() {
    this.set('scriptUpdated', true);
  }

  __getScriptProps() {
    // const modelProps = this.component.props();
    // const scrProps = this.props || [];
    // return scrProps.reduce((acc, prop) => {
    //   acc[prop.name] = modelProps[prop.name];
    //   return acc;
    // }, {} as Partial<ComponentProperties>);
    console.log(this.props)
    return `{${this.props.flatMap(p => p.render() ?? []).join(',')}}`;
  }

  register(){
    // If the component has scripts we need to expose his ID
    let attr = this.component.get('attributes');
    const id = this.component.getId();
    this.component.set('attributes', { ...attr, id }, { silent: true });

    this.component.on('change:script-props', this.setProps, this)
    if(!this.component.traits.find(tr => tr.name == "states")){
      const trait = TraitFactory.build(this, {type:"unique-list", name: "states"})
      this.component.traits.push(trait)
    }
    if(!this.component.traits.find(tr => tr.name == "signals")){
      //@ts-ignore
      const trait = TraitFactory.build(this, {type:"unique-list", name: "signals", traits: { type: 'signal' }})
      this.component.traits.push(trait)
    }
  }

  deregister(){
    this.component.off('change:script-props', this.setProps, this)

    const statesTraitIndex = this.component.traits.findIndex(tr => tr.name == "states")
    if (statesTraitIndex){
      this.component.traits.splice(statesTraitIndex, 1);
    }

    const signalsTraitIndex = this.component.traits.findIndex(tr => tr.name == "signals")
    if (signalsTraitIndex){
      this.component.traits.splice(signalsTraitIndex, 1);
    }
  }

  /**
   * Return script in string format, cleans 'function() {..' from scripts
   * if it's a function
   * @param {string|Function} script
   * @return {string}
   * @private
   */
  getScriptString(script?: string | Function) {
    const { component } = this;
    let scr: string = script || this.get('main') || '';

    if (!scr) {
      return scr;
    }

    if (this.props) {
      scr = scr.toString().trim();
    } else {
      // Deprecated
      // Need to convert script functions to strings
      if (isFunction(scr)) {
        let scrStr = scr.toString().trim();
        scrStr = scrStr.slice(scrStr.indexOf('{') + 1, scrStr.lastIndexOf('}'));
        scr = scrStr.trim();
      }

      const config = component.em.getConfig();
      const tagVarStart = escapeRegExp(config.tagVarStart || '{[ ');
      const tagVarEnd = escapeRegExp(config.tagVarEnd || ' ]}');
      const reg = new RegExp(`${tagVarStart}([\\w\\d-]*)${tagVarEnd}`, 'g');
      scr = scr.replace(reg, (match, v) => {
        // If at least one match is found I have to track this change for a
        // better optimization inside JS generator
        this.scriptUpdated();
        const result = component.attributes[v] || '';
        return isArray(result) || typeof result == 'object' ? JSON.stringify(result) : result;
      });
    }
    return scr;
  }

  static renderComponentSignal(signal: { componentId: string; slot: string, params: Record<string, any> }, em: EditorModel) {
    const {componentId, slot, params} = signal;
    // const targetSlot = em.Components.getById(componentId).scriptSubComp!.slots[slot]
    // const a = TraitVariable.renderJs(params as any) 
    const data =params// Object.fromEntries(Object.entries(params).map(([name, param]) => [name, TraitVariable.renderJs(param)]))
    return `(() => window.globalScriptParams['${componentId}'].el?.dispatchEvent(new MessageEvent('${slot}', {data: ${JSON.stringify(data)}})))`
  }

  static renderComponentSignals(script: ScriptSubComponent) {
    const signals = script.signals;
    return `{${Object.keys(signals)
      .map(
        name =>
          `'${name}': 
           ${//
            
            //   // ? signals[name]._js.render()
            //   ? `((d) => window.globalScriptParams['${signals[name].componentId}'].slots['${signals[name].slot}'](d))`
            //   : '(() => {})'
            signals[name] && signals[name].componentId && signals[name].slot ? 
            ((signals[name].componentId == script.dataId) ?
          `(d) => window.globalScriptParams['${signals[name].componentId}'].el?.dispatchEvent(new MessageEvent('${signals[name].slot}', {data: {${Object.entries(signals[name].params ?? {})
            .map(([name, param])=> `'${name}': ${TraitVariable.renderJs(param)},`).join('')} ...d}}))`
           :
           `(d) => window.globalScriptParams['${signals[name].componentId}'].slots['${signals[name].slot}']({data: {${Object.entries(signals[name].params ?? {})
           .map(([name, param])=> `'${name}': ${TraitVariable.renderJs(param)},`).join('')} ...d}})`)
            : '(() => {})'
          // `(d) => window.globalScriptParams['${script.dataId}'].el?.dispatchEvent(new MessageEvent('${name}', {data: {${Object.entries(signals[name].optType ?? {})
          // .map(([name, param])=> `'${name}': ${TraitVariable.renderJs(param)},`).join('')} ...d}}))`
        }`
      )
      .join(',')}}`;
  }
  // slots: {${Object.keys(script.get('slots')).length > 0
  // ? Object.keys(script.get('slots')).map(
  //       name => `'${name}':  (${script.slots[name].script})(window.globalScriptParams['${script.dataId}'])
  //       `
  //     ).join(',')
  // : ''}},
  static renderSlots(scripts: ScriptSubComponent[]) {
    return `
    window.globalScriptParams = {...window.globalScriptParams, ${scripts
      .map(
        script =>
          `'${script.dataId}': {el: document.getElementById('${
            script.dataId
          }'), signals: ${ScriptSubComponent.renderComponentSignals(script)}, props: ${script.__getScriptProps()
          },vars: {${Object.keys(script.variables)
            .map(name => `'${name}': (${script.variables[name]})()`)
            .concat(
              Object.keys(script.states)
            .map(name => `'${name}': ${script.states[name]}`)
            )
            // .concat(
            //   Object.entries(script.stateRefs)
            //   .map(([name, stateRef]) => `'${name}': () => window.globalScriptParams['${stateRef.subscription.componentId}']?.states['${stateRef.subscription.name}']`)
            // )
            .join(',')}},

          }`
      )
      .join(',')}
    }
    ${scripts.map( script =>
      `${
      //   Object.values(script.component.em.Components.allById()).map(c => Object.values(c.scriptSubComp?.stateRefs ?? {})).flat()
      // .filter(ref => ref.subscription.componentId == script.dataId)
      Object.values(script.stateRefs)
        .map((stateRef) => `window.globalScriptParams['${script.dataId}'].el.addEventListener('state:change:${stateRef.subscription.name}', (event) => {
          const slot = window.globalScriptParams['${stateRef.subscription.componentId}'].slots['refresh'];
          if (slot){
            slot(event);
          }
          console.log("Test out states",event);
        });
`)
        }` +
      `window.globalScriptParams['${script.dataId}'].slots = 
      {${Object.keys(script.slots).map(
                name => `'${name}':  (${script.slots[name].script})(window.globalScriptParams['${script.dataId}'])`
              )
              // .concat(Object.keys(script.states).length > 0 ? 
              // `'updateState': (event)=>{
              //   const props = window.globalScriptParams['${script.dataId}'];
              //   const data = event.data;
              //   //@ts-ignore
              //   console.log("Test out states",data, props);
              //   Object.keys(data ?? {}).forEach(name => {
              //     // window.globalScriptParams[opts.el.id].vars[name] = d[name]
              //     props.vars[name] = data[name]
              //     props.el.dispatchEvent(new MessageEvent(\`state:change:\${name}\`, {data: data[name]}));
              //     console.log("Test out states",\`state:change:\${name}\`, data[name]);
              //   });
              //   props.el.dispatchEvent(new MessageEvent(\`state:change\`, {data}));
              // }`
              // : '')
              .join(',')
          }};`
    ).join('\n')}
    ${
      scripts
      .map(script =>{
        const components =  script.component.em.Components.allById()
        console.log("testvariable",renderJsTraitVariable)
        // const slots = Object.values(components).flatMap(c => Object.entries(c.scriptSubComp?.slots ?? {}).map(([name, slot]) => { return  {subscription: slot.subscription, event: `window.globalScriptParams['${c.getId()}'].slots['${name}']` }} ))
           // const subscribedSlots = slots.filter((slot) => slot.subscription?.componentId == script.dataId)

           const subscribedSlots = Object.entries(script.slots).map(([name, slot]) => {return { subscription: slot.subscription, event: `window.globalScriptParams['${script.component.getId()}'].slots['${name}']` }})
        const subscribedSignals: any = []
        // Object.entries(script.signals).filter(([name, signal]) => signal?.componentId && signal?.slot)
        // .map(([name, signal]) =>  { return {
        //   subscription: {componentId: script.dataId, name: name}, 
        //   event: `window.globalScriptParams['${signal.componentId}'].slots['${signal.slot}']`}
        // })
        const subscriptions = [ ...subscribedSignals, ...subscribedSlots]
        return subscriptions.length > 0

          ? subscriptions.map(
                slot => `${(slot.subscription?.componentId && slot.subscription?.name &&
                  `window.globalScriptParams['${slot.subscription.componentId}'].el?.addEventListener('${slot.subscription.name}', ${slot.event});`)
                  ?? '' 
              }`).join('')
                
                // `window.globalScriptParams['${script.dataId}'].el?.addEventListener('${name}', 
                // window.globalScriptParams['${script.dataId}'].slots['${name}']);`
              
          : ''
      })
      .join('')}\n`;
  }

  static renderRefreshJs(js: MapJsItem, scriptParam: string): string{
    return `${scriptParam}.slots['refresh'] = 
    () => (${js.code}.bind(${scriptParam}.el)(${scriptParam}));
    ${`${js.includes.map(inc => `if (typeof ${inc.globalName}=='undefined'){
      ${inc.files.map(file => {
        switch (file.type){
          case ('js'):
            return `const script = document.createElement('script');
            script.onload = ${scriptParam}.slots['refresh'];
            script.src = '${file.src}';
            document.body.appendChild(script);`
          case 'style':
            return `const style = document.createElement('link');
            style.type="text/css" 
            style.rel="stylesheet"
            style.href = '${file.href}';
            document.head.appendChild(style);`
          }
        }).join("")
      }
    };`).join('')};`}
    ${js.includes.find(inc => inc.files.find(file => file.type == 'js')) == undefined && `${scriptParam}.slots['refresh']();`}`
  }

  static renderJs(script: ScriptSubComponent | ScriptSubComponent[]) {
    const scripts = isArray(script) ? script : [script];
    const mapJs = ScriptSubComponent.mapScripts(scripts);

    let code = ScriptSubComponent.renderSlots(scripts);
    for (let type in mapJs) {
      const mapType = mapJs[type];

      if (!mapType.code) {
        continue;
      }

      if (mapJs[type].ids.length == 1) {
        code += `const param = window.globalScriptParams['${mapJs[type].ids[0]}'];
        ${this.renderRefreshJs(mapType, "param")}`;
      } else {
          if (isFunctionEmpty(mapType.code)) {
            continue;
          }
          code += `
            var ids = ${JSON.stringify(mapJs[type].ids)};
            var params = ids.map(id => window.globalScriptParams[id])
            for (var i = 0, len = params.length; i < len; i++) {
              ${this.renderRefreshJs(mapType, "params[i]")};
            }`;  
      }
    }

    return code;
  }

  private static mapScripts(scripts: ScriptSubComponent[]) {
    const mapJs: { [key: string]: MapJsItem } = {};

    scripts.forEach(script => {
      const type = script.component.get('type')!;
      const id = script.component.getId();

      const scrStr = script.getScriptString();
      const scrProps = script.props;
      const includes = script.includes

      // If the script was updated, I'll put its code in a separate container
      if (script.get('scriptUpdated') && !scrProps) {
        mapJs[type + '-' + id] = { ids: [id], code: scrStr, includes };
      } else {
        const mapType = mapJs[type];

        if (mapType) {
          mapType.ids.push(id);
        } else {
          const res: MapJsItem = { ids: [id], code: scrStr, includes };

          mapJs[type] = res;
        }
      }
    });

    return mapJs;
  }

  get variables() {
    return this.get('variables');
  }

  get signals(): Record<string, ISignal> {
    return this.get('signals');
  }

  get slots(): Record<string, SlotType> {
    return this.get('slots');
  }

  get states(): Record<string, string> {
    return this.get('states');
  }


  get stateRefs(): Record<string, {subscription: {componentId: string, name: string}}> {
    return this.get('stateRefs');
  }

  get includes(): any[]{
    return this.get('includes') ?? [];
  }

  addStateRef(key: string, subscription: {componentId?: string, name?: string}){
    const { componentId, name } = subscription
    console.log("Test out states Fontos", this.component)
    if (componentId && name){
      const stateRefs = {...this.stateRefs, [key]: {subscription: {componentId, name}}}
      this.set("stateRefs", stateRefs);
      console.log("Test out states Fontos", this.stateRefs, stateRefs)
    }
  }

  // addStateRef(compId: string, key: string, subscription: {componentId?: string, name?: string}){
  //   const { componentId, name } = subscription
  //   console.log("Test out states Fontos", this.component)
  //   if (componentId && name){
  //     const stateRefs = {...this.stateRefs, [compId]: {...this.stateRefs[compId], [key]: {componentId, name}}}
  //     this.set("stateRefs", stateRefs);
  //     console.log("Test out states Fontos", this.stateRefs, stateRefs)
  //   }
  // }
  removeStateRef(name: string){
    delete this.slots[name]
  }
}
