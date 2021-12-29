import {
  isUndefined,
  isFunction,
  isArray,
  contains,
  toArray,
  keys,
  bindAll
} from "underscore";
import Backbone, { ModelBase } from "backbone";
import $ from "utils/cash-dom";
import Extender from "utils/extender";
import { getModel, hasWin } from "utils/mixins";
import Selected from "./Selected";
import { EditorConfig } from "../config/config";
import tr from "i18n/locale/tr";

//@ts-ignore
Backbone.$ = $;

const deps: Function[] = [
  require("utils").default,
  require("i18n").default,
  require("keymaps").default,
  require("undo_manager").default,
  require("storage_manager").default,
  require("device_manager").default,
  require("parser").default,
  require("style_manager").default,
  require("selector_manager").default,
  require("modal_dialog").default,
  require("code_manager").default,
  require("panels").default,
  require("rich_text_editor").default,
  require("asset_manager").default,
  require("css_composer").default,
  require("pages").default,
  require("trait_manager").default,
  require("dom_components").default,
  require("navigator").default,
  require("canvas").default,
  require("commands").default,
  require("block_manager").default
];

Extender({
  //@ts-ignore
  Backbone: Backbone,
  $: Backbone.$,
});

const logs: { [id: string]: (...args: any[]) => void } = {
  debug: console.log,
  info: console.info,
  warning: console.warn,
  error: console.error,
};

export type DragMode = boolean | "absolute" | "translate";
export type DeviceMode = "Desktop" | "Tablet" | "Mobile";

export interface IStorableModule extends IModule {
  storageKey: string[];
  store(result: any): any;
  load(keys: string[]): void;
  postLoad(key: any): any;
}

export interface IModule {
  name: string;
  private: boolean;
  onLoad: boolean;
  init(cfg: any): void;
  destroy(): void;
  postLoad(key: any): any;
  postRender(view: any): void;
}

export interface IEditorModel extends ModelBase {
  config: EditorConfig;
  editing: any;
  selected: Selected;
  //clipboard: null;
  dmode: boolean | any;
  //componentHovered: null;
  //previousModel: null;
  //changesCount: boolean;
  storables: IStorableModule[];
  modules: IModule[];
  toLoad: any[];
  //opened: {};
  device: DeviceMode;
  hasPages: any;

