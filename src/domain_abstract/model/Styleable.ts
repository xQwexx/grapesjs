import { isString, isArray, keys } from "underscore";
import { shallowDiff } from "utils/mixins";
import ParserHtml from "parser/model/ParserHtml";
import { Model } from "backbone";

const parseStyle = new ParserHtml().parseStyle;

interface IStyleable {
  Style: { [id: string]: string };
  Selectors: string;
  Classes: string;
}

interface IStyleOps {
  important?: string[];
  props?: { [id: string]: string };
}

export default class Styleable extends Model implements IStyleable {
  em?: any;

  get Style(): { [id: string]: string } {
    return this.get("style");
  }
  set Style(value: { [id: string]: string }) {
    this.set("style", value);
  }

  set Selectors(value: string) {
    this.set("selectors", value);
  }
  get Selectors(): string {
    return this.get("selectors");
  }
  set Classes(value: string) {
    this.set("classes", value);
  }
  get Classes(): string {
    return this.get("classes");
  }

  /**
   * To trigger the style change event on models I have to
   * pass a new object instance
   * @param {Object} prop
   * @return {Object}
   */
  extendStyle(prop: Object) {
    return { ...this.getStyle(), ...prop };
  }

  /**
   * Get style object
   * @return {Object}
   */
  getStyle(prop: IStyleOps | string = {}): { [id: string]: string } {
    const style = this.Style || {};
    const result = { ...style };
    return prop && isString(prop) ? { prop: result[prop] } : result;
  }

  /**
   * Set new style object
   * @param {Object|string} prop
   * @param {Object} opts
   * @return {Object} Applied properties
   */
  setStyle(prop = {}, opts = {}) {
    if (isString(prop)) {
      prop = parseStyle(prop);
    }

    const propOrig = this.getStyle(opts);
    const propNew = { ...prop };
    this.set("style", propNew, opts);
    const diff = shallowDiff(propOrig, propNew);
    keys(diff).forEach(pr => {
      this.trigger(`change:style:${pr}`);
      this.em?.trigger(`styleable:change`, this, pr);
      this.em?.trigger(`styleable:change:${pr}`, this, pr);
    });

    return propNew;
  }

  /**
   * Add style property
   * @param {Object|string} prop
   * @param {string} value
   * @example
   * this.addStyle({color: 'red'});
   * this.addStyle('color', 'blue');
   */
  addStyle(prop: Object | string, value = "", opts = {}) {
    if (typeof prop == "string") {
      prop = {
        prop: value
      };
    } else {
      opts = value || {};
    }

    prop = this.extendStyle(prop);
    this.setStyle(prop, opts);
  }

  /**
   * Remove style property
   * @param {string} prop
   */
  removeStyle(prop: string) {
    let style = this.getStyle();
    delete style[prop];
    this.setStyle(style);
  }

  /**
   * Returns string of style properties
   * @param {Object} [opts={}] Options
   * @return {String}
   */
  styleToString(opts: IStyleOps = {}): string {
    const result = [];
    const style = this.getStyle(opts);

    for (let prop in style) {
      const imp = opts.important;
      const important = isArray(imp) ? imp.indexOf(prop) >= 0 : imp;
      const value = `${style[prop]}${important ? " !important" : ""}`;
      const propPrv = prop.substr(0, 2) == "__";
      value && !propPrv && result.push(`${prop}:${value};`);
    }

    return result.join("");
  }

  getSelectors() {
    return this.Selectors || this.Classes;
  }

  getSelectorsString() {
    //@ts-ignore
    return this.getSelectors().getFullString();
  }
}
