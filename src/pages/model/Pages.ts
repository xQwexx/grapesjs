import { AddOptions, Collection, Model } from "backbone";
import Page from "./Page";

export default class Pages extends Collection<Page> {
  config: any;

  initialize(models: any, config = {}) {
    this.config = config;
    console.log(this.models.length);
    this.on("reset", this.onReset);
    this.on("remove", this.onRemove);
  }

  onReset(m: Page, opts: any = {}) {
    const prev = opts.previousModels || [];
    prev.map((p: Page) => this.onRemove(p));
  }

  onRemove(removed?: Page) {
    removed?.onRemove();
  }

  add(model: Page, options?: AddOptions): Page;
  add(models: Page[], options?: AddOptions): Page[];

  add(m: unknown, o?: unknown): unknown {
    const { config } = this;
    console.log((m as any).length);
    return console.log(
      Collection.prototype.add.call(this, m as any, {
        ...(o as any),
        config: config
      }).length
    );
  }
}

Pages.prototype.model = Page;
