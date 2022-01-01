import Backbone from "backbone";
import Panel from "./Panel";

export default class Panels extends Backbone.Collection<Panel> {}
Panels.prototype.model = Panel;
