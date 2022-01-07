/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/panels/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  panels: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const panelManager = editor.Panels;
 * ```
 *
 * * [addPanel](#addpanel)
 * * [addButton](#addbutton)
 * * [getButton](#getbutton)
 * * [getPanel](#getpanel)
 * * [getPanels](#getpanels)
 * * [getPanelsEl](#getpanelsel)
 * * [removePanel](#removepanel)
 * * [removeButton](#removebutton)
 *
 * @module Panels
 */
import { Module, ModuleConfig } from "common/module";
import EditorModel from "editor/model/Editor";
import PanelsConfig from "./config/config";
import defaults from "./config/config";
import Button from "./model/Button";
import Panel from "./model/Panel";
import Panels from "./model/Panels";
import PanelsView from "./view/PanelsView";
var c = {};
var panels, PanelsViewObj;

export default class PanelsModule extends Module<PanelsConfig> {
  panels: Panels;
  PanelsViewObj?: any;

  constructor(em: EditorModel) {
    super(em, PanelsConfig);
    this.panels = new Panels(this.config.defaults);
  }
  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  init(config = {}) {
    return this;
  }

  /**
   * Returns the collection of panels
   * @return {Collection} Collection of panel
   */
  getPanels() {
    return this.panels;
  }

  /**
   * Returns panels element
   * @return {HTMLElement}
   */
  getPanelsEl() {
    return this?.PanelsViewObj.el;
  }

  /**
   * Add new panel to the collection
   * @param {Object|Panel} panel Object with right properties or an instance of Panel
   * @return {Panel} Added panel. Useful in case passed argument was an Object
   * @example
   * var newPanel = panelManager.addPanel({
   *   id: 'myNewPanel',
   *  visible  : true,
   *  buttons  : [...],
   * });
   */
  addPanel(panel: Panel) {
    return this.panels.add(panel);
  }

  /**
   * Remove a panel from the collection
   * @param {Object|Panel|String} panel Object with right properties or an instance of Panel or Painel id
   * @return {Panel} Removed panel. Useful in case passed argument was an Object
   * @example
   * const newPanel = panelManager.removePanel({
   *   id: 'myNewPanel',
   *  visible  : true,
   *  buttons  : [...],
   * });
   *
   * const newPanel = panelManager.removePanel('myNewPanel');
   *
   */
  removePanel(panel: Panel|String) {
    return this.panels.remove(panel);
  }

  /**
   * Get panel by ID
   * @param  {string} id Id string
   * @return {Panel|null}
   * @example
   * var myPanel = panelManager.getPanel('myNewPanel');
   */
  getPanel(id: string) {
    var res = this.panels.where({ id });
    return res.length ? res[0] : null;
  }

  /**
   * Add button to the panel
   * @param {string} panelId Panel's ID
   * @param {Object|Button} button Button object or instance of Button
   * @return {Button|null} Added button. Useful in case passed button was an Object
   * @example
   * var newButton = panelManager.addButton('myNewPanel',{
   *   id: 'myNewButton',
   *   className: 'someClass',
   *   command: 'someCommand',
   *   attributes: { title: 'Some title'},
   *   active: false,
   * });
   * // It's also possible to pass the command as an object
   * // with .run and .stop methods
   * ...
   * command: {
   *   run: function(editor) {
   *     ...
   *   },
   *   stop: function(editor) {
   *     ...
   *   }
   * },
   * // Or simply like a function which will be evaluated as a single .run command
   * ...
   * command: function(editor) {
   *   ...
   * }
   */
  addButton(panelId: string, button: Button) {
    var pn = this.getPanel(panelId);
    return pn ? pn.get("buttons").add(button) : null;
  }

  /**
   * Remove button from the panel
   * @param {String} panelId Panel's ID
   * @param {String} buttonId Button's ID
   * @return {Button|null} Removed button.
   * @example
   * const removedButton = panelManager.addButton('myNewPanel',{
   *   id: 'myNewButton',
   *   className: 'someClass',
   *   command: 'someCommand',
   *   attributes: { title: 'Some title'},
   *   active: false,
   * });
   *
   * const removedButton = panelManager.removeButton('myNewPanel', 'myNewButton');
   *
   */
  removeButton(panelId: string, button: string) {
    var pn = this.getPanel(panelId);
    return pn && pn.get("buttons").remove(button);
  }

  /**
   * Get button from the panel
   * @param {string} panelId Panel's ID
   * @param {string} id Button's ID
   * @return {Button|null}
   * @example
   * var button = panelManager.getButton('myPanel','myButton');
   */
  getButton(panelId: string, id: string) {
    var pn = this.getPanel(panelId);
    if (pn) {
      var res:Button[] = pn.get("buttons").where({ id });
      return res.length ? res[0] : null;
    }
    return null;
  }

  /**
   * Render panels and buttons
   * @return {HTMLElement}
   * @private
   */
  render() {
    this.PanelsViewObj?.remove();
    PanelsViewObj = new PanelsView({
      collection: this.panels,
      config: this.config
    });
    return PanelsViewObj.render().el;
  }

  /**
   * Active activable buttons
   * @private
   */
  active() {
    this.getPanels().each(p => {
      p.get("buttons").each((btn: any) => {
        btn.get("active") && btn.trigger("updateActive");
      });
    });
  }

  /**
   * Disable buttons flagged as disabled
   * @private
   */
  disableButtons() {
    this.getPanels().each(p => {
      p.get("buttons").each((btn: any) => {
        if (btn.get("disable")) btn.trigger("change:disable");
      });
    });
  }

  destroy() {
    this.panels.reset();
    this.panels.stopListening();
    this?.PanelsViewObj.remove();
    [this.config, this.panels, this.PanelsViewObj].forEach(i => (i = {}));
  }
}
