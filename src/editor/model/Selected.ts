import {
  Collection,
  Model,
  AddOptions,
  Silenceable,
  ModelSetOptions
} from "backbone";
import { isArray } from "underscore";
//import {Component} from 'parser/model/ParserHtml';

export class Selectable extends Model {}

export default class Selected extends Collection {
  getByComponent(component: Selectable) {
    return this.filter(s => this.getComponent(s) === component)[0];
  }

  addComponent(component: any, opts?: AddOptions) {
    const toAdd = (isArray(component) ? component : [component])
      .filter(c => !this.hasComponent(c))
      .map(component => ({ component }));
    //@ts-ignore
    return this.push(toAdd, opts);
  }

  getComponent(model: Model) {
    return model.get("component");
  }

  hasComponent(component: Selectable) {
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

  removeComponent(component: any, opts?: Silenceable) {
    const toRemove = (isArray(component) ? component : [component]).map(c =>
      this.getByComponent(c)
    );
    return this.remove(toRemove, opts);
  }
}

Selected.prototype.model = Selectable;
