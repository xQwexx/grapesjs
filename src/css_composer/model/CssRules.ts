import Backbone, { AddOptions } from "backbone";
import EditorModel from "editor/model/Editor";
import CssRule from "./CssRule";

const { Collection } = Backbone;

export default class CssRules extends Collection<CssRule> {
  model = CssRule;

  editor?: EditorModel;

  initialize(models: any, opt: any) {
    // Inject editor
    if (opt && opt.em) this.editor = opt.em;

    // This will put the listener post CssComposer.postLoad
    setTimeout(() => {
      this.on("remove", this.onRemove);
      this.on("add", this.onAdd);
    });
  }

  toJSON(opts = {}) {
    const result: any[] = Collection.prototype.toJSON.call(this, opts);
    return result.filter(i => i.style);
  }

  onAdd(model: any, c: any, o: any) {
    model.ensureSelectors(model, c, o); // required for undo
  }

  onRemove(removed: any) {
    const em = this.editor;
    em?.stopListening(removed);
    em?.UndoManager.remove(removed);
  }

  add(model: CssRule, options?: AddOptions): CssRule;
  add(models: CssRule[], options?: AddOptions): CssRule[];
  add(models: string, options?: AddOptions): CssRule[];

  add(models: unknown, opt?: any): any {
    if (typeof models === "string") {
      models = this.editor?.Parser.parseCss(models);
    }
    opt.em = this.editor;
    return Collection.prototype.add.apply(this, [models as any, opt]);
  }
}
