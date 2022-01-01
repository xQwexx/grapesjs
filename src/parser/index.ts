/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/parser/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  parser: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const { Parser } = editor;
 * ```
 * ## Available Events
 * * `parse:html` - On HTML parse, an object containing the input and the output of the parser is passed as an argument
 * * `parse:css` - On CSS parse, an object containing the input and the output of the parser is passed as an argument
 *
 * ## Methods
 * * [getConfig](#getconfig)
 * * [parseHtml](#parsehtml)
 * * [parseCss](#parsecss)
 *
 * @module Parser
 */
import { Module } from "common/module";
import EditorModel from "editor/model/Editor";
import ParserConfig from "./config/config";
import parserCss from "./model/ParserCss";
import parserHtml from "./model/ParserHtml";

export default class ParserModule extends Module<ParserConfig> {
  pHtml: parserHtml;
  pCss: any;
  compTypes = "";

  constructor(em: EditorModel) {
    super(em, ParserConfig);

    //@ts-ignore
    this.config.Parser = this;
    this.pHtml = new parserHtml(this.config);
    this.pCss = parserCss(this.config);
  }

  init(config = {}) {
    return this;
  }

  /**
   * Parse HTML string and return the object containing the Component Definition
   * @param  {String} input HTML string to parse
   * @param  {Object} [options] Options
   * @param  {String} [options.htmlType] [HTML mime type](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02) to parse
   * @returns {Object} Object containing the result `{ html: ..., css: ... }`
   * @example
   * const resHtml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
   *   htmlType: 'text/html', // default
   * });
   * // By using the `text/html`, this will fix automatically all the HTML syntax issues
   * // Indeed the final representation, in this case, will be `<div>Hi</div><table></table>`
   * const resXml = Parser.parseHtml(`<table><div>Hi</div></table>`, {
   *   htmlType: 'application/xml',
   * });
   * // This will preserve the original format as, from the XML point of view, is a valid format
   */
  parseHtml(input: string, options = {}) {
    const { em, compTypes } = this;
    this.pHtml.compTypes = em ? em.get("DomComponents").getTypes() : compTypes;
    return this.pHtml.parse(input, this.pCss, options);
  }

  /**
   * Parse CSS string and return an array of valid definition objects for CSSRules
   * @param  {String} input CSS string to parse
   * @returns {Array<Object>} Array containing the result
   * @example
   * const res = Parser.parseCss('.cls { color: red }');
   * // [{ ... }]
   */
  parseCss(input: string) {
    return this.pCss.parse(input);
  }

  destroy() {
    [this.config, this.pHtml, this.pCss].forEach(i => (i = {}));
  }
}
