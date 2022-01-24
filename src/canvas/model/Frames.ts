import { bindAll } from "underscore";
import { Collection } from "common";
import model from "./Frame";
import Frame from "./Frame";
import { AddOptions } from "backbone";

export default class Frames extends Collection<Frame> {
  config: any = {};
  loadedItems: number = 0;
  itemsToLoad: number = 0;
  page: any;
  initialize(models: any, config = {}) {
    bindAll(this, "itemLoaded");
    this.config = config;
    this.on("reset", this.onReset);
    this.on("remove", this.onRemove);
  }

  onReset(m: any, opts: any = {}) {
    const prev: any[] = opts.previousModels || [];
    prev.map(p => this.onRemove(p));
  }

  onRemove(removed: any) {
    removed && removed.onRemove();
  }

  itemLoaded() {
    this.loadedItems++;

    if (this.loadedItems >= this.itemsToLoad) {
      this.trigger("loaded:all");
      this.listenToLoadItems(false);
    }
  }

  listenToLoad() {
    this.loadedItems = 0;
    this.itemsToLoad = this.length;
    this.listenToLoadItems(true);
  }

  listenToLoadItems(on: boolean) {
    this.forEach(item => item[on ? "on" : "off"]("loaded", this.itemLoaded));
  }

  add(model: {} | Frame, options?: AddOptions): Frame;
  add(models: ({} | Frame)[], options?: AddOptions): Frame[];
  add(m: unknown, o: unknown): unknown {
    const { config } = this;
    return Collection.prototype.add.call(this, m as any, {
      ...(o as any),
      em: config.em
    });
  }
}

Frames.prototype.model = model;
