import {
  isUndefined,
  isFunction,
  isArray,
  isEmpty,
  isBoolean,
  has,
  isString,
  forEach,
  result,
  bindAll,
  keys
} from "underscore";
import {
  shallowDiff,
  capitalize,
  isEmptyObj,
  isObject,
  toLowerCase
} from "utils/mixins";
import Styleable from "domain_abstract/model/Styleable";
import { AddOptions, Model } from "backbone";
import Components from "./Components";
import Selector from "selector_manager/model/Selector";
import Selectors from "selector_manager/model/Selectors";
import Traits from "trait_manager/model/Traits";
import { SelectorType } from "selector_manager/utils/SelectorUtils";
import EditorModel from "editor/model/Editor";
import Editor from "editor";
import DomComponentsConfig from "dom_components/config/config";
import Frame from "canvas/model/Frame";
import ComponentsView from "dom_components/view/ComponentsView";
import ComponentView from "dom_components/view/ComponentView";
import CssRule from "css_composer/model/CssRule";
import CssRules from "css_composer/model/CssRules";
import Trait from "trait_manager/model/Trait";
import BlockManagerModule from "block_manager";
import { IComponent } from "dom_components";

const escapeRegExp = (str: string) => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
};

const avoidInline = (em: EditorModel) => em && em.getConfig().avoidInlineStyle;

export const eventDrag = "component:drag";
export const keySymbols = "__symbols";
export const keySymbol = "__symbol";
export const keySymbolOvrd = "__symbol_ovrd";
export const keyUpdate = "component:update";
export const keyUpdateInside = `${keyUpdate}-inside`;

/**
 * The Component object represents a single node of our template structure, so when you update its properties the changes are
 * immediately reflected on the canvas and in the code to export (indeed, when you ask to export the code we just go through all
 * the tree of nodes).
 * An example on how to update properties:
 * ```js
 * component.set({
 *  tagName: 'span',
 *  attributes: { ... },
 *  removable: false,
 * });
 * component.get('tagName');
 * // -> 'span'
 * ```
 *
 * [Component]: component.html
 *
 * @typedef Component
 * @property {String} [type=''] Component type, eg. `text`, `image`, `video`, etc.
 * @property {String} [tagName='div'] HTML tag of the component, eg. `span`. Default: `div`
 * @property {Object} [attributes={}] Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
 * @property {String} [name=''] Name of the component. Will be used, for example, in Layers and badges
 * @property {Boolean} [removable=true] When `true` the component is removable from the canvas, default: `true`
 * @property {Boolean|String|Function} [draggable=true] Indicates if it's possible to drag the component inside others.
 *  You can also specify a query string to indentify elements,
 *  eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
 *  containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
 * @property {Boolean|String|Function} [droppable=true] Indicates if it's possible to drop other components inside. You can use
 * a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
 * @property {Boolean} [badgable=true] Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
 * @property {Boolean|Array<String>} [stylable=true] True if it's possible to style the component.
 * You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
 * will be hidden from the style manager. Default: `true`
 * @property {Array<String>} [stylable-require=[]] Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
 * @property {Array<String>} [unstylable=[]] Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
 * @property {Boolean} [highlightable=true] It can be highlighted with 'dotted' borders if true. Default: `true`
 * @property {Boolean} [copyable=true] True if it's possible to clone the component. Default: `true`
 * @property {Boolean} [resizable=false] Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/artf/grapesjs/blob/master/src/utils/Resizer.js). Default: `false`
 * @property {Boolean} [editable=false] Allow to edit the content of the component (used on Text components). Default: `false`
 * @property {Boolean} [layerable=true] Set to `false` if you need to hide the component inside Layers. Default: `true`
 * @property {Boolean} [selectable=true] Allow component to be selected when clicked. Default: `true`
 * @property {Boolean} [hoverable=true] Shows a highlight outline when hovering on the element if `true`. Default: `true`
 * @property {Boolean} [void=false] This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
 * @property {String} [styles=''] Component related styles, eg. `.my-component-class { color: red }`
 * @property {String} [content=''] Content of the component (not escaped) which will be appended before children rendering. Default: `''`
 * @property {String} [icon=''] Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
 * @property {String|Function} [script=''] Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
 * @property {String|Function} [script-export=''] You can specify javascript available only in export functions (eg. when you get the HTML).
 * If this property is defined it will overwrite the `script` one (in export functions). Default: `''`
 * @property {Array<Object|String>} [traits=''] Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
 * @property {Array<String>} [propagate=[]] Indicates an array of properties which will be inhereted by all NEW appended children.
 *  For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
 *  and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
 * @property {Array<Object>} [toolbar=null] Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
 * Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
 * By default, when `toolbar` property is falsy the editor will add automatically commands like `move`, `delete`, etc. based on its properties.
 * @property {Collection<Component>} [components=null] Children components. Default: `null`
 */
export default class Component extends Styleable {
  /**
   * Hook method, called once the model is created
   */
  init() {}

  /**
   * Hook method, called when the model has been updated (eg. updated some model's property)
   * @param {String} property Property name, if triggered after some property update
   * @param {*} value Property value, if triggered after some property update
   * @param {*} previous Property previous value, if triggered after some property update
   */
  updated(property: string, value: any, previous: any) {}

  /**
   * Hook method, called once the model has been removed
   */
  removed() {}
  constructor(p: any, o: any) {
    super(p, o);
    return this;
  }

  initialize(
    props = {},
    opt: {
      em: EditorModel;
      config: DomComponentsConfig;
      frame: Frame;
      temporary: boolean;
    }
  ) {
    bindAll(this, "__upSymbProps", "__upSymbCls", "__upSymbComps");
    const em = opt.em;

    // Propagate properties from parent if indicated
    const parent = this.parent();
    const parentAttr = parent?.attributes;

    if (parent && parentAttr?.propagate) {
      let newAttr: any = {};
      const toPropagate: any[] = parentAttr.propagate;
      toPropagate.forEach(prop => (newAttr[prop] = parent.get(prop)));
      newAttr.propagate = toPropagate;
      newAttr = { ...newAttr, ...props };
      this.set(newAttr);
    }

    const propagate = this.get("propagate");
    propagate &&
      this.set("propagate", isArray(propagate) ? propagate : [propagate]);

    // Check void elements
    if (
      opt &&
      opt.config &&
      opt.config.voidElements.indexOf(this.get("tagName")) >= 0
    ) {
      this.set("void", true);
    }

    opt.em = em;
    this.opt = opt;
    this.em = em;
    this.frame = opt.frame;
    this.config = opt.config || {};
    this.set("attributes", {
      ...(result(this, "defaults").attributes || {}),
      ...(this.get("attributes") || {})
    });
    this.ccid = Component.createId(this, opt);
    this.initClasses();
    this.initTraits();
    this.initComponents();
    this.initToolbar();
    this.initScriptProps();
    this.listenTo(this, "change:script", this.scriptUpdated);
    this.listenTo(this, "change:tagName", this.tagUpdated);
    this.listenTo(this, "change:attributes", this.attrUpdated);
    this.listenTo(this, "change:attributes:id", this._idUpdated);
    this.on("change:toolbar", this.__emitUpdateTlb);
    this.on("change", this.__onChange);
    this.on(keyUpdateInside, this.__propToParent);
    this.set("status", "");
    this.views = [];

    // Register global updates for collection properties
    ["classes", "traits", "components"].forEach(name => {
      const events = `add remove ${name !== "components" ? "change" : ""}`;
      this.listenTo(this.get(name), events.trim(), (...args) =>
        this.emitUpdate(name, ...args)
      );
    });

    if (!opt.temporary) {
      // Add component styles
      const cssc = em && em.CssComposer;
      const { styles, type } = this.attributes;
      if (styles && cssc) {
        cssc.addCollection(styles, {}, { group: `cmp:${type}` });
      }

      this.__postAdd();
      this.init();
      this.__isSymbolOrInst() && this.__initSymb();
      em && em.trigger("component:create", this);
    }
  }
  views: any[] = [];
  view?: ComponentView;
  prevColl?: Components;
  //@ts-ignore
  em: EditorModel;
  //@ts-ignore
  config: DomComponentsConfig;
  __symbReady = false;
  __hasUm?: boolean = false;
  //@ts-ignore
  ccid: string;
  opt: any;
  //@ts-ignore
  frame: Frame;
  rule?: CssRule;
  get traits(): Traits {
    return this.get("traits");
  }
  viewLayer: any;
  __postAdd(opts: any = {}) {
    const { em } = this;
    const um = em && em.UndoManager;
    const comps = this.components;
    if (um && !this.__hasUm) {
      um.add(comps);
      um.add(this.getSelectors());
      this.__hasUm = true;
    }
    opts.recursive && comps?.map(c => c.__postAdd(opts));
  }

