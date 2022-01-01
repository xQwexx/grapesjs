/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/storage_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  storageManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const storageManager = editor.StorageManager;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [isAutosave](#isautosave)
 * * [setAutosave](#setautosave)
 * * [getStepsBeforeSave](#getstepsbeforesave)
 * * [setStepsBeforeSave](#setstepsbeforesave)
 * * [setStepsBeforeSave](#setstepsbeforesave)
 * * [getStorages](#getstorages)
 * * [getCurrent](#getcurrent)
 * * [getCurrentStorage](#getcurrentstorage)
 * * [setCurrent](#setcurrent)
 * * [add](#add)
 * * [get](#get)
 * * [store](#store)
 * * [load](#load)
 *
 * @module StorageManager
 */

import { Module } from "common/module";
import EditorModel from "editor/model/Editor";
import StorageManagerConfig from "./config/config";
import LocalStorage from "./model/LocalStorage";
import RemoteStorage from "./model/RemoteStorage";

const eventStart = "storage:start";
const eventAfter = "storage:after";
const eventEnd = "storage:end";
const eventError = "storage:error";

export default class StorageManagerModule extends Module<StorageManagerConfig> {
  constructor(em: EditorModel) {
    super(em, StorageManagerConfig);
    this.defaultStorages.remote = new RemoteStorage(this.config);
    this.defaultStorages.local = new LocalStorage(this.config);
    this.currentStorage = this.config.type;
    this.loadDefaultProviders().setCurrent(this.config.type);
  }
  storages: { [id: string]: any } = [];
  defaultStorages: any = {};
  currentStorage: string;

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @param {string} [config.id='gjs-'] The prefix for the fields, useful to differentiate storing/loading
   * with multiple editors on the same page. For example, in local storage, the item of HTML will be saved like 'gjs-html'
   * @param {Boolean} [config.autosave=true] Indicates if autosave mode is enabled, works in conjunction with stepsBeforeSave
   * @param {number} [config.stepsBeforeSave=1] If autosave enabled, indicates how many steps/changes are necessary
   * before autosave is triggered
   * @param {string} [config.type='local'] Default storage type. Available: 'local' | 'remote' | ''(do not store)
   * @private
   * @example
   * ...
   * {
   *    autosave: false,
   *    type: 'remote',
   * }
   * ...
   */
  init(config = {}) {
    return this;
  }

  /**
   * Checks if autosave is enabled
   * @return {Boolean}
   * */
  isAutosave() {
    return !!this.config.autosave;
  }

  /**
   * Set autosave value
   * @param  {Boolean}  v
   * @return {this}
   * */
  setAutosave(v: boolean) {
    this.config.autosave = !!v;
    return this;
  }

  /**
   * Returns number of steps required before trigger autosave
   * @return {number}
   * */
  getStepsBeforeSave() {
    return this.config.stepsBeforeSave;
  }

  /**
   * Set steps required before trigger autosave
   * @param  {number} v
   * @return {this}
   * */
  setStepsBeforeSave(v: number) {
    this.config.stepsBeforeSave = v;
    return this;
  }

  /**
   * Add new storage
   * @param {string} id Storage ID
   * @param  {Object} storage Storage wrapper
   * @param  {Function} storage.load Load method
   * @param  {Function} storage.store Store method
   * @return {this}
   * @example
   * storageManager.add('local2', {
   *   load: function(keys, clb, clbErr) {
   *     var res = {};
   *     for (var i = 0, len = keys.length; i < len; i++){
   *       var v = localStorage.getItem(keys[i]);
   *       if(v) res[keys[i]] = v;
   *     }
   *     clb(res); // might be called inside some async method
   *     // In case of errors...
   *     // clbErr('Went something wrong');
   *   },
   *   store: function(data, clb, clbErr) {
   *     for(var key in data)
   *       localStorage.setItem(key, data[key]);
   *     clb(); // might be called inside some async method
   *   }
   * });
   * */
  add(id: string, storage: any) {
    this.storages[id] = storage;
    return this;
  }

  /**
   * Returns storage by id
   * @param {string} id Storage ID
   * @return {Object|null}
   * */
  get(id: string) {
    return this.storages[id] || null;
  }

  /**
   * Returns all storages
   * @return   {Array}
   * */
  getStorages() {
    return this.storages;
  }

  /**
   * Returns current storage type
   * @return {string}
   * */
  getCurrent() {
    return this.currentStorage;
  }

  /**
   * Set current storage type
   * @param {string} id Storage ID
   * @return {this}
   * */
  setCurrent(id: string) {
    this.currentStorage = id;
    return this;
  }

  /**
   * Store key-value resources in the current storage
   * @param  {Object} data Data in key-value format, eg. {item1: value1, item2: value2}
   * @param {Function} clb Callback function
   * @return {Object|null}
   * @example
   * storageManager.store({item1: value1, item2: value2});
   * */
  store(data: any, clb: any) {
    const st = this.get(this.getCurrent());
    const toStore: any = {};
    this.onStart("store", data);

    for (let key in data) {
      toStore[this.config.id + key] = data[key];
    }

    return st
      ? st.store(
          toStore,
          (res: any) => {
            this.onAfter("store", res);
            clb && clb(res);
            this.onEnd("store", res);
          },
          (err: any) => {
            this.onError("store", err);
          }
        )
      : null;
  }

  /**
   * Load resource from the current storage by keys
   * @param  {string|Array<string>} keys Keys to load
   * @param {Function} clb Callback function
   * @example
   * storageManager.load(['item1', 'item2'], res => {
   *  // res -> {item1: value1, item2: value2}
   * });
   * storageManager.load('item1', res => {
   * // res -> {item1: value1}
   * });
   * */
  load(keys: any, clb: any) {
    const st = this.get(this.getCurrent());
    const keysF = [];
    let result = {};

    if (typeof keys === "string") keys = [keys];
    this.onStart("load", keys);

    for (var i = 0, len = keys.length; i < len; i++) {
      keysF.push(this.config.id + keys[i]);
    }

    if (st) {
      st.load(
        keysF,
        (res: any) => {
          result = this.__clearKeys(res);
          this.onAfter("load", result);
          clb && clb(result);
          this.onEnd("load", result);
        },
        (err: any) => {
          clb && clb(result);
          this.onError("load", err);
        }
      );
    } else {
      clb && clb(result);
    }
  }

  /**
   * Restore key names
   * @param {Object} data
   * @returns {Object}
   * @private
   */
  __clearKeys(data: any = {}) {
    const result: any = {};
    const reg = new RegExp("^" + this.config.id + "");

    for (let itemKey in data) {
      const itemKeyR = itemKey.replace(reg, "");
      result[itemKeyR] = data[itemKey];
    }

    return result;
  }

  /**
   * Load default storages
   * @return {this}
   * @private
   * */
  loadDefaultProviders() {
    for (var id in this.defaultStorages) this.add(id, this.defaultStorages[id]);
    return this;
  }

  /**
   * Get current storage
   * @return {Storage}
   * */
  getCurrentStorage() {
    return this.get(this.getCurrent());
  }

  /**
   * On start callback
   * @private
   */
  onStart(ctx: string, data: any) {
    if (this.em) {
      this.em.trigger(eventStart);
      ctx && this.em.trigger(`${eventStart}:${ctx}`, data);
    }
  }

  /**
   * On after callback (before passing data to the callback)
   * @private
   */
  onAfter(ctx: string, data: any) {
    if (this.em) {
      this.em.trigger(eventAfter);
      ctx && this.em.trigger(`${eventAfter}:${ctx}`, data);
    }
  }

  /**
   * On end callback
   * @private
   */
  onEnd(ctx: string, data?: any) {
    if (this.em) {
      this.em.trigger(eventEnd);
      ctx && this.em.trigger(`${eventEnd}:${ctx}`, data);
    }
  }

  /**
   * On error callback
   * @private
   */
  onError(ctx: string, data: any) {
    if (this.em) {
      this.em.trigger(eventError, data);
      ctx && this.em.trigger(`${eventError}:${ctx}`, data);
      this.onEnd(ctx, data);
    }
  }

  /**
   * Check if autoload is possible
   * @return {Boolean}
   * @private
   * */
  canAutoload() {
    const storage = this.getCurrentStorage();
    return storage && this.getConfig().autoload;
  }

  destroy() {
    [this.config, this.storages, this.defaultStorages].forEach(i => (i = {}));
  }
}