  init(editor: any, opts?: any): void;
}
export default class EditorModel extends Backbone.Model
  implements IEditorModel {
  defaults() {
    return {
      editing: false,
      clipboard: null,
      dmode: false,
      componentHovered: null,
      previousModel: null,
      changesCount: false,
      opened: {},
      device: '',
    };
  }

  initialize(c: EditorConfig = {}) {
    this.config = c;
    this.set("Config", c);
    this.set("toLoad", []);
    this.dmode = c.dragMode as DragMode;
    //@ts-ignore
    this.hasPages == !!c.pageManager;
    const el = c.el;
    const log = c.log;
    const toLog = log === true ? keys(logs) : isArray(log) ? log : [];
    bindAll(this, "initBaseColorPicker");

    if (el && c.fromElement) this.config.components = el.innerHTML;
    this.attrsOrig = el
      ? toArray(el.attributes).reduce(
          (res: { [id: string]: string | null }, next) => {
            res[next.nodeName] = next.nodeValue;
            return res;
          },
          {}
        )
      : "";

    // Load modules
    deps.forEach(name => this.loadModule(name));
    this.on("change:componentHovered", this.componentHovered, this);
    this.on("change:changesCount", this.updateChanges, this);
    this.on("change:readyLoad change:readyCanvas", this._checkReady, this);
    toLog.forEach(e => this.listenLog(e));

    // Deprecations
    [{ from: "change:selectedComponent", to: "component:toggled" }].forEach(
      event => {
        const eventFrom = event.from;
        const eventTo = event.to;
        this.listenTo(this, eventFrom, (...args) => {
          this.trigger(eventTo, ...args);
          this.logWarning(
            `The event '${eventFrom}' is deprecated, replace it with '${eventTo}'`
          );
        });
      }
    );
  }
  cacheLoad: any;
  attrsOrig: any;
  destroyed: boolean = true;
  defaultRunning: boolean = true;
  view: any;

  timedInterval?: number;
  updateItr?: number;

  get editing() {
    const res = this.get("editing");
    return (res && res.model) || null;
  }

  set editing(value: boolean | any) {
    this.set("editing", value);
  }

  get selected(): Selected {
    const res = this.get("selected");
    return isUndefined(res)
      ? this.set("selected", new Selected()).get("selected")
      : res;
  }

  get modules(): IModule[] {
    const res = this.get("modules");
    return isUndefined(res) ? this.set("modules", []).get("modules") : res;
  }

  get storables(): IStorableModule[] {
    const res = this.get("storables");
    return isUndefined(res) ? this.set("storables", []).get("storables") : res;
  }

  get toLoad(): any[] {
    const res = this.get("toLoad");
    console.log(res);
    return isUndefined(res) ? this.set("toLoad", []).get("toLoad") : res;
  }

  get dmode() {
    return this.get("dmode");
  }

  set dmode(value: DragMode) {
    this.set("dmode", value);
  }

  get device() {
    return this.get("device");
  }

  set device(value: DeviceMode) {
    this.set("device", value);
  }

  get hasPages() {
    return this.get("hasPages");
  }

  set hasPages(value: any) {
    this.set("hasPages", value);
  }

  get config() {
    return this.get("config");
  }

  set config(value: any) {
    this.set("config", value);
  }

  _checkReady() {
    if (
      this.get("readyLoad") &&
      this.get("readyCanvas") &&
      !this.get("ready")
    ) {
      this.set("ready", true);
    }
  }

  getContainer() {
    return this.config.el;
  }

  listenLog(event: string) {
    this.listenTo(this, `log:${event}`, logs[event]);
  }

  /**
   * Get configurations
   * @param  {string} [prop] Property name
   * @return {any} Returns the configuration object or
   *  the value of the specified property
   */
  getConfig(prop?: keyof EditorConfig) {
    const config = this.config;
    return isUndefined(prop) ? config : config[prop];
  }

  /**
   * Should be called after all modules and plugins are loaded
   * @param {Function} clb
   * @private
   */
  loadOnStart(clb?: Function) {
    const sm = this.get("StorageManager");

    // Generally, with `onLoad`, the module will try to load the data from
    // its configurations

    this.toLoad.forEach(module => {
      module.onLoad();
    });

    // Stuff to do post load
    const postLoad = () => {
      this.modules.forEach(module => module.postLoad && module.postLoad(this));
      this.set("readyLoad", 1);
      clb && clb();
    };

    if (sm && sm.canAutoload()) {
      this.load(postLoad);
    } else {
      setTimeout(postLoad);
    }
  }

  /**
   * Set the alert before unload in case it's requested
   * and there are unsaved changes
   * @private
   */
  updateChanges() {
    const stm = this.get("StorageManager");
    const changes = this.get("changesCount");
    this.updateItr && clearTimeout(this.updateItr);
    //@ts-ignore
    this.updateItr = setTimeout(() => this.trigger("update"));

    if (this.config.noticeOnUnload) {
      window.onbeforeunload = changes ? (e: any) => true : null;
    }

    if (stm.isAutosave() && changes >= stm.getStepsBeforeSave()) {
      this.store();
    }
  }

  /**
   * Load generic module
   * @param {String} moduleName Module name
   * @return {this}
   * @private
   */
  loadModule(Module: any) {
    const { config } = this;
    const Mod = new Module() as IModule;
    const name = (Mod.name.charAt(0).toLowerCase() +
      Mod.name.slice(1)) as keyof EditorConfig;
    const cfgParent = !isUndefined(config[name])
      ? config[name]
      : config[Mod.name as keyof EditorConfig];
    const cfg = cfgParent === true ? {} : cfgParent || {};
    const sm = this.get("StorageManager");
    cfg.pStylePrefix = config.stylePrefix || "";

    if (!isUndefined(cfgParent) && !cfgParent) {
      cfg._disable = 1;
    }

    //@ts-ignore
    if (Mod.storageKey && Mod.store && Mod.load && sm) {
      cfg.stm = sm;
      // DomComponents should be load before CSS Composer
      const mth = name == "domComponents" ? "unshift" : "push";
      this.storables[mth](Mod as IStorableModule);
    }

    cfg.em = this;
    Mod.init({ ...cfg });

    // Bind the module to the editor model if public
    !Mod.private && this.set(Mod.name, Mod);
    Mod.onLoad && this.toLoad.push(Mod);
    this.modules.push(Mod);
    return this;
  }

  /**
   * Initialize editor model and set editor instance
   * @param {Editor} editor Editor instance
   * @return {this}
   * @private
   */
  init(editor: any, opts = {}) {
    if (this.destroyed) {
      this.initialize(opts);
      this.destroyed = false;
    }
    this.set("Editor", editor);
  }

  getEditor() {
    return this.get("Editor");
  }

  /**
   * This method handles updates on the editor and tries to store them
   * if requested and if the changesCount is exceeded
   * @param  {Object} model
   * @param  {any} val  Value
   * @param  {Object} opt  Options
   * @private
   * */
  handleUpdates(model: Object, val: any, opt: any = {}) {
    // Component has been added temporarily - do not update storage or record changes
    if (opt.temporary || opt.noCount || opt.avoidStore || !this.get("ready")) {
      return;
    }

    this.timedInterval && clearTimeout(this.timedInterval);
    //@ts-ignore
    this.timedInterval = setTimeout(() => {
      const curr = this.get("changesCount") || 0;
      const { unset, ...opts } = opt;
      this.set("changesCount", curr + 1, opts);
    }, 0);
  }

  changesUp(opts: any) {
    this.handleUpdates(0, 0, opts);
  }

  /**
   * Callback on component hover
   * @param   {Object}   Model
   * @param   {Mixed}   New value
   * @param   {Object}   Options
   * @private
   * */
  componentHovered(editor: any, component: any, options: any) {
    const prev = this.previous("componentHovered");
    prev && this.trigger("component:unhovered", prev, options);
    component && this.trigger("component:hovered", component, options);
  }

  /**
   * Returns model of the selected component
   * @return {Component|null}
   * @private
   */
  getSelected() {
    return this.selected.lastComponent();
  }

  /**
   * Returns an array of all selected components
   * @return {Array}
   * @private
   */
  getSelectedAll(): any[] {
    return this.selected.allComponents();
  }

  /**
   * Select a component
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  setSelected(el: any[], opts: any = {}) {
    const { event } = opts;
    const ctrlKey = event && (event.ctrlKey || event.metaKey);
    const { shiftKey } = event || {};
    const multiple = isArray(el);
    const els = (multiple ? el : [el]).map((el) => getModel(el, $));
    const selected = this.getSelectedAll();
    const mltSel = this.getConfig("multipleSelection");
    let added;

    // If an array is passed remove all selected
    // expect those yet to be selected
    multiple && this.removeSelected(selected.filter((s) => !contains(els, s)));

    let min: number, max: number;
    els.forEach(el => {
      const model = getModel(el, $);
      if (model && !model.get("selectable")) return;

      // Hanlde multiple selection
      if (ctrlKey && mltSel) {
        return this.toggleSelected(model);
      } else if (shiftKey && mltSel) {
        this.clearSelection(this.get("Canvas").getWindow());
        const coll = model.collection;
        const index = model.index();

        // Fin min and max siblings
        this.getSelectedAll().forEach((sel) => {
          const selColl = sel.collection;
          const selIndex = sel.index();
          if (selColl === coll) {
            if (selIndex < index) {
              // First model BEFORE the selected one
              min = isUndefined(min) ? selIndex : Math.max(min, selIndex);
            } else if (selIndex > index) {
              // First model AFTER the selected one
              max = isUndefined(max) ? selIndex : Math.min(max, selIndex);
            }
          }
        });

        if (!isUndefined(min)) {
          while (min !== index) {
            this.addSelected(coll.at(min));
            min++;
          }
        }

        if (!isUndefined(max)) {
          while (max !== index) {
            this.addSelected(coll.at(max));
            max--;
          }
        }

        return this.addSelected(model);
      }

      !multiple && this.removeSelected(selected.filter((s) => s !== model));
      this.addSelected(model, opts);
      added = model;
    });
  }

  /**
   * Add component to selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  addSelected(el: any, opts: any = {}) {
    const model = getModel(el, $);
    const models = isArray(model) ? model : [model];

    models.forEach(model => {
      if (model && !model.get("selectable")) return;
      const selected = this.selected;
      opts.forceChange && this.removeSelected(model, opts);
      selected.addComponent(model, opts);
    });
  }

  /**
   * Remove component from selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  removeSelected(el: any, opts = {}) {
    this.selected.removeComponent(getModel(el, $), opts);
  }

  /**
   * Toggle component selection
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  toggleSelected(el: any, opts = {}) {
    const model = getModel(el, $);
    const models = isArray(model) ? model : [model];

    models.forEach(model => {
      if (this.selected.hasComponent(model)) {
        this.removeSelected(model, opts);
      } else {
        this.addSelected(model, opts);
      }
    });
  }

  /**
   * Hover a component
   * @param  {Component|HTMLElement} el Component to select
   * @param  {Object} [opts={}] Options, optional
   * @private
   */
  setHovered(el: any, opts: any = {}) {
    const model = getModel(el, $);
    if (model && !model.get("hoverable")) return;
    opts.forceChange && this.set("componentHovered", "");
    this.set("componentHovered", model, opts);
  }

  getHovered() {
    return this.get("componentHovered");
  }

  /**
   * Set components inside editor's canvas. This method overrides actual components
   * @param {Object|string} components HTML string or components model
   * @param {Object} opt the options object to be used by the [setComponents]{@link setComponents} method
   * @return {this}
   * @private
   */
  setComponents(components: Object | string, opt = {}) {
    return this.get("DomComponents").setComponents(components, opt);
  }

  /**
   * Returns components model from the editor's canvas
   * @return {Components}
   * @private
   */
  getComponents() {
    var cmp = this.get("DomComponents");
    var cm = this.get("CodeManager");

    if (!cmp || !cm) return;

    var wrp = cmp.getComponents();
    return cm.getCode(wrp, "json");
  }

  /**
   * Set style inside editor's canvas. This method overrides actual style
   * @param {Object|string} style CSS string or style model
   * @param {Object} opt the options object to be used by the `CssRules.add` method
   * @return {this}
   * @private
   */
  setStyle(style: Object | string, opt = {}) {
    const cssc = this.get("CssComposer");
    cssc.clear(opt);
    cssc.getAll().add(style, opt);
    return this;
  }

  /**
   * Add styles to the editor
   * @param {Array<Object>|Object|string} style CSS string or style model
   * @returns {Array<CssRule>}
   * @private
   */
  addStyle(style: Object | string, opts = {}) {
    const res = this.getStyle().add(style, opts);
    return isArray(res) ? res : [res];
  }

  /**
   * Returns rules/style model from the editor's canvas
   * @return {Rules}
   * @private
   */
  getStyle() {
    return this.get("CssComposer").getAll();
  }

  /**
   * Change the selector state
   * @param {String} value State value
   * @returns {this}
   */
  setState(value: string) {
    this.set("state", value);
    return this;
  }

  /**
   * Get the current selector state
   * @returns {String}
   */
  getState() {
    return this.get("state") || "";
  }

  /**
   * Returns HTML built inside canvas
   * @param {Object} [opts={}] Options
   * @returns {string} HTML string
   * @private
   */
  getHtml(opts: any = {}) {
    const { config } = this;
    const { optsHtml, exportWrapper, wrapperIsBody } = config;
    const js = config.jsInHtml ? this.getJs(opts) : "";
    const cmp = opts.component || this.get("DomComponents").getComponent();
    let html = cmp
      ? this.get("CodeManager").getCode(cmp, "html", {
          exportWrapper,
          wrapperIsBody,
          ...optsHtml,
          ...opts,
        })
      : "";
    html += js ? `<script>${js}</script>` : "";
    return html;
  }

  /**
   * Returns CSS built inside canvas
   * @param {Object} [opts={}] Options
   * @returns {string} CSS string
   * @private
   */
  getCss(opts: any = {}) {
    const config = this.config;
    const { optsCss, wrapperIsBody } = config;
    const avoidProt = opts.avoidProtected;
    const keepUnusedStyles = !isUndefined(opts.keepUnusedStyles)
      ? opts.keepUnusedStyles
      : config.keepUnusedStyles;
    const cssc = this.get("CssComposer");
    const wrp = opts.component || this.get("DomComponents").getComponent();
    const protCss = !avoidProt ? config.protectedCss : "";
    const css =
      wrp &&
      this.get("CodeManager").getCode(wrp, "css", {
        cssc,
        wrapperIsBody,
        keepUnusedStyles,
        ...optsCss,
        ...opts,
      });
    return wrp ? (opts.json ? css : protCss + css) : "";
  }

  /**
   * Returns JS of all components
   * @return {string} JS string
   * @private
   */
  getJs(opts: any = {}) {
    var wrp = opts.component || this.get("DomComponents").getWrapper();
    return wrp
      ? this.get("CodeManager")
          .getCode(wrp, "js")
          .trim()
      : "";
  }

  /**
   * Store data to the current storage
   * @param {Function} clb Callback function
   * @return {Object} Stored data
   * @private
   */
  store(clb?: Function) {
    const sm = this.get("StorageManager");
    if (!sm) return;

    const store = this.storeData();
    sm.store(store, (res: any) => {
      clb && clb(res, store);
      this.set("changesCount", 0);
      this.trigger("storage:store", store);
    });

    return store;
  }

  storeData() {
    let result = {};
    // Sync content if there is an active RTE
    this.editing?.trigger("sync:content", { noCount: true });

    this.storables.forEach(m => {
      result = { ...result, ...m.store(true) };
    });
    return result;
  }

  /**
   * Load data from the current storage
   * @param {Function} clb Callback function
   * @private
   */
  load(clb: Function) {
    this.getCacheLoad(true, (res: any) => {
      this.loadData(res);
      clb && clb(res);
    });
  }

  loadData(data = {}) {
    const sm = this.get("StorageManager");
    const result = sm.__clearKeys(data);

    this.storables.forEach(module => {
      module.load(result);
      module.postLoad && module.postLoad(this);
    });

    return result;
  }

  /**
   * Returns cached load
   * @param {Boolean} force Force to reload
   * @param {Function} clb Callback function
   * @return {Object}
   * @private
   */
  getCacheLoad(force: boolean, clb: Function) {
    if (this.cacheLoad && !force) return this.cacheLoad;
    const sm = this.get("StorageManager");
    const load: string[] = [];

    if (!sm) return {};

    this.storables.forEach(m => {
      let key = m.storageKey;
      key = isFunction(key) ? key() : key;
      const keys = isArray(key) ? key : [key];
      keys.forEach((k) => load.push(k));
    });

    sm.load(load, (res: any) => {
      this.cacheLoad = res;
      clb && clb(res);
      setTimeout(() => this.trigger("storage:load", res));
    });
  }

  /**
   * Returns device model by name
   * @return {Device|null}
   * @private
   */
  getDeviceModel() {
    var name = this.get("device");
    return this.get("DeviceManager").get(name);
  }

  /**
   * Run default command if setted
   * @param {Object} [opts={}] Options
   * @private
   */
  runDefault(opts = {}) {
    var command = this.get("Commands").get(this.config.defaultCommand);
    if (!command || this.defaultRunning) return;
    command.stop(this, this, opts);
    command.run(this, this, opts);
    this.defaultRunning = true;
  }

  /**
   * Stop default command
   * @param {Object} [opts={}] Options
   * @private
   */
  stopDefault(opts = {}) {
    const commands = this.get("Commands");
    const command = commands.get(this.config.defaultCommand);
    if (!command || !this.defaultRunning) return;
    command.stop(this, this, opts);
    this.defaultRunning = false;
  }

  /**
   * Update canvas dimensions and refresh data useful for tools positioning
   * @private
   */
  refreshCanvas(opts: any = {}) {
    this.set("canvasOffset", null);
    this.set("canvasOffset", this.get("Canvas").getOffset());
    opts.tools && this.trigger("canvas:updateTools");
  }

  /**
   * Clear all selected stuf inside the window, sometimes is useful to call before
   * doing some dragging opearation
   * @param {Window} win If not passed the current one will be used
   * @private
   */
  clearSelection(win: Window) {
    var w = win || window;
    w.getSelection()?.removeAllRanges();
  }

  /**
   * Get the current media text
   * @return {string}
   */
  getCurrentMedia() {
    const config = this.config;
    const device = this.getDeviceModel();
    const condition = config.mediaCondition;
    const preview = config.devicePreviewMode;
    const width = device && device.get("widthMedia");
    return device && width && !preview ? `(${condition}: ${width})` : "";
  }

  /**
   * Return the component wrapper
   * @return {Component}
   */
  getWrapper() {
    return this.get("DomComponents").getWrapper();
  }

  setCurrentFrame(frameView: any) {
    return this.set("currentFrame", frameView);
  }

  getCurrentFrame() {
    return this.get("currentFrame");
  }

  getCurrentFrameModel() {
    return (this.getCurrentFrame() || {}).model;
  }

  /**
   * Return the count of changes made to the content and not yet stored.
   * This count resets at any `store()`
   * @return {number}
   */
  getDirtyCount() {
    return this.get("changesCount");
  }

  getZoomDecimal() {
    return this.get("Canvas").getZoomDecimal();
  }

  getZoomMultiplier() {
    return this.get("Canvas").getZoomMultiplier();
  }

  setDragMode(value: any) {
    this.dmode = value;
    return this;
  }

  t(...args: any[]) {
    return this.get("I18n").t(...args);
  }

  /**
   * Returns true if the editor is in absolute mode
   * @returns {Boolean}
   */
  inAbsoluteMode() {
    return this.dmode === "absolute";
  }

  /**
   * Destroy editor
   */
  destroyAll() {
    const { config, view } = this;
    const editor = this.getEditor();
    const { editors = [] } = config.grapesjs || {};
    this.stopListening();
    this.stopDefault();
    this.modules
      .slice()
      .reverse()
      .forEach((mod) => mod.destroy());
    view && view.remove();
    this.clear({ silent: true });
    this.destroyed = true;
    ["config", "view", "_previousAttributes", "_events", "_listeners"].forEach(
      //@ts-ignore
      i => (this[i] = {})
    );
    editors.splice(editors.indexOf(editor), 1);
    hasWin() &&
      $(config.el)
        //@ts-ignore
        .empty()
        .attr(this.attrsOrig);
  }

  isEditing() {
    return !!this.editing;
  }

  log(msg: string, opts: any = {}) {
    const { ns, level = "debug" } = opts;
    this.trigger("log", msg, opts);
    level && this.trigger(`log:${level}`, msg, opts);

    if (ns) {
      const logNs = `log-${ns}`;
      this.trigger(logNs, msg, opts);
      level && this.trigger(`${logNs}:${level}`, msg, opts);
    }
  }

  logInfo(msg: string, opts = {}) {
    this.log(msg, { ...opts, level: "info" });
  }

  logWarning(msg: string, opts = {}) {
    this.log(msg, { ...opts, level: "warning" });
  }

  logError(msg: string, opts = {}) {
    this.log(msg, { ...opts, level: "error" });
  }

  initBaseColorPicker(el: any, opts = {}) {
    const config = this.config;
    const { colorPicker = {} } = config;
    const elToAppend = config.el;
    const ppfx = config.stylePrefix;

    //@ts-ignore
    return $(el).spectrum({
      containerClassName: `${ppfx}one-bg ${ppfx}two-color`,
      appendTo: elToAppend || "body",
      maxSelectionSize: 8,
      showPalette: true,
      palette: [],
      showAlpha: true,
      chooseText: "Ok",
      cancelText: "⨯",
      ...opts,
      ...colorPicker,
    });
  }

  /**
   * Set/get data from the HTMLElement
   * @param  {HTMLElement} el
   * @param  {string} name Data name
   * @param  {any} value Date value
   * @return {any}
   * @private
   */
  data(el: any, name: string, value: any) {
    const varName = "_gjs-data";

    if (!el[varName]) {
      el[varName] = {};
    }

    if (isUndefined(value)) {
      return el[varName][name];
    } else {
      el[varName][name] = value;
    }
  }
}
