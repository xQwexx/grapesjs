import { filter } from "underscore";
import { Collection } from "common";
import Selector from "./Selector";
import { SelectorType } from "selector_manager/utils/SelectorUtils";

export default class Selectors extends Collection<Selector> {
  modelId(attr: any) {
    return `${attr.name}_${attr.type || SelectorType.class}`;
  }

  getStyleable() {
    return filter(
      this.models,
      item => item.get("active") && !item.get("private")
    );
  }

  getValid({ noDisabled }: { noDisabled?: boolean } = {}) {
    return filter(this.models, item => !item.get("private")).filter(item =>
      noDisabled ? item.get("active") : 1
    );
  }

  getFullString(collection?: Selectors, opts = {}) {
    const result: string[] = [];
    const coll = collection || this;
    coll.forEach(selector => result.push(selector.getFullName(opts)));
    return result.join("").trim();
  }
}

Selectors.prototype.model = Selector;
