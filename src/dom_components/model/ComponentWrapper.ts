import Component from './Component';
import ScriptSubComponent, { ScriptData } from './modules/ScriptSubComponent';
import { ComponentOptions } from './types';
import TaitUrl from '../../common/traits/model/js-traits/TraitUrl';
import { getMetaVariable } from './modules/MetaVariableTypes';
import { isString } from 'underscore';
import Signal from './modules/Signal';

export default class ComponentWrapper extends Component {
  get defaults() {
    return {
      // @ts-ignore
      ...super.defaults,
      tagName: 'body',
      removable: false,
      copyable: false,
      draggable: false,
      components: [],
      script: '',
      'script-props': ['ajax'], //This cause the editor drag drop feature to freeze
      'script-global': [{ id: 'ajax', type: 'data-list' }],
      'script-events': [{ id: 'ajax', params: { type: 'object', inner: { data: { type: 'single' } } } }],
      ajax: {
        users: {
          url: {
            "url": "https://reqres.in/api/users?page=<page>",
            "variables": {
                "page": {
                    "variableType": "parameter",
                    "data": {
                        "default": "1"
                    }
                }
            }
        },
          urlRaw: 'https://reqres.in/api/users?page=2',
          dataSrc: 'data',
          dataIds: ['id', 'email', 'first_name', 'last_name', 'avatar'],
          optType : {
            "type": "list",
            "itemType": {
                "type": "object",
                "params": {
                    "id": {
                        "type": "string"
                    },
                    "email": {
                        "type": "string"
                    },
                    "first_name": {
                        "type": "string"
                    },
                    "last_name": {
                        "type": "string"
                    },
                    "avatar": {
                        "type": "string"
                    }
                }
            }
        }
        },
        user: {
          url: {
            "url": "https://reqres.in/api/users/<page>",
            "variables": {
                "page": {
                    "variableType": "parameter",
                    "data": {
                        "default": "1"
                    }
                }
            }
        },
          urlRaw: 'https://reqres.in/api/users/2',
          dataSrc: 'data',
          dataIds: ['id', 'email', 'first_name', 'last_name', 'avatar'],
          optType : {
                "type": "object",
                "params": {
                    "id": {
                        "type": "string"
                    },
                    "email": {
                        "type": "string"
                    },
                    "first_name": {
                        "type": "string"
                    },
                    "last_name": {
                        "type": "string"
                    },
                    "avatar": {
                        "type": "string"
                    }
                }
        }
        },
      },
      traits: [
        {
          name: 'ajax',
          label: 'ajax',
          type: 'unique-list',
          changeProp: true,
          traits: {
            type: 'object',
            traits: [
              { name: 'url', type: 'url' },
              { name: 'dataType', type: 'select', options: ["single", 'list']}
              // { name: 'signal', label: 'onLoad', type: 'signal' },
            ],
          },
        },
        {
          name: 'variables',
          label: 'variables',
          type: 'unique-list',
          changeProp: true,
          traits: { type: 'function' },
        },
      ],
      stylable: [
        'background',
        'background-color',
        'background-image',
        'background-repeat',
        'background-attachment',
        'background-position',
        'background-size',
      ],
    };
  }

  dataIds: { [id: string]: string[] } = {};

  constructor(props = {}, opt: ComponentOptions = {}) {
    super(props, opt);
    console.log("fromSiteComponentReset")
    this.renderAjaxScripts();
    this.on(
      'change:ajax change:variables',
      () => {
        console.log('fromSiteurlTestTriggerChange', this);
        this.renderAjaxScripts();
        //.map(([name, params]) => { return[name, function(){}]})});
        this.dataIds = {};
        // Object.entries(this.data).map(([id, value]) => (value.url && value.dataSrc) && eval(`(${this.ajaxFunctionTemplate(value)})`)()
        // .done((data: any) => this.dataIds[id] = Object.keys(data[value.dataSrc][0])) )
        // console.log(this.dataIds)
        // this.view?.render()
      },
      this
    );
  }

