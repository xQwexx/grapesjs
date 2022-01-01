import Backbone from "backbone";
import Button from "./Button";
import Buttons from "./Buttons";

export default class Panel extends Backbone.Model {
  defaults() {
    return {
      id: "",
      content: "",
      visible: true,
      buttons: [],
      attributes: {}
    };
  }

  initialize(options: any) {
    this.btn = this.get("buttons") || [];
    this.buttons = new Buttons(this.btn);
    this.set("buttons", this.buttons);
  }
  btn?: Button[];
  buttons?: Buttons;
}
