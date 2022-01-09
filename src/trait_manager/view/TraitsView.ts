import { Collection } from "backbone";
import { Module } from "common/module";
import DomainViews from "domain_abstract/view/DomainViews";
import EditorModel from "editor/model/Editor";
import TraitManagerConfig from "trait_manager/config/config";
import Trait from "trait_manager/model/Trait";
import { includes } from "underscore";
import TraitView from "./TraitView";

const inputTypes = [
  "button",
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "email",
  "file",
  "hidden",
  "image",
  "month",
  "number",
  "password",
  "radio",
  "range",
  "reset",
  "search",
  "submit",
  "tel",
  "text",
  "time",
  "url",
  "week"
];

type TraitViewConstructor = { new (module: Module, model: Trait): TraitView };
export default class TraitsView extends DomainViews<Trait> {
  itemType: any;

  itemsViewLookup: { [id: string]: TraitViewConstructor } = {};

  className: string;

  constructor(module: Module, collection?: Collection, el?: HTMLElement) {
    super(module, collection);
    el && (this.el = el);

    this.className = `${this.pfx}traits`;
    this.listenTo(this.em, "component:toggled", this.updatedCollection);
  }

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const { ppfx, className, em } = this;
    const comp = em.getSelected();
    this.el.className = `${className} ${ppfx}one-bg ${ppfx}two-color`;
    this.collection = comp ? comp.get("traits") : [];
    this.render();
  }
  itemViewNotFound(type: string) {
    const ns = "Traits";
    const { em } = this;
    const warn = `${ns ? `[${ns}]: ` : ""}'${type}' type not found`;
    em && em.logWarning(warn);
  }

  getModelView(model: Trait) {
    const itemsView = this.itemsViewLookup;
    var typeField = model.get("type");
    let view;
    var itemView: TraitViewConstructor = TraitView;
    if (itemsView[typeField]) {
      itemView = itemsView[typeField];
    } else if (
      typeField &&
      !itemsView[typeField] &&
      !includes(inputTypes, typeField)
    ) {
      this.itemViewNotFound(typeField);
    }

    if (model.view) {
      view = model.view;
    } else {
      view = new itemView(this.module, model);
    }
    return view;
  }
}
