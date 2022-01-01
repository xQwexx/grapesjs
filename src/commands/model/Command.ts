import Backbone from "backbone";

export default class Command extends Backbone.Model {
  defaults() {
    return {
      id: ""
    };
  }
}
