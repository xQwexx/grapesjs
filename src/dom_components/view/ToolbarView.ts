import { View } from "backbone";
import { Module } from "common/module";
import DomainViews from "domain_abstract/view/DomainViews";
import ToolbarButton from "dom_components/model/ToolbarButton";
import ToolbarButtonView from "./ToolbarButtonView";

export default class ToolbarView extends DomainViews<ToolbarButton> {
  getModelView(model: ToolbarButton): View<ToolbarButton, HTMLElement> {
    return new ToolbarButtonView(model);
  }

  constructor(module: Module, collection: any) {
    super(module, collection);
    this.listenTo(this.collection, "reset", this.render);
  }
}
