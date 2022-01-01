import Dragger from "./Dragger";
import Sorter from "./Sorter";
import Resizer from "./Resizer";
import * as mixins from "./mixins";
import { Module, ModuleConfig } from "common/module";
import { extend } from "underscore";
import EditorModel from "editor/model/Editor";
class UtilsConfig extends ModuleConfig {
  name = "Utils";
}
export default class UtilsModule extends Module<UtilsConfig> {
  constructor(em: EditorModel) {
    super(em, UtilsConfig);
  }
  /**
   * Initialize module
   */
  init() {
    return this;
  }

  destroy() {}

  helpers = { ...mixins };
  Sorter = Sorter;
}
