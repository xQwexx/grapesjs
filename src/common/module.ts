import { EditorConfig } from "editor/config/config";
import EditorModel from "editor/model/Editor";
import { isString, isElement } from "underscore";
import { createId } from "utils/mixins";

export interface IStorableModule extends IModule {
  storageKey: string[];
  store(result: any): any;
  load(keys: string[]): void;
  postLoad(key: any): any;
}

export interface IModule {
  name: string;
  private: boolean;
  onLoad: boolean | any;
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  postRender(view: any): void;
}

export class ModuleConfig {
  em: EditorModel;
  pStylePrefix: string;

  constructor(em: EditorModel) {
    const config = em.getConfig();
    this.pStylePrefix = config.stylePrefix || "";
    this.em = em;
  }
}

export default abstract class Module implements IModule {
  conf: ModuleConfig;

  cls: any[] = [];
  private all: any;
  events: any;
  get em() {
    return this.conf.em;
  }
  constructor(config: ModuleConfig, all: any, events: any) {
    this.conf = config;
    this.all = all;
    this.events = events;
    this.__initListen();
  }
  abstract name: string;
  private: boolean = false;
  onLoad: boolean = false;
  abstract init(cfg: any): void;
  abstract destroy(): void;
  postLoad(key: any): void {}
  abstract postRender(view: any): void;
  abstract render(): any;

  getConfig() {
    return this.conf || {};
  }

  getAll() {
    return this.all ? this.all : [];
  }

  getAllMap() {
    return this.getAll().reduce((acc: any[], i: any) => {
      console.log(i);
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

  __logWarn(str: string) {
    this.em.logWarning(`[${this.name}]: ${str}`);
  }

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
