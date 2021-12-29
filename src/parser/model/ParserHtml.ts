import { each, isString, isFunction } from "underscore";
import BrowserParserHtml from "./BrowserParserHtml";
import { ParserConfig, defaultParserConfig } from "../config/config";
import { Collection } from "backbone";
import { EditorConfig } from "editor/config/config";
export interface IComponent {
  //Component type, eg. `text`, `image`, `video`, etc.
  type: string;
  //HTML tag of the component, eg. `span`. Default: `div`
  tagName: string;
  //Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
  attributes: { [id: string]: string | boolean };
  //Name of the component. Will be used, for example, in Layers and badges
  name: string;
  //When `true` the component is removable from the canvas, default: `true`
  removable: boolean;
  /*Indicates if it's possible to drag the component inside others.
   * You can also specify a query string to indentify elements,
   * eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
   * containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
   */
  draggable: boolean | string | Function;
  /*Indicates if it's possible to drop other components inside. You can use
   * a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
   */
  droppable: boolean | string | Function;
  //Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
  badgable: boolean;
  /*True if it's possible to style the component.
   * You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
   * will be hidden from the style manager. Default: `true`
   */
  stylable: boolean | string[];
  //Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
  stylableRequire: string[];
  //Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
  unstylable: string[];
  //It can be highlighted with 'dotted' borders if true. Default: `true`
  highlightable: boolean;
  //True if it's possible to clone the component. Default: `true`
  copyable: boolean;
  //Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/artf/grapesjs/blob/master/src/utils/Resizer.js). Default: `false`
  resizable: boolean;
  //Allow to edit the content of the component (used on Text components). Default: `false`
  editable: boolean;
  //Set to `false` if you need to hide the component inside Layers. Default: `true`
  layerable: boolean;
  //Allow component to be selected when clicked. Default: `true`
  selectable: boolean;
  //Shows a highlight outline when hovering on the element if `true`. Default: `true`
  hoverable: boolean;
  //This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
  void: boolean;
  //Component related styles, eg. `.my-component-class { color: red }`
  styles: string;
  //Content of the component (not escaped) which will be appended before children rendering. Default: `''`
  content: string;
  //Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
  icon: string;
  //Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
  script: string | Function;
  /*You can specify javascript available only in export functions (eg. when you get the HTML).
   * If this property is defined it will overwrite the `script` one (in export functions). Default: `''`
   */
  scriptExport: string | Function;
  //Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
  traits: Object[] | string[];
  /*Indicates an array of properties which will be inhereted by all NEW appended children.
   * For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
   * and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
   */
  propagate: string[];
  /*Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
   * Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
   * By default, when `toolbar` property is falsy the editor will add automatically commands like `move`, `delete`, etc. based on its properties.
   */
  toolbar: Object[];
  //Children components. Default: `null`
  components: any; //Collection<IComponent>
  style: { [id: string]: string };
  classes: string[];
}
const modelAttrStart = "data-gjs-";
const event = "parse:html";

export default class ParserHtml {
  c: EditorConfig;
  compTypes: any[] = [];

  constructor(config: EditorConfig = {}) {
    this.c = config;
  }
  private parseAttrValue(value: string): string | boolean {
    const valueLen = value.length;
    const valStr = value && isString(value);
    const firstChar = valStr && value.substr(0, 1);
    const lastChar = valStr && value.substr(valueLen - 1);

    let valueConverted = value === "true" ? true : value;
    valueConverted = value === "false" ? false : valueConverted;

    if (
      (firstChar == "{" && lastChar == "}") ||
      (firstChar == "[" && lastChar == "]")
    ) {
      // Try to parse JSON where it's possible
      // I can get false positive here (eg. a selector '[data-attr]')
      // so put it under try/catch and let fail silently
      try {
        valueConverted = JSON.parse(value);
      } catch (e) {}
    }

    return valueConverted;
  }

