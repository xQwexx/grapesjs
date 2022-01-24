import { Module, ModuleConfig } from "common/module";
import CssRule from "css_composer/model/CssRule";
import EditorModel from "editor/model/Editor";

export default class CssComposerConfig extends ModuleConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);

    var elStyle = em.config.style || "";
    //@ts-ignore
    this.rules = elStyle || this.rules;
    this.stm = em.get("StorageManager");
  }

  name = "CssComposer";

  protected stylePrefix = "css-";
  
  stm?: any;

  // Default CSS style
  rules: CssRule[] = [];
}
