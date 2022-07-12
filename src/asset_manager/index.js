/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/asset_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  assetManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const assetManager = editor.AssetManager;
 * ```
 *
 * ## Available Events
 * * `asset:open` - Asset Manager opened.
 * * `asset:close` - Asset Manager closed.
 * * `asset:add` - Asset added. The [Asset] is passed as an argument to the callback.
 * * `asset:remove` - Asset removed. The [Asset] is passed as an argument to the callback.
 * * `asset:update` - Asset updated. The updated [Asset] and the object containing changes are passed as arguments to the callback.
 * * `asset:upload:start` - Before the upload is started.
 * * `asset:upload:end` - After the upload is ended.
 * * `asset:upload:error` - On any error in upload, passes the error as an argument.
 * * `asset:upload:response` - On upload response, passes the result as an argument.
 * * `asset` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
 * * `asset:custom` - Event for handling custom Asset Manager UI.
 *
 * ## Methods
 * * [open](#open)
 * * [close](#close)
 * * [isOpen](#isopen)
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllVisible](#getallvisible)
 * * [remove](#remove)
 * * [getContainer](#getcontainer)
 *
 * [Asset]: asset.html
 *
 * @module AssetManager
 */

import { debounce, isFunction } from 'underscore';
import { ItemManagerModule } from '../abstract/Module';
import defaults from './config/config';
import Asset from './model/Assets';
import Assets from './model/Assets';
import AssetsView from './view/AssetsView';
import FileUpload from './view/FileUploader';

export const evAll = 'asset';
export const evPfx = `${evAll}:`;
export const evSelect = `${evPfx}select`;
export const evUpdate = `${evPfx}update`;
export const evAdd = `${evPfx}add`;
export const evRemove = `${evPfx}remove`;
export const evRemoveBefore = `${evRemove}:before`;
export const evCustom = `${evPfx}custom`;
export const evOpen = `${evPfx}open`;
export const evClose = `${evPfx}close`;
export const evUpload = `${evPfx}upload`;
export const evUploadStart = `${evUpload}:start`;
export const evUploadEnd = `${evUpload}:end`;
export const evUploadError = `${evUpload}:error`;
export const evUploadRes = `${evUpload}:response`;

const assetCmd = 'open-assets';
const events = {
  all: evAll,
  select: evSelect,
  update: evUpdate,
  add: evAdd,
  remove: evRemove,
  removeBefore: evRemoveBefore,
  custom: evCustom,
  open: evOpen,
  close: evClose,
  uploadStart: evUploadStart,
  uploadEnd: evUploadEnd,
  uploadError: evUploadError,
  uploadResponse: evUploadRes,
};
export default class AssetManager extends ItemManagerModule {
  storageKey = 'assets';

  get defaults() {
    return defaults;
  }

  constructor(em) {
    super(em, 'AssetManager', new Assets([]), events);

    // Global assets collection
    this.assets = this.all;
    this.assetsVis = new Assets([]);
    //this.all = this.assets;
    this.__initListen();

    // Setup the sync between the global and public collections
    this.assets.on('add', model => this.getAllVisible().add(model));
    this.assets.on('remove', model => this.getAllVisible().remove(model));

    return this;
  }

  __propEv(ev, ...data) {
    this.em.trigger(ev, ...data);
    this.getAll().trigger(ev, ...data);
  }

  __onAllEvent = debounce(function () {
    this.__trgCustom();
  }, 0);

  __trgCustom() {
    const bhv = this.__getBehaviour();
    if (!bhv.container && !this.config.custom.open) {
      return;
    }
    this.em.trigger(this.events.custom, this.__customData());
  }

  __customData() {
    const bhv = this.__getBehaviour();
    return {
      am: this,
      open: this.isOpen(),
      assets: this.getAll().models,
      types: bhv.types || [],
      container: bhv.container,
      close: () => this.close(),
      remove: (...args) => this.remove(...args),
      select: (asset, complete) => {
        const res = this.add(asset);
        isFunction(bhv.select) && bhv.select(res, complete);
      },
      // extra
      options: bhv.options || {},
    };
  }

  /**
   * Open the asset manager.
   * @param {Object} [options] Options for the asset manager.
   * @param {Array<String>} [options.types=['image']] Types of assets to show.
   * @param {Function} [options.select] Type of operation to perform on asset selection. If not specified, nothing will happen.
   * @example
   * assetManager.open({
   *  select(asset, complete) {
   *    const selected = editor.getSelected();
   *    if (selected && selected.is('image')) {
   *      selected.addAttributes({ src: asset.getSrc() });
   *      // The default AssetManager UI will trigger `select(asset, false)` on asset click
   *      // and `select(asset, true)` on double-click
   *      complete && assetManager.close();
   *    }
   *  }
   * });
   * // with your custom types (you should have assets with those types declared)
   * assetManager.open({ types: ['doc'], ... });
   */
  open(options = {}) {
    const cmd = this.em.get('Commands');
    cmd.run(assetCmd, {
      types: ['image'],
      select: () => {},
      ...options,
    });
  }

  /**
   * Close the asset manager.
   * @example
   * assetManager.close();
   */
  close() {
    const cmd = this.em.get('Commands');
    cmd.stop(assetCmd);
  }

  /**
   * Checks if the asset manager is open
   * @returns {Boolean}
   * @example
   * assetManager.isOpen(); // true | false
   */
  isOpen() {
    const cmd = this.em.get('Commands');
    return !!(cmd && cmd.isActive(assetCmd));
  }

  /**
   * Add new asset/s to the collection. URLs are supposed to be unique
   * @param {String|Object|Array<String>|Array<Object>} asset URL strings or an objects representing the resource.
   * @param {Object} [opts] Options
   * @returns {[Asset]}
   * @example
   * // As strings
   * assetManager.add('http://img.jpg');
   * assetManager.add(['http://img.jpg', './path/to/img.png']);
   *
   * // Using objects you can indicate the type and other meta informations
   * assetManager.add({
   *  // type: 'image',	// image is default
   * 	src: 'http://img.jpg',
   * 	height: 300,
   *	width: 200,
   * });
   * assetManager.add([{ src: 'img2.jpg' }, { src: 'img2.png' }]);
   */
  add(asset, opts = {}) {
    // Put the model at the beginning
    if (typeof opts.at == 'undefined') {
      opts.at = 0;
    }

    return this.assets.add(asset, opts);
  }

  /**
   * Return asset by URL
   * @param  {String} src URL of the asset
   * @returns {[Asset]|null}
   * @example
   * const asset = assetManager.get('http://img.jpg');
   */
  get(src) {
    return this.assets.where({ src })[0] || null;
  }

  /**
   * Return the global collection, containing all the assets
   * @returns {Collection<[Asset]>}
   */
  getAll() {
    return this.assets;
  }

  /**
   * Return the visible collection, which contains assets actually rendered
   * @returns {Collection<[Asset]>}
   */
  getAllVisible() {
    return this.assetsVis;
  }

  /**
   * Remove asset
   * @param {String|[Asset]} asset Asset or asset URL
   * @returns {[Asset]} Removed asset
   * @example
   * const removed = assetManager.remove('http://img.jpg');
   * // or by passing the Asset
   * const asset = assetManager.get('http://img.jpg');
   * assetManager.remove(asset);
   */
  remove(asset, opts) {
    return this.__remove(asset, opts);
  }

  store() {
    return this.getProjectData();
  }

  load(data) {
    return this.loadProjectData(data);
  }

  /**
   * Return the Asset Manager Container
   * @returns {HTMLElement}
   */
  getContainer() {
    const bhv = this.__getBehaviour();
    return bhv.container || (this.am && this.am.el);
  }

  /**
   *  Get assets element container
   * @returns {HTMLElement}
   * @private
   */
  getAssetsEl() {
    return this.am.el.querySelector('[data-el=assets]');
  }

  /**
   * Render assets
   * @param  {array} assets Assets to render, without the argument will render all global assets
   * @returns {HTMLElement}
   * @private
   * @example
   * // Render all assets
   * assetManager.render();
   *
   * // Render some of the assets
   * const assets = assetManager.getAll();
   * assetManager.render(assets.filter(
   *  asset => asset.get('category') == 'cats'
   * ));
   */
  render(assts) {
    if (this.getConfig().custom) return;
    const toRender = assts || this.getAll().models;

    if (!this.am) {
      const obj = this.__viewParams();
      obj.fu = this.FileUploader();
      const el = this.am && this.am.el;
      this.am = new AssetsView({
        el,
        ...obj,
      });
      this.am.render();
    }

    this.assetsVis.reset(toRender);
    return this.getContainer();
  }

  __viewParams() {
    return {
      collection: this.assetsVis, // Collection visible in asset manager
      globalCollection: this.assets,
      config: this.config,
      module: this,
    };
  }

  /**
   * Add new type. If you want to get more about type definition we suggest to read the [module's page](/modules/Assets.html)
   * @param {string} id Type ID
   * @param {Object} definition Definition of the type. Each definition contains
   *                            `model` (business logic), `view` (presentation logic)
   *                            and `isType` function which recognize the type of the
   *                            passed entity
   * @private
   * @example
   * assetManager.addType('my-type', {
   *  model: {},
   *  view: {},
   *  isType: (value) => {},
   * })
   */
  addType(id, definition) {
    this.getAll().addType(id, definition);
  }

  /**
   * Get type
   * @param {string} id Type ID
   * @returns {Object} Type definition
   * @private
   */
  getType(id) {
    return this.getAll().getType(id);
  }

  /**
   * Get types
   * @returns {Array}
   * @private
   */
  getTypes() {
    return this.getAll().getTypes();
  }

  //-------

  AssetsView() {
    return this.am;
  }

  FileUploader() {
    if (!this.fu) {
      this.fu = new FileUpload(this.__viewParams());
    }
    return this.fu;
  }

  onLoad() {
    this.getAll().reset(this.config.assets);
    const { em, events } = this;
    em.on(`run:${assetCmd}`, () => this.__propEv(events.open));
    em.on(`stop:${assetCmd}`, () => this.__propEv(events.close));
  }

  postRender(editorView) {
    this.config.dropzone && this.fu && this.fu.initDropzone(editorView);
  }

  /**
   * Set new target
   * @param	{Object}	m Model
   * @private
   * */
  setTarget(m) {
    this.assetsVis.target = m;
  }

  /**
   * Set callback after asset was selected
   * @param	{Object}	f Callback function
   * @private
   * */
  onSelect(f) {
    this.assetsVis.onSelect = f;
  }

  /**
   * Set callback to fire when the asset is clicked
   * @param {function} func
   * @private
   */
  onClick(func) {
    this.config.onClick = func;
  }

  /**
   * Set callback to fire when the asset is double clicked
   * @param {function} func
   * @private
   */
  onDblClick(func) {
    this.config.onDblClick = func;
  }

  __behaviour(opts = {}) {
    return (this._bhv = {
      ...(this._bhv || {}),
      ...opts,
    });
  }

  __getBehaviour(opts = {}) {
    return this._bhv || {};
  }

  destroy() {
    this.assets.stopListening();
    this.assetsVis.stopListening();
    this.assets.reset();
    this.assetsVis.reset();
    this.fu && this.fu.remove();
    this.am && this.am.remove();
    [this.assets, this.assetsVis, this.am, this.fu].forEach(i => (i = null));
    this._bhv = {};
    this.all = {};
  }
}
