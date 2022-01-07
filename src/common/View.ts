import Backbone, { Model } from "backbone";
import { ModuleConfig } from "./module";

export default class View<TModel extends Model> extends Backbone.View<TModel> {

  protected config: ModuleConfig;

  get em() {return this.config.em}

  get pfx() {return this.config.stylePrefix}
  get ppfx() {return this.config.stylePrefix}
  constructor(model: TModel, config: ModuleConfig) {
    super({model: model});
    this.config = config;
  }
}