  __postRemove() {
    const { em } = this;
    const um = em && em.UndoManager;
    if (um) {
      um.remove(this.components);
      um.remove(this.getSelectors());
      this.__hasUm = undefined;
    }
  }

  __onChange(m: Component, opts: any) {
    const changed = this.changedAttributes();
    if (changed) {
      ["status", "open", "toolbar", "traits"].forEach(
        name => delete changed[name]
      );
      // Propagate component prop changes
      if (!isEmptyObj(changed)) {
        this.__changesUp(opts);
        this.__propSelfToParent({ component: this, changed, options: opts });
      }
    }
  }

  __changesUp(opts: any) {
    const { em, frame } = this;
    [frame, em].forEach(md => md && md.changesUp(opts));
  }

  __propSelfToParent(props: any) {
    this.trigger(keyUpdate, props);
    this.__propToParent(props);
  }

  __propToParent(props: any) {
    const parent = this.parent();
    parent && parent.trigger(keyUpdateInside, props);
  }

  __emitUpdateTlb() {
    this.emitUpdate("toolbar");
  }

  /**
   * Check component's type
   * @param  {string}  type Component type
   * @return {Boolean}
   * @example
   * component.is('image')
   * // -> false
   */
  is(type: string) {
    return !!(this.get("type") == type);
  }

  /**
   * Return all the propeties
   * @returns {Object}
   */
  props() {
    return this.attributes;
  }

  /**
   * Get the index of the component in the parent collection.
   * @return {Number}
   */
  index() {
    const { collection } = this;
    return collection ? collection.indexOf(this) : 0;
  }

  /**
   * Change the drag mode of the component.
   * To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
   * @param {String} value Drag mode, options: 'absolute' | 'translate'
   * @returns {this}
   */
  setDragMode(value: string) {
    return this.set("dmode", value);
  }

  /**
   * Find inner components by query string.
   * **ATTENTION**: this method works only with already rendered component
   * @param  {String} query Query string
   * @return {Array} Array of components
   * @example
   * component.find('div > .class');
   * // -> [Component, Component, ...]
   */
  find(query: string) {
    const result: Component[] = [];
    const $els = this.view?.$el.find(query);
    $els &&
      $els.each(i => {
        const $el = $els.eq(i);
        const model = $el.data("model");
        model && result.push(model);
      });

    return result;
  }

  /**
   * Find all inner components by component type.
   * The advantage of this method over `find` is that you can use it
   * also before rendering the component
   * @param {String} type Component type
   * @returns {Array<Component>}
   * @example
   * const allImages = component.findType('image');
   * console.log(allImages[0]) // prints the first found component
   */
  findType(type: string) {
    const result: Component[] = [];
    const find: (components: Components | null) => void = components =>
      components?.forEach(item => {
        item.is(type) && result.push(item);
        find(item.components);
      });
    find(this.components);
    return result;
  }

  /**
   * Find the closest parent component by query string.
   * **ATTENTION**: this method works only with already rendered component
   * @param  {string} query Query string
   * @return {Component}
   * @example
   * component.closest('div.some-class');
   * // -> Component
   */
  closest(query: string) {
    const result = this.view?.$el.closest(query);
    return result?.length && result.data("model");
  }

  /**
   * Find the closest parent component by its type.
   * The advantage of this method over `closest` is that you can use it
   * also before rendering the component
   * @param {String} type Component type
   * @returns {Component} Found component, otherwise `undefined`
   * @example
   * const Section = component.closestType('section');
   * console.log(Section);
   */
  closestType(type: string) {
    let parent = this.parent();

    while (parent && !parent.is(type)) {
      parent = parent.parent();
    }

    return parent;
  }

  /**
   * The method returns a Boolean value indicating whether the passed
   * component is a descendant of a given component
   * @param {Component} component Component to check
   * @returns {Boolean}
   */
  contains(component: Component) {
    let result = !1;
    if (!component) return result;
    const contains: (components: Components | null) => void = components => {
      !result &&
        components?.forEach(item => {
          if (item === component) result = !0;
          !result && contains(item.components);
        });
    };
    contains(this.components);
    return result;
  }

  /**
   * Once the tag is updated I have to rerender the element
   * @private
   */
  tagUpdated() {
    this.trigger("rerender");
  }

  /**
   * Replace a component with another one
   * @param {String|Component} el Component or HTML string
   * @return {Component|Array<Component>} New added component/s
   * @example
   * component.replaceWith('<div>Some new content</div>');
   * // -> Component
   */
  replaceWith(el: String | Component) {
    const coll = this.collection;
    const at = coll.indexOf(this);
    coll.remove(this);
    return coll.add(el, { at });
  }

  /**
   * Emit changes for each updated attribute
   * @private
   */
  attrUpdated(m: any, v: any, opts = {}) {
    const attrs = this.get("attributes");
    // Handle classes
    const classes = attrs.class;
    classes && this.setClass(classes);
    delete attrs.class;

    // Handle style
    const style = attrs.style;
    style && this.setStyle(style);
    delete attrs.style;

    const attrPrev = { ...this.previous("attributes") };
    const diff = shallowDiff(attrPrev, this.get("attributes"));
    keys(diff).forEach(pr =>
      this.trigger(`change:attributes:${pr}`, this, diff[pr], opts)
    );
  }

  /**
   * Update attributes of the component
   * @param {Object} attrs Key value attributes
   * @param {Object} options Options for the model update
   * @return {this}
   * @example
   * component.setAttributes({ id: 'test', 'data-key': 'value' });
   */
  setAttributes(attrs: any, opts = {}) {
    this.set("attributes", { ...attrs }, opts);
    return this;
  }

