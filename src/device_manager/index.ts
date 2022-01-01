/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/device_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  deviceManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const deviceManager = editor.Devices;
 * ```
 * ## Available Events
 * * `device:add` - Added new device. The [Device] is passed as an argument to the callback
 * * `device:remove` - Device removed. The [Device] is passed as an argument to the callback
 * * `device:select` - New device selected. The newly selected [Device] and the previous one, are passed as arguments to the callback
 * * `device:update` - Device updated. The updated [Device] and the object containing changes are passed as arguments to the callback
 * * `device` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback
 *
 * ## Methods
 * * [add](#add)
 * * [get](#get)
 * * [getDevices](#getdevices)
 * * [remove](#remove)
 * * [select](#select)
 * * [getSelected](#getselected)
 *
 * [Device]: device.html
 *
 * @module Devices
 */
import { isString } from "underscore";
import CollectionModule from "common/module";
import defaults from "./config/config";
import Device from "./model/Device";
import Devices from "./model/Devices";
import DevicesView from "./view/DevicesView";
import EditorModel from "editor/model/Editor";
import DeviceManagerConfig from "./config/config";

export const evAll = "device";
export const evPfx = `${evAll}:`;
export const evSelect = `${evPfx}select`;
export const evSelectBefore = `${evSelect}:before`;
export const evUpdate = `${evPfx}update`;
export const evAdd = `${evPfx}add`;
export const evAddBefore = `${evAdd}:before`;
export const evRemove = `${evPfx}remove`;
export const evRemoveBefore = `${evRemove}:before`;
const chnSel = "change:device";

const events = {
  all: evAll,
  select: evSelect,
  // selectBefore: evSelectBefore,
  update: evUpdate,
  add: evAdd,
  // addBefore: evAddBefore,
  remove: evRemove,
  removeBefore: evRemoveBefore
};

export default class DeviceManagerCollectionModule extends CollectionModule<
  DeviceManagerConfig
> {
  postRender(view: any): void {}

  view: any;

  devices: Devices;

  constructor(em: EditorModel) {
    super(em, DeviceManagerConfig, new Devices(), events);
    this.devices = new Devices();
    const c = this.getConfig();
    c.devices.forEach((dv: any) => this.add(dv));
    this.select(c.default || this.devices.at(0));
    em.on(chnSel, this._onSelect, this);
  }

  init(config = {}) {
    /*devices = new Devices();
      
      this.em = em;
      this.all = devices;
      this.select(c.default || devices.at(0));
      this.__initListen();
      

      return this;*/
  }

  _onSelect(m: any, deviceId: any, opts: any) {
    const { em, events } = this;
    const prevId = m.previous("device");
    const newDevice = this.get(deviceId);
    const ev = events.select;
    em.trigger(ev, newDevice, this.get(prevId));
    //@ts-ignore
    this.__catchAllEvent(ev, newDevice, opts);
  }

  /**
   * Add new device
   * @param {Object} props Device properties
   * @returns {[Device]} Added device
   * @example
   * const device1 = deviceManager.add({
   *  // Without an explicit ID, the `name` will be taken. In case of missing `name`, a random ID will be created.
   *  id: 'tablet',
   *  name: 'Tablet',
   *  width: '900px', // This width will be applied on the canvas frame and for the CSS media
   * });
   * const device2 = deviceManager.add({
   *  id: 'tablet2',
   *  name: 'Tablet 2',
   *  width: '800px', // This width will be applied on the canvas frame
   *  widthMedia: '810px', // This width that will be used for the CSS media
   *  height: '600px', // Height will be applied on the canvas frame
   * });
   */
  add(props: any, options: any = {}) {
    let result;
    let opts = options;

    // Support old API
    if (isString(props)) {
      const width = options;
      opts = arguments[2] || {};
      result = {
        ...opts,
        id: props,
        name: opts.name || props,
        width
      };
    } else {
      result = props;
    }

    if (!result.id) {
      result.id = result.name || this._createId();
    }

    return this.devices.add(result, opts);
  }

  /**
   * Return device by ID
   * @param  {String} id ID of the device
   * @returns {[Device]|null}
   * @example
   * const device = deviceManager.get('Tablet');
   * console.log(JSON.stringify(device));
   * // {name: 'Tablet', width: '900px'}
   */
  get(id: string) {
    // Support old API
    const byName = this.getAll().filter((d: any) => d.get("name") === id)[0];
    return byName || this.devices.get(id) || null;
  }

  /**
   * Remove device
   * @param {String|[Device]} device Device or device id
   * @returns {[Device]} Removed device
   * @example
   * const removed = deviceManager.remove('device-id');
   * // or by passing the Device
   * const device = deviceManager.get('device-id');
   * deviceManager.remove(device);
   */
  remove(device: string | Device | any, opts = {}) {
    return this.__remove(device, opts);
  }

  /**
   * Return all devices
   * @returns {Array<[Device]>}
   * @example
   * const devices = deviceManager.getDevices();
   * console.log(JSON.stringify(devices));
   * // [{name: 'Desktop', width: ''}, ...]
   */
  getDevices() {
    return this.devices.models;
  }

  /**
   * Change the selected device. This will update the frame in the canvas
   * @param {String|[Device]} device Device or device id
   * @example
   * deviceManager.select('some-id');
   * // or by passing the page
   * const device = deviceManager.get('some-id');
   * deviceManager.select(device);
   */
  select(device: string | Device | any, opts = {}) {
    const md = isString(device) ? this.get(device) : device;
    md && this.em.set("device", md.get("id"), opts);
    return this;
  }

  /**
   * Get the selected device
   * @returns {[Device]}
   * @example
   * const selected = deviceManager.getSelected();
   */
  getSelected() {
    return this.get(this.em.get("device"));
  }

  getAll() {
    return this.devices;
  }

  getConfig() {
    return super.getConfig() as DeviceManagerConfig;
  }

  render() {
    this.view?.remove();

    this.view = new DevicesView({
      collection: this.devices,
      //@ts-ignore
      config: this.getConfig()
    });
    return this.view.render().el;
  }

  destroy() {
    super.__destroy();
    this.devices.stopListening();
    this.devices.reset();
    this.view?.remove();
    [this.devices, this.view].forEach(i => (i = null));
  }
}
