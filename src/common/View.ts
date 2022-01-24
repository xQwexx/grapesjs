import Backbone, { Model } from "backbone";
import CanvasModule from "canvas";
import EditorModel from "editor/model/Editor";
import { IModule, Module, ModuleConfig } from "./module";

export default class View<
  TModel extends Model,
  TUI extends Element = HTMLElement
> extends Backbone.View<TModel, TUI> {
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

  constructor(module: Module, model: TModel) {
    super({ model: model });
    this.module = module;
  }
}