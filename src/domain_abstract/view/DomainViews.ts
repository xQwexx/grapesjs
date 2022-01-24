import { includes } from "underscore";
import Backbone, { Collection, View } from "backbone";
import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";
export interface somr {}
export default abstract class DomainViews<
  T extends Backbone.Model
> extends Backbone.View<T> {
  itemsView: View<T>[] = [];
  autoAdd = false;

  module: Module;

  get em() {
    return this.module.em;
  }

  get pfx() {
    return this.module.config.pfx;
  }
  get ppfx() {
    return this.module.config.ppfx;
  }
  constructor(module: Module, collection?: Collection) {
    super({ collection });
    this.module = module;
    this.autoAdd && this.listenTo(this.collection, "add", this.addTo);
  }

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  private addTo(model: T) {
    this.add(model);
  }

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model: T, fragment?: DocumentFragment) {
    const { itemsView } = this;
    var frag = fragment || null;
    const view = this.getModelView(model);
    itemsView.push(view);
    const rendered = view.render().el;

    if (frag) frag.appendChild(rendered);
    else this.$el.append(rendered);
  }

  render() {
    var frag = document.createDocumentFragment();
    this.clearItems();
    this.$el.empty();

    if (this.collection.length)
      this.collection.each(model => {
        this.add(model, frag);
      });

    this.$el.append(frag);
    this.onRender();
    return this;
  }

  abstract getModelView(model: T): View<T>;

  onRender() {}

  onRemoveBefore(itemsView: View<T>[], opts = {}) {}
  onRemove(itemsView: View<T>[], opts = {}) {}

  remove(opts: any = {}) {
    const { itemsView } = this;
    this.onRemoveBefore(itemsView, opts);
    this.clearItems();
    Backbone.View.prototype.remove.apply(this, opts);
    this.onRemove(itemsView, opts);
    return this;
  }

  clearItems() {
    const itemsView = this.itemsView || [];
    // TODO Traits do not update the target anymore
    // items.forEach(item => item.remove());
    // this.items = [];
  }
}