  /**
   * Add attributes to the component
   * @param {Object} attrs Key value attributes
   * @param {Object} options Options for the model update
   * @return {this}
   * @example
   * component.addAttributes({ 'data-key': 'value' });
   */
  addAttributes(attrs: any, opts = {}) {
    return this.setAttributes(
      {
        ...this.getAttributes({ noClass: 1 }),
        ...attrs
      },
      opts
    );
  }

  /**
   * Remove attributes from the component
   * @param {String|Array<String>} attrs Array of attributes to remove
   * @param {Object} options Options for the model update
   * @return {this}
   * @example
   * component.removeAttributes('some-attr');
   * component.removeAttributes(['some-attr1', 'some-attr2']);
   */
  removeAttributes(attrs = [], opts = {}) {
    const attrArr = Array.isArray(attrs) ? attrs : [attrs];
    const compAttr = this.getAttributes();
    attrArr.map(i => delete compAttr[i]);
    return this.setAttributes(compAttr, opts);
  }

  /**
   * Get the style of the component
   * @return {Object}
   */
  getStyle(options = {}, optsAdd = {}) {
    const em = this.em;
    const prop = isString(options) ? options : "";
    const opts: any = prop ? optsAdd : options;

    if (em && em.getConfig().avoidInlineStyle && !opts.inline) {
      const state = em.get("state");
      const cc = em.CssComposer;
      const rule = cc.getIdRule(this.getId(), { state, ...opts });
      this.rule = rule;

      if (rule) {
        return rule.getStyle(prop);
      }
    }

    return super.getStyle(prop);
  }

  /**
   * Set the style on the component
   * @param {Object} prop Key value style object
   * @return {Object}
   * @example
   * component.setStyle({ color: 'red' });
   */
  setStyle(prop = {}, opts: any = {}) {
    const em = this.em;
    const { opt } = this;

    if (
      em &&
      em.getConfig().avoidInlineStyle &&
      !opt.temporary &&
      !opts.inline
    ) {
      const style = this.get("style") || {};
      //@ts-ignore
      prop = isString(prop) ? this.parseStyle(prop) : prop;
      prop = { ...prop, ...style };
      const state = em.get("state");
      const cc = em.CssComposer;
      const propOrig = this.getStyle(opts);
      this.rule = cc.setIdRule(this.getId(), prop, { ...opts, state });
      const diff = shallowDiff(propOrig, prop);
      this.set("style", "", { silent: true });
      keys(diff).forEach(pr => this.trigger(`change:style:${pr}`));
    } else {
      prop = super.setStyle.apply(this, [prop, opts]);
    }

    return prop;
  }

  /**
   * Return all component's attributes
   * @return {Object}
   */
  getAttributes(opts: any = {}) {
    const { em } = this;
    const classes: string[] = [];
    const attributes = { ...this.get("attributes") };
    const sm = em && em.SelectorManager;
    const id = this.getId();

    // Add classes
    if (!opts.noClass) {
      this.classes.forEach(cls =>
        classes.push(isString(cls) ? cls : cls.get("name"))
      );
      classes.length && (attributes.class = classes.join(" "));
    }

    // Add style
    if (!opts.noStyle) {
      const style = this.get("style");
      if (isObject(style) && !isEmptyObj(style)) {
        attributes.style = this.styleToString({ inline: true });
      }
    }

    // Check if we need an ID on the component
    if (!has(attributes, "id")) {
      let addId;

      // If we don't rely on inline styling we have to check
      // for the ID selector
      if (avoidInline(em)) {
        addId = sm && sm.get(id, SelectorType.id);
      } else if (!isEmpty(this.getStyle())) {
        addId = 1;
      }

      // Symbols should always have an id
      if (this.__getSymbol() || this.__getSymbols()) {
        addId = 1;
      }

      if (addId) {
        attributes.id = id;
      }
    }

    return attributes;
  }

  /**
   * Add classes
   * @param {Array<String>|String} classes Array or string of classes
   * @return {Array} Array of added selectors
   * @example
   * model.addClass('class1');
   * model.addClass('class1 class2');
   * model.addClass(['class1', 'class2']);
   * // -> [SelectorObject, ...]
   */
  addClass(classes: string | string[]) {
    const added = this.em?.SelectorManager.addClass(classes);
    return this.classes.add(added);
  }

  /**
   * Set classes (resets current collection)
   * @param {Array<String>|String} classes Array or string of classes
   * @return {Array} Array of added selectors
   * @example
   * model.setClass('class1');
   * model.setClass('class1 class2');
   * model.setClass(['class1', 'class2']);
   * // -> [SelectorObject, ...]
   */
  setClass(classes: string | string[]) {
    this.classes.reset();
    return this.addClass(classes);
  }

  /**
   * Remove classes
   * @param {Array<String>|String} classes Array or string of classes
   * @return {Array} Array of removed selectors
   * @example
   * model.removeClass('class1');
   * model.removeClass('class1 class2');
   * model.removeClass(['class1', 'class2']);
   * // -> [SelectorObject, ...]
   */
  removeClass(classes: string | string[]) {
    const removed: Selector[] = [];
    classes = isArray(classes) ? classes : [classes];
    const selectors = this.classes;
    const type = SelectorType.class;

    classes.forEach(classe => {
      const classes = classe.split(" ");
      classes.forEach(name => {
        const selector = selectors.where({ name, type })[0];
        selector && removed.push(selectors.remove(selector));
      });
    });

    return removed;
  }

  /**
   * Returns component's classes as an array of strings
   * @return {Array}
   */
  getClasses() {
    const attr = this.getAttributes();
    const classStr = attr.class;
    return classStr ? classStr.split(" ") : [];
  }

  __logSymbol(type: string, toUp = {}, opts = {}) {
    const symbol = this.__getSymbol();
    const symbols = this.__getSymbols();
    if (!symbol && !symbols) return;
    this.em?.log(type, { model: this, toUp, context: "symbols", opts });
  }

  __initSymb() {
    if (this.__symbReady) return;
    this.on("change", this.__upSymbProps);
    this.__symbReady = true;
  }

  __isSymbol(): boolean {
    return isArray(this.get(keySymbols));
  }

  __isSymbolOrInst() {
    return !!(this.__isSymbol() || this.get(keySymbol));
  }

  __isSymbolTop() {
    const parent = this.parent();
    const symb = this.__isSymbolOrInst();
    return (
      symb &&
      (!parent || (parent && !parent.__isSymbol() && !parent.__getSymbol()))
    );
  }

  __isSymbolNested() {
    if (!this.__isSymbolOrInst() || this.__isSymbolTop()) return false;
    const symbTopSelf = (this.__isSymbol()
      ? this
      : this.__getSymbol()
    )?.__getSymbTop();
    const symbTop = this.__getSymbTop();
    const symbTopMain = symbTop.__isSymbol() ? symbTop : symbTop.__getSymbol();
    return symbTopMain !== symbTopSelf;
  }

  __getAllById() {
    const { em } = this;
    return em?.DomComponents.allById() ?? {};
  }

  __getSymbol(): Component | undefined {
    let symb = this.get(keySymbol);
    if (symb && isString(symb)) {
      const ref = this.__getAllById()[symb];
      if (ref) {
        symb = ref;
        this.set(keySymbol, ref);
      } else {
        return undefined;
      }
    }
    return symb;
  }

