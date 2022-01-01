import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";

export default class CodeManagerConfig extends ModuleConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);
    this.stylePrefix += "cm-";
  }

  name = "CodeManager";

  inlineCss = false;
}
