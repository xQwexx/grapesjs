import { Model } from "common";
import EditorModel from "editor/model/Editor";
import SelectorManagerConfig from "selector_manager/config/config";
import SelectorUtils, {
  SelectorType
} from "selector_manager/utils/SelectorUtils";
import { result, forEach, keys, isUndefined } from "underscore";
import UtilsModule from "utils";

const TYPE_CLASS = 1;
const TYPE_ID = 2;

/**
 * @typedef Selector
 * @property {String} name Selector name, eg. `my-class`
 * @property {String} label Selector label, eg. `My Class`
 * @property {Number} [type=1] Type of the selector. 1 (class) | 2 (id)
 * @property {Boolean} [active=true] If not active, it's not selectable by the Style Manager.
 * @property {Boolean} [private=false] If true, it can't be seen by the Style Manager, but it will be rendered in the canvas and in export code.
 * @property {Boolean} [protected=false] If true, it can't be removed from the attacched component.
 */
export default class Selector extends Model {
  defaults() {
    return {
      name: "",
      label: "",
      type: SelectorType.class,
      active: true,
      private: false,
      protected: false,
      _undo: true
    };
  }

  em: EditorModel;

  constructor(props = {}, opts: { config: SelectorManagerConfig }) {
    super(props, opts);
    const { config } = opts;
    const name = this.get("name");
    const label = this.get("label");

    if (!name) {
      this.set("name", label);
    } else if (!label) {
      this.set("label", name);
    }

    const namePreEsc = this.get("name");
    const { escapeName } = config;
    const nameEsc = escapeName
      ? escapeName(namePreEsc)
      : this.escapeName(namePreEsc);
    this.set("name", nameEsc);
    this.em = config.em;
  }

  get type() {
    return this.get("type") as SelectorType;
  }

  isId() {
    return this.type === SelectorType.id;
  }

  isClass() {
    return this.type === SelectorType.class;
  }

  getFullName(opts: { escape?: (n: string) => string } = {}) {
    const { escape } = opts;
    const name = this.get("name");
    let pfx = "";

    switch (this.type) {
      case SelectorType.class:
        pfx = ".";
        break;
      case SelectorType.id:
        pfx = "#";
        break;
    }

    return pfx + (escape ? escape(name) : name);
  }

  /**
   * Get selector as a string.
   * @returns {String}
   * @example
   * // Given such selector: { name: 'my-selector', type: 2 }
   * console.log(selector.toString());
   * // -> `#my-selector`
   */
  toString() {
    return this.getFullName();
  }

  /**
   * Get selector label.
   * @returns {String}
   * @example
   * // Given such selector: { name: 'my-selector', label: 'My selector' }
   * console.log(selector.getLabel());
   * // -> `My selector`
   */
  getLabel() {
    return this.get("label");
  }

  /**
   * Update selector label.
   * @param {String} label New label
   * @example
   * // Given such selector: { name: 'my-selector', label: 'My selector' }
   * selector.setLabel('New Label')
   * console.log(selector.getLabel());
   * // -> `New Label`
   */
  setLabel(label: string) {
    return this.set("label", label);
  }

  /**
   * Get selector active state.
   * @returns {Boolean}
   */
  getActive() {
    return this.get("active");
  }

  /**
   * Update selector active state.
   * @param {Boolean} value New active state
   */
  setActive(value: boolean) {
    return this.set("active", value);
  }

  toJSON(opts = {}) {
    const { em } = this;
    let obj = Model.prototype.toJSON.call(this, [opts]);
    const defaults = result(this, "defaults");

    if (em && em.getConfig().avoidDefaults) {
      forEach(defaults, (value, key) => {
        if (obj[key] === value) {
          delete obj[key];
        }
      });

      if (obj.label === obj.name) {
        delete obj.label;
      }

      const objLen = keys(obj).length;

      if (objLen === 1 && obj.name) {
        obj = obj.name;
      }

      if (objLen === 2 && obj.name && obj.type) {
        obj = this.getFullName();
      }
    }

    return obj;
  }
  escapeName = (name: string) => {
    return `${name}`.trim().replace(/([^a-z0-9\w-\:]+)/gi, "-");
  };
}

Selector.prototype.idAttribute = "name";
