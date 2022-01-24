import { Model } from "backbone";
import CommandsConfig from "commands/config/config";
import Editor from "editor";
import EditorModel from "editor/model/Editor";
import Button from "panels/model/Button";
import { any, isFunction } from "underscore";
export interface ICommand{
  /**
   * Method that run command
   * @param  {Object}  em     Editor model
   * @param  {Object}  sender  Button sender
   * @private
   * */
  run(wrapper: Editor, sender: any, opts: any): void

  /**
  * Method that stop command
  * @param  {Object}  em Editor model
  * @param  {Object}  sender  Button sender
  * @private
  * */
  stop?(wrapper: Editor, sender: any, opts: any): void
}
export abstract class CommandAbstract implements ICommand{
  abstract run(wrapper: Editor, sender: any, opts: any): void

  wrapper: CommandWrapper;
  id: string;
  constructor(wrapper: CommandWrapper, id: string){
    this.wrapper = wrapper;
    this.id = id;
  }

  get em() {return this.wrapper.em}

  get editor() {return this.em.getEditor()}

  get config() {return this.wrapper.config}

  get pfx() {return this.config.pfx}

  get ppfx() {return this.config.ppfx}

  get canvas() {return this.em.Canvas}

  get canvasElement() {
    return this.canvas.getElement();
  }

  /**
 * Stop current command
 */
    stopCommand() {
    this.em?.Commands.stop(this.id);
  }
}
type commandInput = ICommand| {new (wrapper: CommandWrapper): ICommand}

export default class CommandWrapper extends Model {
  /**
   * Initialize method that can't be removed
   * @param  {Object}  o Options
   * @private
   * */
  constructor(id: string, config: CommandsConfig, command: commandInput) {
    super();
    this.config = config;
    this.em = this.config?.em;
    this.pfx = this.config?.pfx;
    this.ppfx = this.config?.ppfx;
    this.hoverClass = this.pfx + "hover";
    this.badgeClass = this.pfx + "badge";
    this.plhClass = this.pfx + "placeholder";
    this.freezClass = this.ppfx + "freezed";
    this.id = id;
    if(isFunction(command))
      this.command = new command(this);
    else
      this.command = command;

    this.canvas = this.em?.Canvas;
    this.init(this.config);
  }
  canvas?: any;
  em: EditorModel;
  config: CommandsConfig;
  command: ICommand;
  pfx: any;
  ppfx: any;
  hoverClass: any;
  badgeClass: any;
  plhClass: any;
  freezClass: any;
  id: string;

  /**
   * On frame scroll callback
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  onFrameScroll(e: any) {}


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

    let result = this.command.run(editor, sender, options);

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
    let result;
    if (this.command?.stop)
      result = this.command.stop(editor, sender, options);
    editor.trigger(`stop:${id}`, result, options);
    editor.trigger("stop", id, result, options);
    return result;
  }


}