  /**
   * Extract component props from an attribute object
   * @param {Object} attr
   * @returns {Object} An object containing props and attributes without them
   */
  splitPropsFromAttr(attr: { [id: string]: string } = {}) {
    const props: { [id: string]: string | boolean } = {};
    const attrs: { [id: string]: string } = {};

    each(attr, (value, key) => {
      if (key.indexOf(modelAttrStart) === 0) {
        const modelAttr = key.replace(modelAttrStart, "");
        const valueConverted = this.parseAttrValue(value);
        props[modelAttr] = valueConverted;
      } else {
        attrs[key] = value;
      }
    });

    return {
      props,
      attrs
    };
  }

  /**
   * Parse style string to object
   * @param {string} str
   * @return {Object}
   * @example
   * var stl = ParserHtml.parseStyle('color:black; width:100px; test:value;');
   * console.log(stl);
   * // {color: 'black', width: '100px', test: 'value'}
   */
  parseStyle(str: string): { [id: string]: string } {
    var result: { [id: string]: string } = {};
    var decls = str.split(";");
    for (var i = 0, len = decls.length; i < len; i++) {
      var decl = decls[i].trim();
      if (!decl) continue;
      var prop = decl.split(":");
      result[prop[0].trim()] = prop
        .slice(1)
        .join(":")
        .trim();
    }
    return result;
  }

  /**
   * Parse class string to array
   * @param {string} str
   * @return {Array<string>}
   * @example
   * var res = ParserHtml.parseClass('test1 test2 test3');
   * console.log(res);
   * // ['test1', 'test2', 'test3']
   */
  parseClass(str: string): string[] {
    const result = [];
    const cls = str.split(" ");
    for (let i = 0, len = cls.length; i < len; i++) {
      const cl = cls[i].trim();
      if (!cl) continue;
      result.push(cl);
    }
    return result;
  }

