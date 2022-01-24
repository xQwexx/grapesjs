import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";

export default class RichTextEditorConfig extends ModuleConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);
  }
  stylePrefix = "rte-";

  name = "RichTextEditor";

  // If true, moves the toolbar below the element when the top canvas
  // edge is reached
  adjustToolbar = true;

  // Default RTE actions
  actions = ["bold", "italic", "underline", "strikethrough", "link"];
}
