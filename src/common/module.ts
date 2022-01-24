import { Collection } from "backbone";
import { EditorConfig } from "editor/config/config";
import EditorModel from "editor/model/Editor";
import { isString, isElement, isArray } from "underscore";
import { createId } from "utils/mixins";

export interface IModule {
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  getConfig(): ModuleConfig;
  onLoad?(): void;
  name: string;
  postRender?(view: any): void;
}
export interface IViewableModule extends IModule {
  onLoad(): void;
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  postRender(view: any): void;
}
export abstract class ModuleConfig {
  protected abstract stylePrefix?: string;
  private: boolean = false;
  abstract name: string;
  module: Module;
  em: EditorModel;
  pfx: string;
  public get ppfx() {return this.pfx + this.stylePrefix || ''}

  constructor(em: EditorModel, module: Module) {
    const config = em.getConfig();
    this.pfx = config.stylePrefix || "";
    this.module = module;
    this.em = em;
    //console.log(module.name)
    const moduleConfig:{[id: string]: any} = config[module.name as keyof EditorConfig]
    if (moduleConfig){
      for (const key in moduleConfig) {
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          console.log(key)
          const element = moduleConfig[key];
          
        }
      }
    }
  }
}

export abstract class Module<T extends ModuleConfig = ModuleConfig>
  implements IModule {
  //conf: CollectionCollectionModuleConfig;
  em: EditorModel;

  cls: any[] = [];
  events: any;
  config: T;
  constructor(
    em: EditorModel,
    confClass: { new (em: EditorModel, module: Module<T>): T }
  ) {
    this.em = em;
    this.config = new confClass(em, this);
  }
  //abstract name: string;
  private: boolean = false;
  onLoad?(): void;
  init(cfg: any) {}
  abstract destroy(): void;
  postLoad(key: any): void {}

  get name(): string {
    return this.getConfig().name;
  }
  getConfig() {
    return this.config || {};
  }

  __logWarn(str: string) {
    this.em.logWarning(`[${this.name}]: ${str}`);
  }
  postRender?(view: any): void;
}

export interface IStorableModule extends IModule {
  storageKey: string[] | string;
  store(result: any): any;
  load(keys: string[]): void;
  postLoad(key: any): any;
}

export interface ICollectionModule {
  name: string;
  private: boolean;
  onLoad: boolean | any;
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  postRender?(view: any): void;
}

export default abstract class CollectionModule<
  TConf extends ModuleConfig,
  TModel extends Collection
> extends Module<TConf> {
  cls: any[] = [];
  protected all: TModel;
  events: any;

  constructor(
    em: EditorModel,
    confClass: { new (em: EditorModel, module: Module<TConf>): TConf },
    all: any,
    events: any
  ) {
    super(em, confClass);
    this.all = all;
    this.events = events;
    this.__initListen();
  }

  private: boolean = false;
  abstract init(cfg: any): void;
  abstract destroy(): void;
  postLoad(key: any): void {}
  abstract postRender(view: any): void;
  abstract render(): any;

  getAll() {
    return this.all;
  }

  getAllMap() {
    return this.getAll().reduce((acc: { [id: string]: TModel }, i: any) => {
      acc[i.get(i.idAttribute)] = i;
      return acc;
    }, {});
  }

  __initListen(opts: any = {}) {
    const { all, em, events } = this;
    all &&
      em &&
      all
        .on("add", (m: any, c: any, o: any) => em.trigger(events.add, m, o))
        .on("remove", (m: any, c: any, o: any) =>
          em.trigger(events.remove, m, o)
        )
        .on("change", (p: any, c: any) =>
          em.trigger(events.update, p, p.changedAttributes(), c)
        )
        .on("all", this.__catchAllEvent, this);
    // Register collections
    this.cls = [all].concat(opts.collections || []);
    // Propagate events
    ((opts.propagate as any[]) || []).forEach(({ entity, event }) => {
      entity.on("all", (ev: any, model: any, coll: any, opts: any) => {
        const options = opts || coll;
        const opt = { event: ev, ...options };
        [em, all].map(md => md.trigger(event, model, opt));
      });
    });
  }

  __remove(model: any, opts: any = {}) {
    const { em } = this;
    //@ts-ignore
    const md = isString(model) ? this.get(model) : model;
    const rm = () => {
      md && this.all.remove(md, opts);
      return md;
    };
    !opts.silent && em?.trigger(this.events.removeBefore, md, rm, opts);
    return !opts.abort && rm();
  }

  __catchAllEvent(event: any, model: any, coll: any, opts: any) {
    const { em, events } = this;
    const options = opts || coll;
    em && events.all && em.trigger(events.all, { event, model, options });
    this.__onAllEvent();
  }

  __appendTo() {
    //@ts-ignore
    const elTo = this.getConfig().appendTo;

    if (elTo) {
      const el = isElement(elTo) ? elTo : document.querySelector(elTo);
      if (!el) return this.__logWarn('"appendTo" element not found');
      el.appendChild(this.render());
    }
  }

  __onAllEvent() {}

  _createId(len = 16) {
    const all = this.getAll();
    const ln = all.length + len;
    const allMap = this.getAllMap();
    let id;

    do {
      id = createId(ln);
    } while (allMap[id]);

    return id;
  }

  __destroy() {
    this.cls.forEach(coll => {
      coll.stopListening();
      coll.reset();
    });
    //this.conf.em = undefined;
  }
}