  /**
   * Get data from the node element
   * @param  {HTMLElement} el DOM element to traverse
   * @return {Array<Object>}
   */
  private parseNode(el: HTMLElement, opts: any = {}) {
    const result = [];
    const nodes = Object.values(el.childNodes) as HTMLElement[];

    for (var i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      const attrs = node.attributes || [];
      const attrsLen = attrs.length;
      const nodePrev = result[result.length - 1];
      const nodeChild = node.childNodes.length;
      const ct = this.compTypes;
      //@ts-ignore
      let model: IComponent = {};

      // Start with understanding what kind of component it is
      if (ct) {
        let type =
          node.getAttribute && node.getAttribute(`${modelAttrStart}type`);

        // If the type is already defined, use it
        if (type) {
          model.type = type;
        } else {
          // Iterate over all available Component Types and
          // the first with a valid result will be that component
          for (let it = 0; it < ct.length; it++) {
            const compType = ct[it];
            let obj = compType.model.isComponent(node, opts);
            if (obj) {
              if (typeof obj !== "object") {
                model.type = compType.id;
              } else {
                model = obj;
              }
              break;
            }
          }
        }
      }

      // Set tag name if not yet done
      if (!model.tagName) {
        model.tagName = node.tagName ? node.tagName.toLowerCase() : "";
      }

      if (attrsLen) {
        model.attributes = {};
      }

      // Parse attributes
      for (let j = 0; j < attrsLen; j++) {
        const nodeName = attrs[j].nodeName;
        let nodeValue = attrs[j].nodeValue ?? "";

        // Isolate attributes
        if (nodeName == "style") {
          model.style = this.parseStyle(nodeValue);
        } else if (nodeName == "class") {
          model.classes = this.parseClass(nodeValue);
        } else if (nodeName == "contenteditable") {
          continue;
        } else if (nodeName.indexOf(modelAttrStart) === 0) {
          const modelAttr = nodeName.replace(modelAttrStart, "");
          const value = this.parseAttrValue(nodeValue);

          //@ts-ignore
          model[modelAttr] = value;
        } else {
          // Check for attributes from props (eg. required, disabled)
          model.attributes[nodeName] = nodeValue;
          //@ts-ignore
          if (nodeValue === "" && node[nodeName] === true) {
            model.attributes[nodeName] = true;
          }
        }
      }

      // Check for nested elements but avoid it if already provided
      if (nodeChild && !model.components) {
        // Avoid infinite nested text nodes
        const firstChild = node.childNodes[0];

        // If there is only one child and it's a TEXTNODE
        // just make it content of the current node
        if (nodeChild === 1 && firstChild.nodeType === 3) {
          !model.type && (model.type = "text");
          model.components = {
            type: "textnode",
            content: firstChild.nodeValue
          };
        } else {
          model.components = this.parseNode(node, {
            ...opts,
            inSvg: opts.inSvg || model.type === "svg"
          });
        }
      }

      // Check if it's a text node and if could be moved to the prevous model
      if (model.type == "textnode") {
        if (nodePrev && nodePrev.type == "textnode") {
          nodePrev.content += model.content;
          continue;
        }

        // Throw away empty nodes (keep spaces)
        if (!this.c.keepEmptyTextNodes) {
          const content = node.nodeValue ?? "";
          if (content != " " && !content.trim()) {
            continue;
          }
        }
      }

      // Check for custom void elements (valid in XML)
      if (!nodeChild && `${node.outerHTML}`.slice(-2) === "/>") {
        model.void = true;
      }

      // If all children are texts and there is some textnode the parent should
      // be text too otherwise I'm unable to edit texnodes
      const comps = model.components;
      if (!model.type && comps) {
        let allTxt = 1;
        let foundTextNode = 0;

        for (let ci = 0; ci < comps.length; ci++) {
          const comp = comps[ci];
          const cType = comp.type;
          if (
            ["text", "textnode"].indexOf(cType) < 0 &&
            opts.textTags.indexOf(comp.tagName) < 0
          ) {
            allTxt = 0;
            break;
          }

          if (cType == "textnode") {
            foundTextNode = 1;
          }
        }

        if (allTxt && foundTextNode) {
          model.type = "text";
        }
      }

      // If tagName is still empty and is not a textnode, do not push it
      if (!model.tagName && model.type != "textnode") {
        continue;
      }

      result.push(model);
    }

    return result;
  }

  /**
   * Parse HTML string to a desired model object
   * @param  {string} str HTML string
   * @param  {ParserCss} parserCss In case there is style tags inside HTML
   * @return {Object}
   */
  parse(str: string, parserCss: any, opts: ParserConfig = {}) {
    //@ts-ignore
    const { em } = this.c;
    opts = { ...defaultParserConfig, ...opts };
    const conf = (em && em.get("Config")) || {};
    const res: { html?: IComponent[]; css?: string } = {};
    const el = isFunction(opts.parserHtml)
      ? opts.parserHtml(str, opts)
      : BrowserParserHtml(str, opts);
    const scripts = el.querySelectorAll("script");
    let i = scripts.length;

    // Remove all scripts
    if (!conf.allowScripts) {
      while (i--) scripts[i].parentNode.removeChild(scripts[i]);
    }

    // Detach style tags and parse them
    if (parserCss) {
      const styles = el.querySelectorAll("style");
      let j = styles.length;
      let styleStr = "";

      while (j--) {
        styleStr = styles[j].innerHTML + styleStr;
        styles[j].parentNode.removeChild(styles[j]);
      }

      if (styleStr) res.css = parserCss.parse(styleStr);
    }

    em && em.trigger(`${event}:root`, { input: str, root: el });
    const result = this.parseNode(el, opts);
    // I have to keep it otherwise it breaks the DomComponents.addComponent (returns always array)
    res.html = result;
    em && em.trigger(event, { input: str, output: res });

    return res;
  }
}
