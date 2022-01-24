import { Model, ModelSetOptions } from "backbone";

export default class Button extends Model {
  defaults() {
    return {
      id: "",
      label: "",
      tagName: "span",
      className: "",
      command: "",
      context: "",
      buttons: [],
      attributes: {},
      options: {},
      active: false,
      dragDrop: false,
      togglable: true,
      runDefaultCommand: true,
      stopDefaultCommand: false,
      disable: false
    };
  }

  initialize(options: any) {
    //@ts-ignore
    if (this.get("buttons").length) {
      var Buttons = require("./Buttons").default;
      this.set("buttons", new Buttons(this.get("buttons")));
    }
  }
  set<A extends string>(attributeName: A, value?: any, options?: any) {
    Model.prototype.set.call(this, attributeName, value, options);
    return this;
  }
}