  private renderAjaxScripts() {
    const { ajax, variables } = this;

    const slots = Object.fromEntries(
      Object.entries(ajax).map(([name, slot]) => [
        name,
        {
          script: `(opts)=>{
            var cachedInput;
            var cachedData;
            const loadedSignal = opts.signals['${name}']
            return (i, done)=>{
      ${
        slot.url
          ? `const url = ${TaitUrl.renderJs(slot.url, 'i.data')};
          if (cachedInput != i.data || typeof cachedData == 'undefined'){
            url && $.get(url).done(data => {
              console.log("fromSite", data)
              loadedSignal(${slot.url['dataSrc'] ? `data["${slot.url['dataSrc']}"]` : 'data'}, data)
              cachedData = data;
              cachedInput = i.data;
            });
          }
          else {
            loadedSignal(${slot.url['dataSrc'] ? `cachedData["${slot.url['dataSrc']}"]` : 'cachedData'}, cachedData)
          }
            ` : ''
      }
          }
        }`,
      params: Object.fromEntries<{type: 'string'}>(Object.entries<any>(slot?.url?.variables ?? {})
          .filter(([name, variable]) => variable?.variableType == 'parameter' ).map(([name, a]) => [name, {type: 'string'}]))
        },
      ])
    );
    
    const window: any & Window = this.em.Canvas.getWindow();
    const signals = Object.fromEntries(Object.keys(ajax).map(key =>  [`${key}`,
    new Signal(this.getId(), key, {}).asyncMetaData((async ()=>{
      const url = TaitUrl.renderJs(this.ajax[key].url);
      const result = await $?.get(isString(url) && window.eval(url))
      return getMetaVariable(result.data)
    })())
  //   { componentId: this.getId(), 
  //     slot: key, 
  //     optType: {type: 'unkown'} as any,
  //     refresh: this.ajax[key].url && (() => { 
  //       var results = {type: 'unkown'}
  //       const url = TaitUrl.renderJs(this.ajax[key].url);
  //        return $?.get && $?.get(isString(url) && eval(url)).then(
  //         r => results = getMetaVariable(r.data)
  //       );
  //     })()
  // }
]));

    const main =  `((opts) =>{
     ${Object.keys(ajax).map(name => `opts.slots['${name}']({});`).join('')}})`
    this.set('script', { main, props: [], signals, slots, variables });
    // console.log('setValueValScript', variables);
    // console.log('testtestAjaxSignals', signals);
    // console.log('testtestAjaxVariables', variables);
    // console.log('fromSitetesttestAjax', this.slots);
  }
  //   (class {
  //     static data = (()=>{
  //     var data = undefined;
  //     const url = "${url}";
  //     var defaultOpts = {}

  //     return function(opts) {
  //     console.log(defaultOpts)
  //     console.log(opts)
  //     if (typeof data ==='undefined' || !(JSON.stringify(defaultOpts) == JSON.stringify(opts))){
  //         console.log("defining it")
  //         data = $.get( "https://reqres.in/api/users?page=2")//, { name: "John", time: "2pm" } )
  //         .done(( d ) => {data = d; console.log(d)})
  //         // console.log(ajax.responseJSON)
  //         // data = "flaksjf"
  //     }
  //     console.log(data.responseJSON)
  //     return data.responseJSON
  // }})()
  // })

  private ajaxFunctionTemplate(value: any) {
    return `function(){
      let savedOpts = {url: "${value.url}"};
      let result;
      return function(opts){
        if (typeof data === "undefined" || JSON.stringify({...opts, url: "${value.url}"}) != JSON.stringify(savedOpts)){
          savedOpts = opts;
          result = $.get("${value.url}")
        }
        return result;
      }
    }()`;
  }
  // get globalScript(){
  //   const {ajax, ccid} = this;
  //   return `
  //     window.${ccid}ScopedVariables = {${Object.entries(ajax).map(([id, value]) =>
  //       `"${id}": ${this.ajaxFunctionTemplate(value)}`).join(",")}};
  //     `
  // }

  renderJsDataUsage(id: string) {
    const { ajax, ccid } = this;
    if (typeof this.ajax[id] === 'undefined') {
      console.error('Selected data variable is missing');
      return;
    }
    console.log(ajax[id]);
    const dataFn = ajax[id]['dataSrc'] ? `data["${ajax[id]['dataSrc']}"]` : 'data';
    const jsString = `(function(callback){window.${ccid}ScopedVariables['${id}']().done((data)=>callback(${dataFn}))})`;
    let dataIds = this.dataIds[id];
    return { dataIds, jsString };
  }

  get ajax(): { [id: string]: any } {
    return this.get('ajax');
  }

  get variables(): { [id: string]: any } {
    return this.get('variables');
  }

  __postAdd() {
    const um = this.em?.UndoManager;
    !this.__hasUm && um?.add(this);
    return super.__postAdd();
  }

  __postRemove() {
    const um = this.em?.UndoManager;
    um?.remove(this);
    return super.__postRemove();
  }

  static isComponent() {
    return false;
  }
}
