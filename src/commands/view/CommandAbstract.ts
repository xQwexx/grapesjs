import { Model } from "backbone";
import CommandsConfig from "commands/config/config";
import Editor from "editor";
import EditorModel from "editor/model/Editor";
import Button from "panels/model/Button";
import { any } from "underscore";

export default class CommandAbstract extends Model {
  /**
   * Initialize method that can't be removed
   * @param  {Object}  o Options
   * @private
   * */
  initialize(o: any) {
    this.config = o || {};
    this.editorModel = this.em = this.config?.em;
    this.pfx = this.config?.stylePrefix;
    this.ppfx = this.config?.stylePrefix;
    this.hoverClass = this.pfx + "hover";
    this.badgeClass = this.pfx + "badge";
    this.plhClass = this.pfx + "placeholder";
    this.freezClass = this.ppfx + "freezed";

    this.canvas = this.em?.Canvas;
    this.init(this.config);
  }
  canvas?: any;
  em?: EditorModel;
  config?: CommandsConfig;

  editorModel: any;
  pfx: any;
  ppfx: any;
  hoverClass: any;
  badgeClass: any;
  plhClass: any;
  freezClass: any;
  id: string = "";

  /**
   * On frame scroll callback
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  onFrameScroll(e: any) {}

  /**
   * Returns canval element
   * @return {HTMLElement}
   */
  getCanvas() {
    return this.canvas.getElement();
  }

  /**
   * Get canvas body element
   * @return {HTMLElement}
   */
  getCanvasBody() {
    return this.canvas.getBody();
  }

  /**
   * Get canvas wrapper element
   * @return {HTMLElement}
   */
  getCanvasTools() {
    return this.canvas.getToolsEl();
  }

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el: HTMLElement) {
    var rect = el.getBoundingClientRect();
    return {
      top: rect.top + el.ownerDocument.body.scrollTop,
      left: rect.left + el.ownerDocument.body.scrollLeft
    };
  }

  /**
   * Callback triggered after initialize
   * @param  {Object}  o   Options
   * @private
   * */
  init(o = {}) {}

  /**
   * Method that run command
   * @param  {Object}  editor Editor instance
   * @param  {Object}  [options={}] Options
   * @private
   * */
  callRun(editor: Editor, options: any = {}) {
    const id = this.id;
    editor.trigger(`run:${id}:before`, options);

    if (options && options.abort) {
      editor.trigger(`abort:${id}`, options);
      return;
    }

    const sender = options.sender || editor;
    const result = this.run(editor.getModel(), sender, options);
    editor.trigger(`run:${id}`, result, options);
    editor.trigger("run", id, result, options);
    return result;
  }

  /**
   * Method that run command
   * @param  {Object}  editor Editor instance
   * @param  {Object}  [options={}] Options
   * @private
   * */
  callStop(editor: Editor, options: any = {}) {
    const id = this.id;
    const sender = options.sender || editor;
    editor.trigger(`stop:${id}:before`, options);
    const result = this.stop(editor.getModel(), sender, options);
    editor.trigger(`stop:${id}`, result, options);
    editor.trigger("stop", id, result, options);
    return result;
  }

  /**
   * Stop current command
   */
  stopCommand() {
    this.em?.Commands.stop(this.id);
  }

  /**
   * Method that run command
   * @param  {Object}  em     Editor model
   * @param  {Object}  sender  Button sender
   * @private
   * */
  run(em: EditorModel, sender: any, opts: any) {}

  /**
   * Method that stop command
   * @param  {Object}  em Editor model
   * @param  {Object}  sender  Button sender
   * @private
   * */
  stop(em: EditorModel, sender: any, opts: any) {}
}
