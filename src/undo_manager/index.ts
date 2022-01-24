/**
 * This module allows to manage the stack of changes applied in canvas.
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const um = editor.UndoManager;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [add](#add)
 * * [remove](#remove)
 * * [removeAll](#removeall)
 * * [start](#start)
 * * [stop](#stop)
 * * [undo](#undo)
 * * [undoAll](#undoall)
 * * [redo](#redo)
 * * [redoAll](#redoall)
 * * [hasUndo](#hasundo)
 * * [hasRedo](#hasredo)
 * * [getStack](#getstack)
 * * [clear](#clear)
 *
 * @module UndoManager
 */
//@ts-ignore
import UndoManager from "backbone-undo";
import EditorModel from "editor/model/Editor";
import { isArray, isBoolean, isEmpty } from "underscore";
import { Module, ModuleConfig } from "common/module";

export class UndoManagerConfig extends ModuleConfig {
  name = "UndoManager";
  stylePrefix = undefined;
  maximumStackLength = 500;
  trackSelection = 1;
}
const hasSkip = (opts: any) => opts.avoidStore || opts.noUndo;
const getChanged = (obj: any) => Object.keys(obj.changedAttributes());
export default class UndoManagerModule extends Module<UndoManagerConfig> {
  um: UndoManager;
  beforeCache: any;

  constructor(em: EditorModel) {
    super(em, UndoManagerConfig);

    this.um = new UndoManager({ track: true, register: [], ...this.config });

    const fromUndo = true;

    this.um.changeUndoType("change", {
      condition: (object: any) => {
        const hasUndo = object.get("_undo");
        if (hasUndo) {
          const undoExc = object.get("_undoexc");
          if (isArray(undoExc)) {
            if (getChanged(object).some(chn => undoExc.indexOf(chn) >= 0))
              return false;
          }
          if (isBoolean(hasUndo)) return true;
          if (isArray(hasUndo)) {
            if (getChanged(object).some(chn => hasUndo.indexOf(chn) >= 0))
              return true;
          }
        }
        return false;
      },
      on(object: any, v: any, opts = {}) {
        !this.beforeCache && (this.beforeCache = object.previousAttributes());
        const opt = opts || v || {};
        opt.noUndo &&
          setTimeout(() => {
            this.beforeCache = null;
          });
        if (hasSkip(opt)) {
          return;
        } else {
          const after = object.toJSON({ fromUndo });
          const result = {
            object,
            before: this.beforeCache,
            after
          };
          this.beforeCache = null;
          // Skip undo in case of empty changes
          if (isEmpty(after)) return;

          return result;
        }
      }
    });
    this.um.changeUndoType("add", {
      on: (model: any, collection: any, options = {}) => {
        if (hasSkip(options) || !this.isRegistered(collection)) return;
        return {
          object: collection,
          before: undefined,
          after: model,
          options: { ...options, fromUndo }
        };
      }
    });
    this.um.changeUndoType("remove", {
      on: (model: any, collection: any, options = {}) => {
        if (hasSkip(options) || !this.isRegistered(collection)) return;
        return {
          object: collection,
          before: model,
          after: undefined,
          options: { ...options, fromUndo }
        };
      }
    });

    this.um.on("undo redo", () => {
      this.em.trigger("component:toggled change:canvasOffset");
      this.em.getSelectedAll().map(c => c.trigger("rerender:layer"));
    });
    ["undo", "redo"].forEach(ev => this.um.on(ev, () => this.em.trigger(ev)));
  }
  /**
   * Initialize module
   * @param {Object} config Configurations
   * @private
   */
  init(opts = {}) {
    return this;
  }

  postLoad() {
    this.config.trackSelection && this.em && this.add(this.em.get("selected"));
  }

  /**
   * Add an entity (Model/Collection) to track
   * Note: New Components and CSSRules will be added automatically
   * @param {Model|Collection} entity Entity to track
   * @return {this}
   * @example
   * um.add(someModelOrCollection);
   */
  add(entity: any) {
    this.um.register(entity);
    return this;
  }

