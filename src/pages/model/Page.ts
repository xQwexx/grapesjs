import { Model } from "common";
import { result, forEach } from "underscore";
import Frames from "canvas/model/Frames";
import Frame from "canvas/model/Frame";
import EditorModel from "editor/model/Editor";

export default class Page extends Model {
  defaults() {
    return {
      frames: [],
      _undo: true
    };
  }

  em?: EditorModel;

  initialize(props: any, opts: any = {}) {
    const { config = {} } = opts;
    const { em } = config;
    const defFrame: any = {};
    this.em = em;
    if (!props.frames) {
      defFrame.component = props.component;
      defFrame.styles = props.styles;
      ["component", "styles"].map(i => this.unset(i));
    }
    const frms = props.frames || [defFrame];
    const frames = new Frames(frms, config);
    frames.page = this;
    this.set("frames", frames);
    const um = em && em.UndoManager;
    um && um.add(frames);
  }

  onRemove() {
    this.get("frames").reset();
  }

  getFrames(): Frames {
    return this.get("frames");
  }

  /**
   * Get page id
   * @returns {String}
   */
  getId() {
    return this.id;
  }

  /**
   * Get page name
   * @returns {String}
   */
  getName(): string {
    return this.get("name");
  }

  /**
   * Update page name
   * @param {String} name New page name
   * @example
   * page.setName('New name');
   */
  setName(name: any) {
    //@ts-ignore
    return this.get({ name });
  }

  /**
   * Get all frames
   * @returns {Array<Frame>}
   * @example
   * const arrayOfFrames = page.getAllFrames();
   */
  getAllFrames(): Frame[] {
    return this.getFrames().models || [];
  }

  /**
   * Get the first frame of the page (identified always as the main one)
   * @returns {Frame}
   * @example
   * const mainFrame = page.getMainFrame();
   */
  getMainFrame(): Frame {
    return this.getFrames().at(0);
  }

  /**
   * Get the root component (usually is the `wrapper` component) from the main frame
   * @returns {Component}
   * @example
   * const rootComponent = page.getMainComponent();
   * console.log(rootComponent.toHTML());
   */
  getMainComponent() {
    const frame = this.getMainFrame();
    return frame && frame.getComponent();
  }

  toJSON(opts = {}) {
    const obj = Model.prototype.toJSON.call(this, opts);
    const defaults = result(this, "defaults");

    // Remove private keys
    forEach(obj, (value, key) => {
      key.indexOf("_") === 0 && delete obj[key];
    });

    forEach(defaults, (value, key) => {
      if (obj[key] === value) delete obj[key];
    });

    return obj;
  }
}
