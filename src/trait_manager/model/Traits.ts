import Backbone from "backbone";
import EditorModel from "editor/model/Editor";
import { isString, isArray } from "underscore";
import Trait from "./Trait";
import TraitFactory from "./TraitFactory";

export default class Traits extends Backbone.Collection<Trait> {
  model = Trait;

  em: EditorModel;
  target;
  initialize(coll, options = {}) {
    this.em = options.em || "";
    this.listenTo(this, "add", this.handleAdd);
    this.listenTo(this, "reset", this.handleReset);
  }

  handleReset(coll, { previousModels = [] } = {}) {
    previousModels.forEach(model => model.trigger("remove"));
  }

  handleAdd(model: Trait) {
    const target = this.target;

    if (target) {
      model.target = target;
    }
  }

  setTarget(target: any) {
    this.target = target;
  }

  add(models, opt) {
    const em = this.em;

    // Use TraitFactory if necessary
    if (isString(models) || isArray(models)) {
      const tm = em?.TraitManager;
      const tmOpts = tm?.getConfig();
      const tf = TraitFactory(tmOpts);

      if (isString(models)) {
        models = [models];
      }

      for (var i = 0, len = models.length; i < len; i++) {
        const str = models[i];
        const model = isString(str) ? tf.build(str)[0] : str;
        model.target = this.target;
        models[i] = model;
      }
    }

    return Backbone.Collection.prototype.add.apply(this, [models, opt]);
  }
}
