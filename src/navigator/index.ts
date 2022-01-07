import defaults from "./config/config";
import View from "./view/ItemView";
import { isElement } from "underscore";
import { Module } from "common/module";
import LayerManagerConfig from "./config/config";
import EditorModel from "editor/model/Editor";
import Component from "dom_components/model/Component";

export default class LayerManagerModule extends Module<LayerManagerConfig> {
  constructor(em: EditorModel) {
    super(em, LayerManagerConfig);
  }

  layers?: any;

  init(opts = {}) {
    return this;
  }

  onLoad() {
    this.em.on("component:selected", this.componentChanged);
    this.componentChanged();
  }

  postRender() {
    const elTo = this.config.appendTo;
    const root = this.config.root;
    root && this.setRoot(root);

    if (elTo) {
      const el = isElement(elTo) ? elTo : document.querySelector(elTo);
      el?.appendChild(this.render());
    }
  }

  /**
   * Set new root for layers
   * @param {HTMLElement|Component|String} el Component to be set as the root
   * @return {self}
   */
  setRoot(el: any) {
    this.layers.setRoot(el);
    return this;
  }

  /**
   * Get the root of layers
   * @return {Component}
   */
  getRoot() {
    return this.layers?.model;
  }

  /**
   * Return the view of layers
   * @return {View}
   */
  getAll() {
    return this.layers;
  }

  /**
   * Triggered when the selected component is changed
   * @private
   */
  componentChanged(selected?: Component, opts: any = {}) {
    if (opts.fromLayers) return;
    const opened = this.em.get("opened");
    const model = this.em.getSelected();
    const scroll = this.config.scrollLayers;
    let parent = model && model.collection ? model.collection.parent : null;
    for (let cid in opened) opened[cid].set("open", 0);

    while (parent) {
      parent.set("open", 1);
      opened[parent.cid] = parent;
      parent = parent.collection ? parent.collection.parent : null;
    }

    if (model && scroll) {
      const el = model.viewLayer && model.viewLayer.el;
      el && el.scrollIntoView(scroll);
    }
  }

  render() {
    const ItemView = View.extend(this.config.extend);
    this.layers?.remove();
    this.layers = new ItemView({
      ItemView,
      level: 0,
      config: this.config,
      //@ts-ignore
      opened: this.config.opened || {},
      model: this.em.DomComponents.getWrapper()
    });
    return this.layers.render().el;
  }

  destroy() {
    this.layers?.remove();
    [this.layers].forEach(i => (i = {}));
  }
}
