import Backbone from "backbone";
import Command from "./Command";

export default class Commands extends Backbone.Collection<Command> {
  model = Command;
}
