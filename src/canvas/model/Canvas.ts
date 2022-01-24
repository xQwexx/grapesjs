import CanvasConfig from "canvas/config/config";
import { Model } from "common";
import EditorModel from "editor/model/Editor";
import { evPageSelect } from "pages";
import Page from "pages/model/Page";
import Frames from "./Frames";

export interface scriptIncludeAttr {
  src: string;
}

export interface styleIncludeAttr {
  href: string;
}

export default class Canvas extends Model {
  defaults() {
    return {
      frame: "",
      frames: "",
      rulers: false,
      zoom: 100,
      x: 0,
      y: 0,
      // Scripts to apply on all frames
      scripts: [],
      // Styles to apply on all frames
      styles: []
    };
  }
  em: EditorModel;
  config: CanvasConfig;

  get scripts(): (string | scriptIncludeAttr)[] {
    return this.get("scripts");
  }
  get styles(): (string | styleIncludeAttr)[] {
    return this.get("styles");
  }

  constructor(config: CanvasConfig) {
    super();
    this.config = config;
    this.em = config.em;
    this.listenTo(this, "change:zoom", this.onZoomChange);
    this.listenTo(config.em, "change:device", this.updateDevice);
    this.listenTo(config.em, evPageSelect, this._pageUpdated);
    const { em } = this;
    const mainPage = em.PageManager.getMain();
    const frame = mainPage?.getMainFrame() ?? "";
    this.set("frames", mainPage?.getMainFrame() ?? "");
    this.set("scripts", config.scripts);
    this.set("styles", config.styles);
    this.updateDevice({ frame });
  }
  get frames(): Frames {
    return this.get("frames");
  }
  onLoad(){
    const { em } = this;
    const mainPage = em.PageManager.getMain();
    const frame = mainPage?.getMainFrame() ?? "";
    this.set("frames", mainPage?.getMainFrame() ?? "");
    this.updateDevice({ frame });
  }

  _pageUpdated(page: Page, prev?: Page) {
    const { em } = this;
    em.setSelected();
    em.get("readyCanvas") && em.stopDefault(); // We have to stop before changing current frames
    prev?.getFrames().map(frame => frame.disable());
    this.set("frames", page.getFrames());
  }

  updateDevice(opts: any = {}) {
    const { em } = this;
    const device = em.getDeviceModel();
    const model = opts.frame || em.getCurrentFrameModel();

    if (model && device) {
      const { width, height } = device.attributes;
      model.set({ width, height }, { noUndo: 1 });
    }
  }

  onZoomChange() {
    const zoom = this.get("zoom");
    zoom < 1 && this.set("zoom", 1);
  }
}