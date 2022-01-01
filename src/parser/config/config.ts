import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";

export enum HtmlType {
  textHtml = "text/html",
  textXml = "text/xml",
  appXml = "application/xml",
  appXhtml = "application/xhtml+xml",
  imgSvgXml = "image/svg+xml"
}

export interface IParserConfig {
  textTags?: string[];

  // Custom CSS parser
  // @see https://grapesjs.com/docs/guides/Custom-CSS-parser.html
  parserCss?: any;

  // Custom HTML parser
  // At the moment, the custom HTML parser should rely on DOM Node instance as the result
  // @example
  // The return should be an instance of an Node as the root to traverse
  // https://developer.mozilla.org/en-US/docs/Web/API/Node
  // parserHtml: (input, opts = {}) => (new DOMParser()).parseFromString(input, 'text/xml')
  // Here the result will be XMLDocument, which extends Node
  parserHtml?: any;

  // DOMParser mime type (default 'text/html')
  // @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
  // If you use the `text/html` parser, it will fix the invalid syntax automatically
  htmlType?: HtmlType;
}

export default class ParserConfig extends ModuleConfig
  implements IParserConfig {
  constructor(em: EditorModel, module: Module) {
    super(em, module);
    const config = em.getConfig();
    this.keepEmptyTextNodes = config.keepEmptyTextNodes;
  }
  name = "Parser";

  keepEmptyTextNodes: any;

  textTags = ["br", "b", "i", "u", "a", "ul", "ol"];

  htmlType = HtmlType.textHtml;
}
