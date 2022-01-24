import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";

export default class ModalConfig extends ModuleConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);
  }
  stylePrefix = "mdl-";

  name = "Modal";

  title = "";

  content = "";

  backdrop = true;

  // Avoid rendering the default modal.
  custom = false;

  /**
   * Extend ModalView object (view/ModalView.js)
   * @example
   * extend = {
   *   template() {
   *     return '<div>...New modal template...</div>';
   *   },
   * };
   */
  extend = {};
}
