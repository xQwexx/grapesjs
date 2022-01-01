import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";

export default class CommandsConfig extends ModuleConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);
    this.stylePrefix += "com-";

    this.model = em.get("Canvas");
  }
  name = "Commands";
  model: any;

  // Default array of commands
  defaults: { [id: string]: any } = {};

  // If true, stateful commands (with `run` and `stop` methods) can't be runned multiple times.
  // So, if the command is already active, running it again will not execute the `run` method
  strict = true;
}
