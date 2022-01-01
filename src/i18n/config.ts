import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";
import en from "./locale/en";

export default class I18nConfig extends ModuleConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);

    const config = em.config;
    this.messages = {
      ...this.messages,
      //@ts-ignore
      ...(config.messages || {})
    };
  }
  name = "I18n";
  // Locale value
  locale = "en";

  // Fallback locale
  localeFallback = "en";

  // Detect locale by checking browser language
  detectLocale = true;

  // Show warnings when some of the i18n resources are missing
  debug = 0;

  // Messages to translate
  messages: { [languageId: string]: any } = {
    en
  };
}