  __getSymbols() {
    let symbs = this.get(keySymbols) as Component[];
    if (symbs && isArray(symbs)) {
      symbs.forEach((symb, idx) => {
        if (symb && isString(symb)) {
          symbs[idx] = this.__getAllById()[symb];
        }
      });
      symbs = symbs.filter(symb => symb && !isString(symb));
    }
    return symbs;
  }

  __isSymbOvrd(prop = "") {
    const ovrd = this.get(keySymbolOvrd);
    const [prp] = prop.split(":");
    const props = prop !== prp ? [prop, prp] : [prop];
    return (
      ovrd === true || (isArray(ovrd) && props.some(p => ovrd.indexOf(p) >= 0))
    );
  }

  __getSymbToUp(opts: any = {}) {
    let result: Component[] = [];
    const { em } = this;
    const { changed } = opts;
    const symbEnabled = em && em.get("symbols");

    if (
      opts.fromInstance ||
      opts.noPropagate ||
      opts.fromUndo ||
      !symbEnabled ||
      // Avoid updating others if the current component has override
      (changed && this.__isSymbOvrd(changed))
    ) {
      return result;
    }

    const symbols = this.__getSymbols() || [];
    const symbol = this.__getSymbol();
    const all = symbol ? [symbol, ...(symbol.__getSymbols() || [])] : symbols;
    result = all
      .filter(s => s !== this)
      // Avoid updating those with override
      .filter(s => !(changed && s.__isSymbOvrd(changed)));

    return result;
  }

  __getSymbTop(opts = {}) {
    let result: Component = this;
    let parent = this.parent(opts);

    while (parent && (parent.__isSymbol() || parent.__getSymbol())) {
      result = parent;
      parent = parent.parent(opts);
    }

    return result;
  }

  __upSymbProps(m: any, opts = {}) {
    const changed = this.changedAttributes();
    if (changed) {
      const attrs = changed.attributes || {};
      delete changed.status;
      delete changed.open;
      delete changed[keySymbols];
      delete changed[keySymbol];
      delete changed[keySymbolOvrd];
      delete changed.attributes;
      delete attrs.id;
      if (!isEmptyObj(attrs)) changed.attributes = attrs;
      if (!isEmptyObj(changed)) {
        const toUp = this.__getSymbToUp(opts);
        // Avoid propagating overrides to other symbols
        keys(changed).map(prop => {
          if (this.__isSymbOvrd(prop)) delete changed[prop];
        });

        this.__logSymbol("props", toUp, { opts, changed });
        toUp.forEach(child => {
          const propsChanged = { ...changed };
          // Avoid updating those with override
          keys(propsChanged).map(prop => {
            if (child.__isSymbOvrd(prop)) delete propsChanged[prop];
          });
          child.set(propsChanged, { fromInstance: this, ...opts });
        });
      }
    }
  }

  __upSymbCls(m: Component, c: Components, opts = {}) {
    const toUp = this.__getSymbToUp(opts);
    this.__logSymbol("classes", toUp, { opts });
    toUp.forEach(child => {
      // This will propagate the change up to __upSymbProps
      //@ts-ignore
      child.set("classes", this.classes, { fromInstance: this });
    });
    this.__changesUp(opts);
  }

  __upSymbComps(m: Component, c: Components, o?: any) {
    const optUp = o || c || {};
    const { fromInstance, fromUndo } = optUp;
    const toUpOpts = { fromInstance, fromUndo };
    const isTemp = m.opt.temporary;

    // Reset
    if (!o) {
      const toUp = this.__getSymbToUp({
        ...toUpOpts,
        changed: "components:reset"
      });
      this.__logSymbol("reset", toUp, { components: c.models });
      toUp.forEach(symb => {
        const newMods = c.models.map(mod => mod.clone({ symbol: 1 }));
        //@ts-ignore
        symb.components?.reset(newMods, { fromInstance: this, ...c });
      });
      // Add
    } else if (o.add) {
      let addedInstances: Component[] = [];
      const isMainSymb = !!this.__getSymbols();
      const toUp = this.__getSymbToUp({
        ...toUpOpts,
        changed: "components:add"
      });
      if (toUp.length) {
        const addSymb = m.__getSymbol();
        addedInstances =
          (addSymb ? addSymb.__getSymbols() : m.__getSymbols()) || [];
        addedInstances = [...addedInstances];
        addedInstances.push(addSymb ? addSymb : m);
      }
      !isTemp &&
        this.__logSymbol("add", toUp, {
          opts: o,
          addedInstances: addedInstances.map(c => c.cid),
          added: m.cid
        });
      // Here, before appending a new symbol, I have to ensure there are no previously
      // created symbols (eg. used mainly when drag components around)
      toUp.forEach(symb => {
        const symbTop = symb.__getSymbTop();
        const symbPrev = addedInstances.filter(addedInst => {
          const addedTop = addedInst.__getSymbTop({ prev: 1 });
          return symbTop && addedTop && addedTop === symbTop;
        })[0];
        const toAppend =
          symbPrev || m.clone({ symbol: 1, symbolInv: isMainSymb });
        symb.append(toAppend, { fromInstance: this, ...o });
      });
      // Remove
    } else {
      // Remove instance reference from the symbol
      const symb = m.__getSymbol();
      symb &&
        !o.temporary &&
        symb.set(
          keySymbols,
          symb.__getSymbols().filter(i => i !== m)
        );

      // Propagate remove only if the component is an inner symbol
      if (!m.__isSymbolTop()) {
        const changed = "components:remove";
        const { index } = o;
        const parent = m.parent();
        const opts = { fromInstance: m, ...o };
        const isSymbNested = m.__isSymbolNested();
        let toUpFn = (symb: Component) => {
          const symbPrnt = symb.parent();
          symbPrnt && !symbPrnt.__isSymbOvrd(changed) && symb.remove(opts);
        };
        // Check if the parent allows the removing
        let toUp = !parent?.__isSymbOvrd(changed)
          ? m.__getSymbToUp(toUpOpts)
          : [];

        if (isSymbNested) {
          toUp = parent?.__getSymbToUp({ ...toUpOpts, changed }) ?? [];
          toUpFn = (symb: Component) => {
            const toRemove = symb.components?.at(index);
            toRemove && toRemove.remove({ fromInstance: parent, ...opts });
          };
        }

        !isTemp &&
          this.__logSymbol("remove", toUp, {
            opts: o,
            removed: m.cid,
            isSymbNested
          });
        toUp.forEach(toUpFn);
      }
    }

    this.__changesUp(optUp);
  }

  initClasses(m = {}, c = {}, opts = {}) {
    const event = "change:classes";
    const attrCls = this.get("attributes").class || [];
    const toListen = [this, event, this.initClasses];
    const cls = this.classes || attrCls;
    const clsArr = isString(cls) ? cls.split(" ") : cls;
    this.stopListening(...toListen);
    const classes = this.normalizeClasses(clsArr);
    const selectors = new Selectors([]);
    this.set("classes", selectors, opts);
    classes && selectors.add(classes);
    selectors.on("add remove reset", this.__upSymbCls);
    this.listenTo(this, event, this.initClasses);
    return this;
  }

