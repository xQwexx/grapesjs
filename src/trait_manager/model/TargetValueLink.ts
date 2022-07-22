import { isUndefined } from 'underscore';
import { Model } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';

/**
 * @typedef Trait
 * @property {String} id Trait id, eg. `my-trait-id`.
 * @property {String} type Trait type, defines how the trait should rendered. Possible values: `text` (default), `number`, `select`, `checkbox`, `color`, `button`
 * @property {String} label The trait label to show for the rendered trait.
 * @property {String} name The name of the trait used as a key for the attribute/property. By default, the name is used as attribute name or property in case `changeProp` in enabled.
 * @property {Boolean} changeProp If `true` the trait value is applied on component
 *
 */
interface ITargetValueView<Type> {
  onTargetChanged: (model: Component, value: Type) => void;
}

class TargetValueLink<Type> {
  name: string;
  private changeProp: boolean;
  protected default?: Type;
  private get targetEvent() {
    return this.changeProp ? `change:${this.name}` : `change:attributes:${this.name}`;
  }
  private model: Component;
  view?: ITargetValueView<Type>;

  constructor(model: Component, opts: TargetValueLink.Opts) {
    this.model = model;
    this.changeProp = opts.changeProp ?? false;
    this.name = opts.name;
    this.default = opts.default;
    this.model.on(this.targetEvent, this.targetUpdated, this);
  }
  protected get _value() {
    let value;
    if (this.changeProp) {
      value = this.model.get(this.name);
    } else {
      value = this.model.get('attributes')[this.name];
    }
    console.log(`Get target ${value}`);
    return !isUndefined(value) ? value : this.default ?? '';
  }

  protected set _value(value: any) {
    console.log(`Set target ${value}`);
    const { name } = this;
    if (isUndefined(value)) return;
    console.log(this.model);
    this.model.off(this.targetEvent, this.targetUpdated, this);
    if (this.changeProp) {
      this.model.set(name, value);
    } else {
      const attrs = { ...this.model.get('attributes') };
      attrs[name] = value;
      this.model.set('attributes', attrs);
    }
    this.model.on(this.targetEvent, this.targetUpdated, this);
    this.model.em?.trigger('trait:update', {
      trait: this,
      component: this.model,
    });
  }

  get value() {
    return this._value;
  }

  set value(value: Type) {
    this._value = value;
  }

  targetUpdated(o: any) {
    console.log('Target updated-----');
    console.log(this);
    this.view?.onTargetChanged(this.model, this.value);

    /*this.em?.trigger('trait:update', {
            trait: this.target,
            component: this.model,
        });*/
  }

  destroy() {
    this.model.off(this.targetEvent, this.targetUpdated, this);
    this.view = undefined;
  }
}

namespace TargetValueLink {
  export interface Opts {
    name: string;
    default?: any;
    changeProp?: boolean;
  }
}

export default TargetValueLink;
