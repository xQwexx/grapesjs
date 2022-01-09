import Component from "./Component";
import { escape } from "utils/mixins";

export default class ComponentTextNode extends Component {
  defaults() {
    return {
      ...Component.prototype.defaults,
      tagName: "",
      droppable: false,
      layerable: false,
      selectable: false,
      editable: true
    };
  }

  toHTML() {
    const parent = this.parent();
    const cnt = this.get("content");
    return parent && parent.is("script") ? cnt : escape(cnt);
  }

  static isComponent(el: HTMLElement) {
    var result = "";
    if (el.nodeType === 3) {
      return {
        type: "textnode",
        content: el.textContent
      };
    }
    return result;
  }
}
