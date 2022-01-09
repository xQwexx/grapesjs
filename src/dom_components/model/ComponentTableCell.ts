import Component from "./Component";
import { toLowerCase } from "utils/mixins";

export default class ComponentTableCell extends Component {
  defaults() {
    return {
      ...Component.prototype.defaults,
      type: "cell",
      tagName: "td",
      draggable: ["tr"]
    };
  }
  static isComponent(el: HTMLElement) {
    return ["td", "th"].indexOf(toLowerCase(el.tagName)) >= 0;
  }
}