  initComponents() {
    const event = "change:components";
    this.stopListening(this, event, this.initComponents);
    // Have to add components after the init, otherwise the parent
    // is not visible
    const comps = new Components(null, this.opt);
    comps.parent = this;
    const components = this.get("components");
    const addChild = !this.opt.avoidChildren;
    this.set("components", comps);
    addChild &&
      components &&
      comps.add(
        isFunction(components) ? components(this) : components,
        this.opt
      );
    comps.on("add remove reset", this.__upSymbComps);
    this.listenTo(this, event, this.initComponents);
    return this;
  }

  initTraits(changed?: boolean) {
    const { em } = this;
    const event = "change:traits";
    this.off(event, this.initTraits);
    this.__loadTraits();
    const attrs = { ...this.get("attributes") };
    const traits = this.traits;
    traits.each(trait => {
      if (!trait.get("changeProp")) {
        const name = trait.get("name");
        const value = trait.getInitValue();
        if (name && value) attrs[name] = value;
      }
    });
    traits.length && this.set("attributes", attrs);
    this.on(event, this.initTraits);
    changed && em && em.trigger("component:toggled");
    return this;
  }

  initScriptProps() {
    if (this.opt.temporary) return;
    const prop = "script-props";
    this.off(`change:${prop}`, this.initScriptProps);
    const prevProps = this.previous(prop) || [];
    const newProps = this.get(prop) || [];
    const prevPropsEv = prevProps.map((e: any) => `change:${e}`).join(" ");
    const newPropsEv = newProps.map((e: any) => `change:${e}`).join(" ");
    prevPropsEv && this.off(prevPropsEv, this.__scriptPropsChange);
    newPropsEv && this.on(newPropsEv, this.__scriptPropsChange);
    this.on(`change:${prop}`, this.initScriptProps);
  }

  __scriptPropsChange(m: any, v: any, opts: { avoidStore?: boolean } = {}) {
    if (opts.avoidStore) return;
    this.trigger("rerender");
  }

  /**
   * Add new component children
   * @param  {Component|String} components Component to add
   * @param {Object} [opts={}] Options for the append action
   * @return {Array} Array of appended components
   * @example
   * someComponent.get('components').length // -> 0
   * const videoComponent = someComponent.append('<video></video><div></div>')[0];
   * // This will add 2 components (`video` and `div`) to your `someComponent`
   * someComponent.get('components').length // -> 2
   * // You can pass components directly
   * otherComponent.append(otherComponent2);
   * otherComponent.append([otherComponent3, otherComponent4]);
   * // append at specific index (eg. at the beginning)
   * someComponent.append(otherComponent, { at: 0 });
   */
  append(components: (Component | string)[] | Component | string, opts = {}) {
    const compArr = isArray(components) ? components : [components];
    const toAppend = compArr.map(comp => {
      if (isString(comp)) {
        return comp;
      } else {
        // I have to remove components from the old container before adding them to a new one
        //@ts-ignore
        comp.collection?.remove(comp, { temporary: true });
        return comp;
      }
    });
    const result = this.components?.add(toAppend, opts);
    return isArray(result) ? result : [result];
  }

  get components(): Components | null {
    return this.get("components");
  }
  /**
   * Set new collection if `components` are provided, otherwise the
   * current collection is returned
   * @param  {Component|String} [components] Component Definitions or HTML string
   * @param {Object} [opts={}] Options, same as in `Component.append()`
   * @returns {Collection|Array<[Component]>}
   * @example
   * // Set new collection
   * component.components('<span></span><div></div>');
   * // Get current collection
   * const collection = component.components;
   * console.log(collection.length);
   * // -> 2
   */
  getNewComponents(component: Component | string, opts = {}) {
    const coll = this.components;

    coll?.reset(undefined, opts);
    return this.append(component, opts);
  }

  /**
   * If exists, returns the child component at specific index.
   * @param {Number} index Index of the component to return
   * @returns {[Component]|null}
   * @example
   * // Return first child
   * component.getChildAt(0);
   * // Return second child
   * component.getChildAt(1);
   */
  getChildAt(index: number) {
    return this.components?.at(index || 0) || null;
  }

  /**
   * If exists, returns the last child component.
   * @returns {[Component]|null}
   * @example
   * const lastChild = component.getLastChild();
   */
  getLastChild() {
    const children = this.components;
    return children?.at(children.length - 1) || null;
  }

  /**
   * Remove all inner components
   * * @return {this}
   */
  empty(opts = {}) {
    this.components?.reset(undefined, opts);
    return this;
  }

  /**
   * Get the parent component, if exists
   * @return {Component|null}
   * @example
   * component.parent();
   * // -> Component
   */
  parent(opts: any = {}): Component | null {
    const coll: Components =
      (this.collection as any) || (opts.prev && this.prevColl);
    return coll?.parent ?? null;
  }

  /**
   * Script updated
   * @private
   */
  scriptUpdated() {
    this.set("scriptUpdated", 1);
  }

  /**
   * Init toolbar
   * @private
   */
  initToolbar() {
    const { em } = this;
    const model = this;
    const ppfx = (em && em.getConfig().stylePrefix) || "";

    if (!model.get("toolbar")) {
      var tb = [];
      if (model.collection) {
        tb.push({
          attributes: { class: "fa fa-arrow-up" },
          command: (ed: Editor) =>
            ed.runCommand("core:component-exit", { force: 1 })
        });
      }
      if (model.get("draggable")) {
        tb.push({
          attributes: {
            class: `fa fa-arrows ${ppfx}no-touch-actions`,
            draggable: true
          },
          //events: hasDnd(this.em) ? { dragstart: 'execCommand' } : '',
          command: "tlb-move"
        });
      }
      if (model.get("copyable")) {
        tb.push({
          attributes: { class: "fa fa-clone" },
          command: "tlb-clone"
        });
      }
      if (model.get("removable")) {
        tb.push({
          attributes: { class: "fa fa-trash-o" },
          command: "tlb-delete"
        });
      }
      model.set("toolbar", tb);
    }
  }

  __loadTraits(tr?: Traits | Trait[] | Function, opts = {}) {
    let traitsI = tr || this.traits;

    if (!(traitsI instanceof Traits)) {
      traitsI = isFunction(traitsI) ? traitsI(this) : traitsI;
      const traits = new Traits([], this.opt);
      traits.setTarget(this);

      if (isArray(traitsI)) {
        traitsI.forEach(tr => tr.attributes && delete tr.attributes.value);
        traits.add(traitsI);
      }

      this.set({ traits }, opts);
    }

    return this;
  }

  /**
   * Get traits.
   * @returns {Array<Trait>}
   * @example
   * const traits = component.getTraits();
   * console.log(traits);
   * // [Trait, Trait, Trait, ...]
   */
  getTraits() {
    this.__loadTraits();
    return [...this.traits.models];
  }

  /**
   * Replace current collection of traits with a new one.
   * @param {Array<Object>} traits Array of trait definitions
   * @returns {Array<Trait>}
   * @example
   * const traits = component.setTraits([{ type: 'checkbox', name: 'disabled'}, ...]);
   * console.log(traits);
   * // [Trait, ...]
   */
  setTraits(traits: any[]) {
    const tr = isArray(traits) ? traits : [traits];
    this.set({ traits: tr });
    return this.getTraits();
  }

