/**
 * You can customize the initial state of the module from the editor initialization
 * ```js
 * const editor = grapesjs.init({
 *  ....
 *  pageManager: {
 *    pages: [
 *      {
 *        id: 'page-id',
 *        styles: `.my-class { color: red }`, // or a JSON of styles
 *        component: '<div class="my-class">My element</div>', // or a JSON of components
 *      }
 *   ]
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const pageManager = editor.Pages;
 * ```
 *
 * ## Available Events
 * * `page:add` - Added new page. The page is passed as an argument to the callback
 * * `page:remove` - Page removed. The page is passed as an argument to the callback
 * * `page:select` - New page selected. The newly selected page and the previous one, are passed as arguments to the callback
 * * `page:update` - Page updated. The updated page and the object containing changes are passed as arguments to the callback
 * * `page` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback
 *
 * ## Methods
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllWrappers](#getallwrappers)
 * * [getMain](#getmain)
 * * [remove](#remove)
 * * [select](#select)
 * * [getSelected](#getselected)
 *
 * [Page]: page.html
 * [Component]: component.html
 *
 * @module Pages
 */

 import { isString, bindAll, unique, flatten, any } from "underscore";
 import { createId } from "utils/mixins";
 import { Model } from "backbone";
 import Pages from "./model/Pages";
 import Page from "./model/Page";
 import { IStorableModule, Module, ModuleConfig } from "common/module";
 import EditorModel from "editor/model/Editor";
 import Component from "dom_components/model/Component";
 
 export const evAll = "page";
 export const evPfx = `${evAll}:`;
 export const evPageSelect = `${evPfx}select`;
 export const evPageSelectBefore = `${evPageSelect}:before`;
 export const evPageUpdate = `${evPfx}update`;
 export const evPageAdd = `${evPfx}add`;
 export const evPageAddBefore = `${evPageAdd}:before`;
 export const evPageRemove = `${evPfx}remove`;
 export const evPageRemoveBefore = `${evPageRemove}:before`;
 const chnSel = "change:selected";
 const typeMain = "main";
 
 const events = {
   all: evAll,
   select: evPageSelect,
   selectBefore: evPageSelectBefore,
   update: evPageUpdate,
   add: evPageAdd,
   addBefore: evPageAddBefore,
   remove: evPageRemove,
   removeBefore: evPageRemoveBefore
 };
 export class PageManagerConfig extends ModuleConfig {
   constructor(em: EditorModel, module: Module) {
     super(em, module);
     const { config } = em;
     this.stm = em.StorageManager;
     const modConf = config.pageManager;
     if (modConf?.pages) {
       this.pages = modConf.pages;
     }
   }
 
   name = "PageManager";
   protected stylePrefix = undefined;
   pages: any;
   stm: any;
 }
 
 export default class PageManagerModule extends Module<PageManagerConfig>
   implements IStorableModule {
   constructor(em: EditorModel) {
     super(em, PageManagerConfig);
     bindAll(this, "_onPageChange");
     const pages = new Pages(this.config.pages, { config: this.config, em: em });
     this.pages = pages;
     const model = new Model({ _undo: true });
     this.model = model;
     pages.on("add", (p, c, o) => em.trigger(evPageAdd, p, o));
     pages.on("remove", (p, c, o) => em.trigger(evPageRemove, p, o));
     pages.on("change", (p, c) => {
       em.trigger(evPageUpdate, p, p.changedAttributes(), c);
     });
     pages.on("reset", coll => coll.at(0) && this.select(coll.at(0)));
     pages.on("all", this.__onChange, this);
     model.on(chnSel, this._onPageChange);
   }
   events = events;
 
   storageKey = "pages";
 
   pages: Pages;
 
   model: Model;
 
   /**
    * Initialize module
    * @param {Object} config Configurations
    * @private
    */
   init(opts = {}) {
     return this;
   }
 
   __onChange(event: string, page: Page, coll?: any, opts?: any) {
     const options = opts || coll;
     this.em.trigger(evAll, { event, page, options });
   }
 
   onLoad() {
     const { pages } = this;
     const opt = { silent: true };
     pages.add(this.config.pages || [], opt);
     const mainPage = !pages.length
       ? this.add({ type: typeMain }, opt)
       : this.getMain();
     this.select(mainPage as Page, opt);
   }
 
   _onPageChange(m: any, page: Page, opts: any) {
     const { em } = this;
     const lm = em.LayerManager;
     const mainComp = page.getMainComponent();
     lm && mainComp && lm.setRoot(mainComp);
     em.trigger(evPageSelect, page, m.previous("selected"));
     this.__onChange(chnSel, page, opts);
   }
 
   postLoad() {
     const { em, model } = this;
     const um = em.UndoManager;
     um && um.add(model);
     um && um.add(this.pages);
   }
 
   /**
    * Add new page
    * @param {Object} props Page properties
    * @param {Object} [opts] Options
    * @returns {[Page]}
    * @example
    * const newPage = pageManager.add({
    *  id: 'new-page-id', // without an explicit ID, a random one will be created
    *  styles: `.my-class { color: red }`, // or a JSON of styles
    *  component: '<div class="my-class">My element</div>', // or a JSON of components
    * });
    */
   add(props: any, opts: any = {}): false | Page {
     const { em } = this;
     props.id = props.id || this._createId();
     const add = (): Page => {
       const page = this.pages.add(props, opts);
       opts.select && this.select(page);
       return page;
     };
     !opts.silent && em.trigger(evPageAddBefore, props, add, opts);
     return !opts.abort && add();
   }
 
   /**
    * Remove page
    * @param {String|[Page]} page Page or page id
    * @returns {[Page]} Removed Page
    * @example
    * const removedPage = pageManager.remove('page-id');
    * // or by passing the page
    * const somePage = pageManager.get('page-id');
    * pageManager.remove(somePage);
    */
   remove(page: any, opts: any = {}) {
     const { em } = this;
     const pg = isString(page) ? this.get(page) : page;
     const rm = () => {
       pg && this.pages.remove(pg, opts);
       return pg;
     };
     !opts.silent && em.trigger(evPageRemoveBefore, pg, rm, opts);
     return !opts.abort && rm();
   }
 
   /**
    * Get page by id
    * @param {String} id Page id
    * @returns {[Page]}
    * @example
    * const somePage = pageManager.get('page-id');
    */
   get(id: string) {
     return this.pages.filter(p => p.get("id") === id)[0];
   }
 
   /**
    * Get main page (the first one available)
    * @returns {[Page]}
    * @example
    * const mainPage = pageManager.getMain();
    */
   getMain(): Page {
     const { pages } = this;
     return pages.filter(p => p.get("type") === typeMain)[0] || pages.at(0);
   }
 
   /**
    * Get all pages
    * @returns {Array<[Page]>}
    * @example
    * const arrayOfPages = pageManager.getAll();
    */
   getAll(): Page[] {
     return [...this.pages.models];
   }
 
   /**
    * Get wrapper components (aka body) from all pages and frames.
    * @returns {Array<[Component]>}
    * @example
    * const wrappers = pageManager.getAllWrappers();
    * // Get all `image` components from the project
    * const allImages = wrappers.map(wrp => wrp.findType('image')).flat();
    */
   getAllWrappers(): Component[] {
     const pages = this.getAll();
     return unique(
       flatten(
         pages.map(page =>
           page.getAllFrames().map(frame => frame.getComponent())
         )
       )
     );
   }
 
   getAllMap() {
     return this.getAll().reduce((acc: { [id: string]: Page }, p: Page) => {
       acc[p.get("id")] = p;
       return acc;
     }, {});
   }
 
   /**
    * Change the selected page. This will switch the page rendered in canvas
    * @param {String|[Page]} page Page or page id
    * @returns {this}
    * @example
    * pageManager.select('page-id');
    * // or by passing the page
    * const somePage = pageManager.get('page-id');
    * pageManager.select(somePage);
    */
   select(page: string | Page, opts = {}) {
     const pg = isString(page) ? this.get(page) : page;
     if (pg) {
       this.em.trigger(evPageSelectBefore, pg, opts);
       this.model.set("selected", pg, opts);
     }
     return this;
   }
 
   /**
    * Get the selected page
    * @returns {[Page]}
    * @example
    * const selectedPage = pageManager.getSelected();
    */
   getSelected(): Page {
     return this.model.get("selected");
   }
 
   destroy() {
     this.pages.off().reset();
     this.model.stopListening();
     this.model.clear({ silent: true });
     //@ts-ignore
     ["selected", "pages", "model"].map(i => (this[i] = 0));
   }
 
   store(noStore: boolean) {
     if (!this.em.get("hasPages")) return {};
     const obj: any = {};
     const cnf = this.config;
     obj[this.storageKey] = JSON.stringify(this.getAll());
     if (!noStore && cnf.stm) cnf.stm.store(obj);
     return obj;
   }
 
   load(data: any = {}) {
     const key = this.storageKey;
     let res = data[key] || [];
 
     if (typeof res == "string") {
       try {
         res = JSON.parse(data[key]);
       } catch (err) {}
     }
 
     res && res.length && this.pages.reset(res);
 
     return res;
   }
 
   _createId() {
     const pages = this.getAll();
     const len = pages.length + 16;
     const pagesMap = this.getAllMap();
     let id;
 
     do {
       id = createId(len);
     } while (pagesMap[id]);
 
     return id;
   }
 }