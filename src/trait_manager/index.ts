import { any, defaults, isElement } from "underscore";
import defaultOpts from "./config/config";
import TraitsView from "./view/TraitsView";
import TraitView from "./view/TraitView";
import TraitSelectView from "./view/TraitSelectView";
import TraitCheckboxView from "./view/TraitCheckboxView";
import TraitNumberView from "./view/TraitNumberView";
import TraitColorView from "./view/TraitColorView";
import TraitButtonView from "./view/TraitButtonView";
import { Module } from "common/module";
import EditorModel from "editor/model/Editor";
import TraitManagerConfig from "./config/config";
import Trait from "./model/Trait";

const typesDef = {
  text: TraitView,
  number: TraitNumberView,
  select: TraitSelectView,
  checkbox: TraitCheckboxView,
  color: TraitColorView,
  button: TraitButtonView
};
export default class TraitManagerModule extends Module<TraitManagerConfig> {
  TraitsViewer?: TraitsView;
  types: { [id: string]: any };

  constructor(em: EditorModel) {
    super(em, TraitManagerConfig);
    defaults(this.config, defaultOpts);
    this.types = { ...typesDef };
  }

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   */
  init(config = {}) {
    return this;
  }

  postRender() {
    const elTo = this.getConfig().appendTo;

    if (elTo) {
      const el = isElement(elTo) ? elTo : document.querySelector(elTo);
      el?.appendChild(this.render());
    }
  }

  /**
   *
   * Get Traits viewer
   * @private
   */
  getTraitsViewer() {
    return this.TraitsViewer;
  }

  /**
   * Add new trait type
   * @param {string} name Type name
   * @param {Object} methods Object representing the trait
   */
  addType(name: string, trait: Trait) {
    const baseView = this.getType("text");
    this.types[name] = baseView.extend(trait);
  }

  /**
   * Get trait type
   * @param {string} name Type name
   * @return {Object}
   */
  getType(name: string) {
    return this.getTypes()[name];
  }

  /**
   * Get all trait types
   * @returns {Object}
   */
  getTypes() {
    return this.types;
  }

  render() {
    const el = this.TraitsViewer?.el;
    this.TraitsViewer = new TraitsView(this, undefined, el);
    this.TraitsViewer.itemsViewLookup = this.getTypes();
    this.TraitsViewer.updatedCollection();
    return this.TraitsViewer.el;
  }

  destroy() {
    this.TraitsViewer?.remove();
    //@ts-ignore
    [this.config, this.TraitsViewer].forEach(i => (i = {}));
  }
}