  /**
   * Get the trait by id/name.
   * @param  {String} id The `id` or `name` of the trait
   * @return {Trait|null} Trait getModelToStyle
   * @example
   * const traitTitle = component.getTrait('title');
   * traitTitle && traitTitle.set('label', 'New label');
   */
  getTrait(id: string) {
    return (
      this.getTraits().filter(trait => {
        return trait.get("id") === id || trait.get("name") === id;
      })[0] || null
    );
  }

  /**
   * Update a trait.
   * @param  {String} id The `id` or `name` of the trait
   * @param  {Object} props Object with the props to update
   * @return {this}
   * @example
   * component.updateTrait('title', {
   *  type: 'select',
   *  options: [ 'Option 1', 'Option 2' ],
   * });
   */
  updateTrait(id: string, props: any) {
    const trait = this.getTrait(id);
    trait?.set(props);
    this.em?.trigger("component:toggled");
    return this;
  }

  /**
   * Get the trait position index by id/name. Useful in case you want to
   * replace some trait, at runtime, with something else.
   * @param  {String} id The `id` or `name` of the trait
   * @return {Number} Index position of the current trait
   * @example
   * const traitTitle = component.getTraitIndex('title');
   * console.log(traitTitle); // 1
   */
  getTraitIndex(id: string): number {
    const trait = this.getTrait(id);
    return trait ? this.traits.indexOf(trait) : -1;
  }

  /**
   * Remove trait/s by id/s.
   * @param  {String|Array<String>} id The `id`/`name` of the trait (or an array)
   * @return {Array<Trait>} Array of removed traits
   * @example
   * component.removeTrait('title');
   * component.removeTrait(['title', 'id']);
   */
  removeTrait(id: string | string[]) {
    const ids = isArray(id) ? id : [id];
    const toRemove = ids.map(id => this.getTrait(id));
    const traits = this.traits;
    const removed = toRemove.length ? traits.remove(toRemove) : [];
    this.em?.trigger("component:toggled");
    return isArray(removed) ? removed : [removed];
  }

  /**
   * Add new trait/s.
   * @param  {String|Object|Array<String|Object>} trait Trait to add (or an array of traits)
   * @param  {Options} opts Options for the add
   * @return {Array<Trait>} Array of added traits
   * @example
   * component.addTrait('title', { at: 1 }); // Add title trait (`at` option is the position index)
   * component.addTrait({
   *  type: 'checkbox',
   *  name: 'disabled',
   * });
   * component.addTrait(['title', {...}, ...]);
   */
  addTrait(trait: any, opts = {}) {
    this.__loadTraits();
    const added = this.traits.add(trait, opts);
    this.em?.trigger("component:toggled");
    return isArray(added) ? added : [added];
  }

  /**
   * Normalize input classes from array to array of objects
   * @param {Array} arr
   * @return {Array}
   * @private
   */
  normalizeClasses(
    arr: string[] | Selector[] | Selectors
  ): Selector[] | undefined {
    const { em } = this;
    const clm = em && em.SelectorManager;
    if (!clm) return;

    if (arr instanceof Selectors) return [...arr.models];
    //@ts-ignore
    else return arr.map(val => clm.add(val));
  }

  /**
   * Override original clone method
   * @private
   */
  clone(opt: any = {}) {
    const em = this.em;
    const attr = { ...this.attributes };
    const opts = { ...this.opt };
    const id = this.getId();
    const cssc = em && em.CssComposer;
    attr.attributes = { ...attr.attributes };
    delete attr.attributes.id;
    attr.components = [];
    attr.classes = [];
    attr.traits = [];

    if (this.__isSymbolTop()) {
      opt.symbol = 1;
    }

    this.components?.each((md, i) => {
      attr.components[i] = md.clone({ ...opt, _inner: 1 });
    });
    this.traits.each((md, i) => {
      attr.traits[i] = md.clone();
    });
    this.classes.each((md, i) => {
      attr.classes[i] = md.get("name");
    });

    attr.status = "";
    opts.collection = null;
    //@ts-ignore
    const cloned = new this.constructor(attr, opts);

    // Clone component specific rules
    const newId = `#${cloned.getId()}`;
    const rulesToClone = cssc ? cssc.getRules(`#${id}`) : [];
    rulesToClone.forEach(rule => {
      const newRule = rule.clone();
      newRule.set("selectors", [newId]);
      cssc.getAll().add(newRule);
    });

    // Symbols
    // If I clone an inner symbol, I have to reset it
    cloned.set(keySymbols, 0);
    const symbol = this.__getSymbol();
    const symbols = this.__getSymbols();

    if (!opt.symbol && (symbol || symbols)) {
      cloned.set(keySymbol, 0);
      cloned.set(keySymbols, 0);
    } else if (symbol) {
      // Contains already a reference to a symbol
      symbol.set(keySymbols, [...symbol.__getSymbols(), cloned]);
      cloned.__initSymb();
    } else if (opt.symbol) {
      // Request to create a symbol
      if (this.__isSymbol()) {
        // Already a symbol, cloned should be an instance
        this.set(keySymbols, [...symbols, cloned]);
        cloned.set(keySymbol, this);
        cloned.__initSymb();
      } else if (opt.symbolInv) {
        // Inverted, cloned is the instance, the origin is the main symbol
        this.set(keySymbols, [cloned]);
        cloned.set(keySymbol, this);
        [this, cloned].map(i => i.__initSymb());
      } else {
        // Cloned becomes the main symbol
        cloned.set(keySymbols, [this]);
        [this, cloned].map(i => i.__initSymb());
        this.set(keySymbol, cloned);
      }
    }

    const event = "component:clone";
    em && em.trigger(event, cloned);
    this.trigger(event, cloned);

    return cloned;
  }

  /**
   * Get the name of the component
   * @return {String}
   * */
  getName(): string {
    const { em } = this;
    const { type, tagName } = this.attributes;
    const cName = this.get("name");
    const isDiv = tagName == "div";
    const tag = isDiv ? "box" : tagName;
    const defName = type || tag;
    const nameTag = !type && tagName && !isDiv && tagName;
    const i18nPfx = "domComponents.names.";
    const i18nName = cName && em && em.t(`${i18nPfx}${cName}`);
    const i18nNameTag = nameTag && em && em.t(`${i18nPfx}${nameTag}`);
    const i18nDefName =
      em && (em.t(`${i18nPfx}${type}`) || em.t(`${i18nPfx}${tagName}`));
    return (
      this.get("custom-name") || // Used in Layers (when the user changes the name)
      i18nName ||
      cName || // Component name (check if there is a i18n string for it)
      i18nNameTag ||
      capitalize(nameTag) || // Try name by tag if there is no valid type
      i18nDefName ||
      capitalize(defName) // Use the default name
    );
  }

  /**
   * Get the icon string
   * @return {String}
   */
  getIcon() {
    let icon = this.get("icon");
    return icon ? icon + " " : "";
  }

