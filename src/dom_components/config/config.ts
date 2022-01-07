import { Module, ModuleConfig } from "common/module";
import Component from "dom_components/model/Component";
import Components from "dom_components/model/Components";
import EditorModel from "editor/model/Editor";

export default class DomComponentsConfig extends ModuleConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);
    this.stylePrefix += "comp-";
    //@ts-ignore
    this.components = em.config.components || this.components;

    this.modal = em.ModalDialog || "";
    this.am = em.AssetManager || "";
    this.stm = em.StorageManager;
    if (em.get("hasPages")) {
      this.components = [];
    }
  }

  name = "DomComponents";

  modal: any;
  am: any;
  stm?: any;

  // Could be used for default components
  components: Component[] = [];

  // If the component is draggable you can drag the component itself (not only from the toolbar)
  draggableComponents = 1;

  // Generally, if you don't edit the wrapper in the editor, like
  // custom attributes, you don't need the wrapper stored in your JSON
  // structure, but in case you need it you can use this option.
  // If you have `config.avoidInlineStyle` disabled the wrapper will be stored
  // as we need to store inlined style.
  storeWrapper = 0;

  /**
   * You can setup a custom component definition processor before adding it into the editor.
   * It might be useful to transform custom objects (es. some framework specific JSX) to GrapesJS component one.
   * This custom function will be executed on ANY new added component to the editor so make smart checks/conditions
   * to avoid doing useless executions
   * By default, GrapesJS supports already elements generated from React JSX preset
   * @example
   * processor: (obj) => {
   *  if (obj.$$typeof) { // eg. this is a React Element
   *     const gjsComponent = {
   *      type: obj.type,
   *      components: obj.props.children,
   *      ...
   *     };
   *     ...
   *     return gjsComponent;
   *  }
   * }
   */
  processor?: (obj: any) => object;

  // List of HTML void elements
  // https://www.w3.org/TR/2011/WD-html-markup-20110113/syntax.html#void-elements
  voidElements = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "menuitem",
    "meta",
    "param",
    "source",
    "track",
    "wbr"
  ];
}
