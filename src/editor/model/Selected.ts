import {
  Collection,
  Model,
  AddOptions,
  Silenceable,
  ModelSetOptions
} from "backbone";
import Component from "dom_components/model/Component";
import Components from "dom_components/model/Components";
import { isArray } from "underscore";
//import {Component} from 'parser/model/ParserHtml';

export default class Selected extends Collection<Component> {
  getByComponent(component: Component) {
    return this.filter(s => this.getComponent(s) === component)[0];
  }

  addComponent(component: Component|Component[], opts?: AddOptions) {
    const toAdd = (isArray(component) ? component : [component])
      .filter(c => !this.hasComponent(c))
      .map(component => ( {component}));

    return this.push(toAdd, opts);
  }

  getComponent(model: Model) {
    return model.get("component") as Component;
  }

  hasComponent(component: Component) {
    const model = this.getByComponent(component);
    return model && this.contains(model);
  }

  lastComponent() {
    const last = this.last();
    return last && this.getComponent(last);
  }

  allComponents() {
    return this.map(s => this.getComponent(s)).filter(i => i);
  }

  removeComponent(component: Component|Component[], opts?: Silenceable) {
    const toRemove = (isArray(component) ? component : [component]).map(c =>
      this.getByComponent(c)
    );
    return this.remove(toRemove, opts);
  }
}

Selected.prototype.model = Component;