  /**
   * Remove and stop tracking the entity (Model/Collection)
   * @param {Model|Collection} entity Entity to remove
   * @return {this}
   * @example
   * um.remove(someModelOrCollection);
   */
  remove(entity: any) {
    this.um.unregister(entity);
    return this;
  }

  /**
   * Remove all entities
   * @return {this}
   * @example
   * um.removeAll();
   */
  removeAll() {
    this.um.unregisterAll();
    return this;
  }

  /**
   * Start/resume tracking changes
   * @return {this}
   * @example
   * um.start();
   */
  start() {
    this.um.startTracking();
    return this;
  }

  /**
   * Stop tracking changes
   * @return {this}
   * @example
   * um.stop();
   */
  stop() {
    this.um.stopTracking();
    return this;
  }

  /**
   * Undo last change
   * @return {this}
   * @example
   * um.undo();
   */
  undo(all = true) {
    !this.em.isEditing() && this.um.undo(all);
    return this;
  }

  /**
   * Undo all changes
   * @return {this}
   * @example
   * um.undoAll();
   */
  undoAll() {
    this.um.undoAll();
    return this;
  }

  /**
   * Redo last change
   * @return {this}
   * @example
   * um.redo();
   */
  redo(all = true) {
    !this.em.isEditing() && this.um.redo(all);
    return this;
  }

  /**
   * Redo all changes
   * @return {this}
   * @example
   * um.redoAll();
   */
  redoAll() {
    this.um.redoAll();
    return this;
  }

  /**
   * Checks if exists an available undo
   * @return {Boolean}
   * @example
   * um.hasUndo();
   */
  hasUndo() {
    return this.um.isAvailable("undo");
  }

  /**
   * Checks if exists an available redo
   * @return {Boolean}
   * @example
   * um.hasRedo();
   */
  hasRedo() {
    return this.um.isAvailable("redo");
  }

  /**
   * Check if the entity (Model/Collection) to tracked
   * Note: New Components and CSSRules will be added automatically
   * @param {Model|Collection} entity Entity to track
   * @returns {Boolean}
   */
  isRegistered(obj: any) {
    return !!this.getInstance().objectRegistry.isRegistered(obj);
  }

  /**
   * Get stack of changes
   * @return {Collection}
   * @example
   * const stack = um.getStack();
   * stack.each(item => ...);
   */
  getStack(): any {
    return this.um.stack;
  }

  /**
   * Get grouped undo manager stack.
   * The difference between `getStack` is when you do multiple operations at a time,
   * like appending multiple components:
   * `editor.getWrapper().append(`<div>C1</div><div>C2</div>`);`
   * `getStack` will return a collection length of 2.
   *  `getStackGroup` instead will group them as a single operation (the first
   * inserted component will be returned in the list) by returning an array length of 1.
   * @return {Array}
   */
  getStackGroup() {
    const result: any = [];
    const inserted: any = [];

    this.getStack().forEach((item: any) => {
      const index = item.get("magicFusionIndex");
      if (inserted.indexOf(index) < 0) {
        inserted.push(index);
        result.push(item);
      }
    });

    return result;
  }

  __getStackRead() {
    const result: any = {};
    const createItem = (item: any) => {
      const { type, after, before, object } = item.attributes;
      return {
        type,
        after,
        before,
        object
      };
    };
    this.getStack().forEach((item: any) => {
      const index = item.get("magicFusionIndex");
      const value = createItem(item);
      if (!result[index]) result[index] = [value];
      else result[index].push(value);
    });
    return Object.keys(result).map(i => result[i]);
  }

  getPointer() {
    return this.getStack().pointer;
  }

  /**
   * Clear the stack
   * @return {this}
   * @example
   * um.clear();
   */
  clear() {
    this.um.clear();
    return this;
  }

  getInstance() {
    return this.um;
  }

  destroy() {
    this.clear().removeAll();
    [this.um, this.config, this.beforeCache].forEach(i => (i = {}));
  }
}
