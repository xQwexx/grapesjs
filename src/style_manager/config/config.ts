import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";
import { isUndefined } from "underscore";
export interface IStyleManagerConfig {
  sectors?: any[];

  // Specify the element to use as a container, string (query) or HTMLElement
  // With the empty value, nothing will be rendered
  appendTo?: string;

  // Hide the property in case it's not stylable for the
  // selected component (each component has 'stylable' property)
  hideNotStylable?: boolean;

  // Highlight changed properties of the selected component
  highlightChanged?: boolean;

  // Highlight computed properties of the selected component
  highlightComputed?: boolean;

  // Show computed properties of the selected component, if this value
  // is set to false, highlightComputed will not take effect
  showComputed?: boolean;

  // Adds the possibility to clear property value from the target style
  clearProperties?: boolean;

  // Properties not to take in account for computed styles
  avoidComputed?: string[];
}

export default class StyleManagerConfig extends ModuleConfig
  implements IStyleManagerConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);
    const { config } = em;

    const smc = config.styleManager as IStyleManagerConfig;
    /*Object.keys(smc).forEach(k => {
      const key = k as keyof IStyleManagerConfig;
      //@ts-ignore
      if (!isUndefined(smc[key])) this[key] = smc[key] ?? "";
    });*/
  }
  stylePrefix = "sm-";

  name = "StyleManager";

  sectors: any[] = [];

  // Specify the element to use as a container, string (query) or HTMLElement
  // With the empty value, nothing will be rendered
  appendTo = "";

  // Hide the property in case it's not stylable for the
  // selected component (each component has 'stylable' property)
  hideNotStylable = true;

  // Highlight changed properties of the selected component
  highlightChanged = true;

  // Highlight computed properties of the selected component
  highlightComputed = true;

  // Show computed properties of the selected component, if this value
  // is set to false, highlightComputed will not take effect
  showComputed = true;

  // Adds the possibility to clear property value from the target style
  clearProperties = true;

  // Properties not to take in account for computed styles
  avoidComputed: string[] = ["width", "height"];
}
