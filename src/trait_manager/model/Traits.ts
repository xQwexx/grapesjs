import Backbone from "backbone";
import EditorModel from "editor/model/Editor";
import { isString, isArray } from "underscore";
import Trait from "./Trait";
import TraitFactory from "./TraitFactory";

export default class Traits extends Backbone.Collection<Trait> {
  model = Trait;

  em: EditorModel;
  target?: string;
  constructor(coll: any, options: any = {}) {
    super(coll, options);
    this.em = options.em || "";
    this.listenTo(this, "add", this.handleAdd);
    this.listenTo(this, "reset", this.handleReset);
  }

  handleReset(coll: Traits, o: { previousModels?: Trait[] } = {}) {
    o.previousModels?.forEach(model => model.trigger("remove"));
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

  //@ts-ignore
  add(models: string | Trait | string[] | Trait[] | Traits, opt = {}): Trait[] {
    const em = this.em;
    const result: any[] = [];

    // Use TraitFactory if necessary
    if (isString(models) || isArray(models)) {
      const tm = em?.TraitManager;
      const tmOpts = tm?.getConfig();
      const tf = TraitFactory(tmOpts);

      if (isString(models)) {
        models = [models as string];
      }

      for (var i = 0, len = models.length; i < len; i++) {
        const str = models[i];
        const model = isString(str)
          ? tf.build(str as string)[0]
          : (str as Trait);
        model.target = this.target;
        result[i] = model;
      }
    }
    return Backbone.Collection.prototype.add.apply(this, {
      //@ts-ignore
      models: result,
      ...opt
    });
  }
}