  /**
   * Return HTML string of the component
   * @param {Object} [opts={}] Options
   * @param {String} [opts.tag] Custom tagName
   * @param {Object|Function} [opts.attributes=null] You can pass an object of custom attributes to replace
   * with the current one or you can even pass a function to generate attributes dynamically
   * @return {String} HTML string
   * @example
   * // Simple HTML return
   * component.set({ tagName: 'span' });
   * component.setAttributes({ title: 'Hello' });
   * component.toHTML();
   * // -> <span title="Hello"></span>
   *
   * // Custom attributes
   * component.toHTML({ attributes: { 'data-test': 'Hello' } });
   * // -> <span data-test="Hello"></span>
   *
   * // Custom dynamic attributes
   * component.toHTML({
   *  attributes(component, attributes) {
   *    if (component.get('tagName') == 'span') {
   *      attributes.title = 'Custom attribute';
   *    }
   *    return attributes;
   *  },
   * });
   * // -> <span title="Custom attribute"></span>
   */
  toHTML(opts: any = {}) {
    const model = this;
    const attrs = [];
    const customTag = opts.tag;
    const tag = customTag || model.get("tagName");
    const sTag = model.get("void");
    const customAttr = opts.attributes;
    let attributes = this.getAttrToHTML();
    delete opts.tag;

    // Get custom attributes if requested
    if (customAttr) {
      if (isFunction(customAttr)) {
        attributes = customAttr(model, attributes) || {};
      } else if (isObject(customAttr)) {
        attributes = customAttr;
      }
    }

    for (let attr in attributes) {
      const val = attributes[attr];
      const value = isString(val) ? val.replace(/"/g, "&quot;") : val;

      if (!isUndefined(value)) {
        if (isBoolean(value)) {
          value && attrs.push(attr);
        } else {
          attrs.push(`${attr}="${value}"`);
        }
      }
    }

    const attrString = attrs.length ? ` ${attrs.join(" ")}` : "";
    const inner = model.__innerHTML(opts);
    let code = `<${tag}${attrString}${sTag ? "/" : ""}>${inner}`;
    !sTag && (code += `</${tag}>`);

    return code;
  }

  __innerHTML(opts = {}): string {
    const cmps = this.components;
    return !cmps?.length
      ? this.get("content")
      : cmps.map(c => c.toHTML(opts)).join("");
  }

  /**
   * Returns object of attributes for HTML
   * @return {Object}
   * @private
   */
  getAttrToHTML() {
    var attr = this.getAttributes();
    delete attr.style;
    return attr;
  }

  /**
   * Return a shallow copy of the model's attributes for JSON
   * stringification.
   * @return {Object}
   * @private
   */
  toJSON(opts: any = {}) {
    const obj = Model.prototype.toJSON.call(this, opts);
    obj.attributes = this.getAttributes();
    delete obj.attributes.class;
    delete obj.toolbar;
    delete obj.traits;
    delete obj.status;
    delete obj.open; // used in Layers

    if (!opts.fromUndo) {
      const symbol = obj[keySymbol];
      const symbols = obj[keySymbols];
      if (symbols && isArray(symbols)) {
        obj[keySymbols] = symbols
          .filter(i => i)
          .map(i => (i.getId ? i.getId() : i));
      }
      if (symbol && !isString(symbol)) {
        obj[keySymbol] = symbol.getId();
      }
    }

    if (this.em.getConfig().avoidDefaults) {
      this.getChangedProps(obj);
    }

    return obj;
  }

  /**
   * Return an object containing only changed props
   */
  getChangedProps(res?: any) {
    const obj = res || Model.prototype.toJSON.apply(this);
    const defaults = result(this, "defaults");

    forEach(defaults, (value, key) => {
      if (["type"].indexOf(key) === -1 && obj[key] === value) {
        delete obj[key];
      }
    });

    if (isEmpty(obj.type)) {
      delete obj.type;
    }

    forEach(["attributes", "style"], prop => {
      if (isEmpty(defaults[prop]) && isEmpty(obj[prop])) {
        delete obj[prop];
      }
    });

    forEach(["classes", "components"], prop => {
      if (!obj[prop] || (isEmpty(defaults[prop]) && !obj[prop].length)) {
        delete obj[prop];
      }
    });

    return obj;
  }

  /**
   * Return the component id
   * @return {String}
   */
  getId(): string {
    let attrs = this.get("attributes") || {};
    return attrs.id || this.ccid || this.cid;
  }

  /**
   * Set new id on the component
   * @param {String} id
   * @return {this}
   */
  setId(id: string, opts = {}) {
    const attrs = { ...this.get("attributes") };
    attrs.id = id;
    this.set("attributes", attrs, opts);
    return this;
  }

  /**
   * Get the DOM element of the component.
   * This works only if the component is already rendered
   * @param {Frame} frame Specific frame from which taking the element
   * @return {HTMLElement}
   */
  getEl(frame?: Frame) {
    const view = this.getView(frame);
    return view && view.el;
  }

  /**
   * Get the View of the component.
   * This works only if the component is already rendered
   * @param {Frame} frame Get View of a specific frame
   * @return {ComponentView}
   */
  getView(frame?: Frame) {
    let { view, views } = this;

    if (frame) {
      view = views.filter(view => view._getFrame() === frame.view)[0];
    }

    return view;
  }

  getCurrentView() {
    const frame = (this.em.get("currentFrame") || {}).model;
    return this.getView(frame);
  }

  __getScriptProps(): any[] {
    const modelProps = this.props();
    const scrProps: any[] = this.get("script-props") || [];
    return scrProps.reduce((acc, prop) => {
      acc[prop] = modelProps[prop];
      return acc;
    }, {});
  }

  /**
   * Return script in string format, cleans 'function() {..' from scripts
   * if it's a function
   * @param {string|Function} script
   * @return {string}
   * @private
   */
  getScriptString(script?: string | Function): string {
    let scr = script || this.get("script");

    if (!scr) {
      return scr;
    }

    if (this.get("script-props")) {
      scr = scr.toString().trim();
    } else {
      // Deprecated
      // Need to convert script functions to strings
      if (typeof scr == "function") {
        var scrStr = scr.toString().trim();
        scrStr = scrStr
          .replace(/^function[\s\w]*\(\)\s?\{/, "")
          .replace(/\}$/, "");
        scr = scrStr.trim();
      }

      var config = this.em.getConfig();
      var tagVarStart = escapeRegExp(config.tagVarStart || "{[ ");
      var tagVarEnd = escapeRegExp(config.tagVarEnd || " ]}");
      var reg = new RegExp(`${tagVarStart}([\\w\\d-]*)${tagVarEnd}`, "g");
      scr = (scr as string).replace(reg, (match, v) => {
        // If at least one match is found I have to track this change for a
        // better optimization inside JS generator
        this.scriptUpdated();
        const result = this.attributes[v] || "";
        return isArray(result) || typeof result == "object"
          ? JSON.stringify(result)
          : result;
      });
    }
    return scr;
  }

  emitUpdate(property?: string, ...args: any) {
    const { em } = this;
    const event = keyUpdate + (property ? `:${property}` : "");
    const item = property && this.get(property);
    property &&
      this.updated(property, item, property && this.previous(property));
    this.trigger(event, ...args);
    em && em.trigger(event, this, ...args);
    property &&
      ["components", "classes"].indexOf(property) >= 0 &&
      this.__propSelfToParent({
        component: this,
        changed: { [property]: item },
        options: args[2] || args[1] || {}
      });
  }

  /**
   * Execute callback function on itself and all inner components
   * @param  {Function} clb Callback function, the model is passed as an argument
   * @return {this}
   * @example
   * component.onAll(component => {
   *  // do something with component
   * })
   */
  onAll(clb: Function) {
    if (isFunction(clb)) {
      clb(this);
      this.components?.forEach(model => model.onAll(clb));
    }
    return this;
  }

  /**
   * Remove the component
   * @return {this}
   */
  remove(opts: any = {}) {
    const { em } = this;
    const coll = this.collection;
    const remove = () => {
      coll && coll.remove(this, opts);
      opts.root && this.getNewComponents("");
    };
    const rmOpts = { ...opts };
    [this, em].map(i =>
      i.trigger("component:remove:before", this, remove, rmOpts)
    );
    !rmOpts.abort && remove();
    return this;
  }

  /**
   * Move the component to another destination component
   * @param {Component} component Destination component (so the current one will be appended as a child)
   * @param {Object} opts Options for the append action
   * @returns {this}
   * @example
   * // Move the selected component on top of the wrapper
   * const dest = editor.getWrapper();
   * editor.getSelected().move(dest, { at: 0 });
   */
  move(component: Component, opts = {}) {
    this.remove({ temporary: 1 });
    component?.append(this, opts);
    return this;
  }

  /**
   * Reset id of the component and any of its style rule
   * @param {Object} [opts={}] Options
   * @return {this}
   * @private
   */
  resetId(opts = {}) {
    const { em } = this;
    const oldId = this.getId();
    if (!oldId) return;
    const newId = Component.createId(this);
    this.setId(newId);
    const rule = em && em.CssComposer.getIdRule(oldId);
    const selector = rule && rule.get("selectors").at(0);
    selector && selector.set("name", newId);
    return this;
  }

  _getStyleRule({ id }: { id?: string } = {}) {
    const { em } = this;
    const idS = id || this.getId();
    return em && em.CssComposer.getIdRule(idS);
  }

  _getStyleSelector(opts = {}) {
    const rule = this._getStyleRule(opts);
    return rule && rule.get("selectors").at(0);
  }

  _idUpdated(m: Component, v: any, opts: any = {}) {
    if (opts.idUpdate) return;

    const { ccid } = this;
    const { id } = this.get("attributes") || {};
    const idPrev = (this.previous("attributes") || {}).id || ccid;
    const list = Component.getList(this);

    // If the ID already exists I need to rollback to the old one
    if (list[id] || (!id && idPrev)) {
      return this.setId(idPrev, { idUpdate: 1 });
    }

    // Remove the old ID reference and add the new one
    delete list[idPrev];
    list[id] = this;
    this.ccid = id;

    // Update the style selector name
    const selector = this._getStyleSelector({ id: idPrev });
    selector && selector.set({ name: id, label: id });
  }
  createId: any;

  /**
   * Detect if the passed element is a valid component.
   * In case the element is valid an object abstracted
   * from the element will be returned
   * @param {HTMLElement}
   * @return {Object}
   * @private
   */
  isComponent(el: HTMLElement): any | { tagName: string } | false {
    return { tagName: toLowerCase(el.tagName) };
  }

  static ensureInList = (model: Component) => {
    const list = Component.getList(model);
    const id = model.getId();
    const current = list[id];

    if (!current) {
      // Insert in list
      list[id] = model;
    } else if (current !== model) {
      // Create new ID
      const nextId = Component.getIncrementId(id, list);
      model.setId(nextId);
      list[nextId] = model;
    }

    model.components?.forEach(i => Component.ensureInList(i));
  };

  /**
   * Relying simply on the number of components becomes a problem when you
   * store and load them back, you might hit collisions with new components
   * @param  {Model} model
   * @return {string}
   * @private
   */
  static createId = (model: Component, opts: any = {}) => {
    const list = Component.getList(model);
    const { idMap = {} } = opts;
    let { id } = model.get("attributes");
    let nextId;

    if (id) {
      nextId = Component.getIncrementId(id, list, opts);
      model.setId(nextId);
      if (id !== nextId) idMap[id] = nextId;
    } else {
      nextId = Component.getNewId(list);
    }

    list[nextId] = model;
    return nextId;
  };

  static getNewId = (list: { [id: string]: Component }) => {
    const count = Object.keys(list).length;
    // Testing 1000000 components with `+ 2` returns 0 collisions
    const ilen = count.toString().length + 2;
    const uid = (Math.random() + 1.1).toString(36).slice(-ilen);
    let newId = `i${uid}`;

    while (list[newId]) {
      newId = Component.getNewId(list);
    }

    return newId;
  };

  static getIncrementId = (
    id: string,
    list: { [id: string]: Component },
    opts: any = {}
  ) => {
    const { keepIds = [] } = opts;
    let counter = 1;
    let newId = id;

    if (keepIds.indexOf(id) < 0) {
      while (list[newId]) {
        counter++;
        newId = `${id}-${counter}`;
      }
    }

    return newId;
  };

  /**
   * The list of components is taken from the Components module.
   * Initially, the list, was set statically on the Component object but it was
   * not ok, as it was shared between multiple editor instances
   */
  static getList = (model: Component) => {
    const { opt = {} } = model;
    const { domc, em } = opt;
    const dm = domc || (em && em.DomComponents);
    return dm ? dm.componentsById : {};
  };

  /**
   * This method checks, for each parsed component and style object
   * (are not Components/CSSRules yet), for duplicated id and fixes them
   * This method is used in Components.js just after the parsing
   */
  static checkId = (
    components?: Component[] | Component,
    styles: CssRule[] | CssRules = [],
    list: { [id: string]: Component } = {},
    opts: any = {}
  ) => {
    if (components) {
      const comps = isArray(components) ? components : [components];
      const { keepIds = [] } = opts;
      comps.forEach(comp => {
        const { attributes = {}, components } = comp;
        const { id } = attributes;

        // Check if we have collisions with current components
        if (id && list[id] && keepIds.indexOf(id) < 0) {
          const newId = Component.getIncrementId(id, list);
          attributes.id = newId;
          // Update passed styles
          isArray(styles) &&
            styles.forEach(style => {
              const { selectors } = style;
              selectors.forEach((sel, idx) => {
                //@ts-ignore
                if (sel === `#${id}`) selectors[idx] = `#${newId}`;
              });
            });
        }

        //@ts-ignore
        components && Component.checkId(components, styles, list, opts);
      });
    }
  };

  static getDefaults = function() {
    return result(Component.prototype, "defaults");
  };
  defaults(): any {
    return {
      tagName: "div",
      type: "",
      name: "",
      removable: true,
      draggable: true,
      droppable: true,
      badgable: true,
      stylable: true,
      "stylable-require": "",
      "style-signature": "",
      unstylable: "",
      highlightable: true,
      copyable: true,
      resizable: false,
      editable: false,
      layerable: true,
      selectable: true,
      hoverable: true,
      void: false,
      state: "", // Indicates if the component is in some CSS state like ':hover', ':active', etc.
      status: "", // State, eg. 'selected'
      content: "",
      icon: "",
      style: "",
      styles: "", // Component related styles
      classes: "", // Array of classes
      script: "",
      "script-props": "",
      "script-export": "",
      attributes: "",
      traits: ["id", "title"],
      propagate: "",
      dmode: "",
      toolbar: null,
      [keySymbol]: 0,
      [keySymbols]: 0,
      [keySymbolOvrd]: 0,
      _undo: true,
      _undoexc: ["status", "open"]
    };
  }
}
