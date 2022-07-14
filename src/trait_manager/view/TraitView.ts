import Backbone, { EventHandler } from 'backbone';
import { isUndefined, isString, isFunction } from 'underscore';
import { capitalize } from '../../utils/mixins';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import { View } from '../../common';

const $ = Backbone.$;

export default class TraitView<Trait = any> extends View {
  events: any = {};
  get eventCapture() {
    return ['change'];
  }
  get type() {
    return 'text';
  }

  protected default: Trait;

  appendInput = true;
  noLabel = false;
  clsField: string;
  elInput!: HTMLInputElement;
  input?: HTMLInputElement;

  //@ts-ignore
  model!: Component;
  name: string;
  private _label: string | false;
  changeProp: boolean;

  em: EditorModel;

  get target() {
    console.log('Get target value');
    let value;
    if (this.changeProp) {
      value = this.model.get(this.name);
    } else {
      value = this.model.get('attributes')[this.name];
    }
    return !isUndefined(value) ? value : this.default;
  }

  set target(value: Trait) {
    console.log('Set target value');
    const { name } = this;
    if (isUndefined(value)) return;

    if (this.changeProp) {
      console.log('Change prob is true');
      this.model.set(name, value);
    } else {
      const attrs = { ...this.model.get('attributes') };
      attrs[name] = value;
      console.log(attrs[name]);
      this.model.set('attributes', attrs);
    }
  }
  pfx: string;
  ppfx: string;
  config: any;

  protected get templateLabel() {
    const { ppfx, label } = this;
    return `<div class="${ppfx}label" title="${label}">${label}</div>`;
  } //<div class="${ppfx}label-wrp" data-label></div>

  protected get templateInput() {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }

  constructor(opts: any = {}) {
    super(opts);
    console.log(opts);
    const { config = {} } = opts;
    this.default = '' as any;
    //this.target = opts.model;
    this.changeProp = opts.changeProp ?? false;
    this.name = opts.name;
    this._label = opts.label ?? opts.name;
    const { model, eventCapture } = this;
    /*['classes', 'components'].forEach(name => {
      const events = `add remove ${name !== 'components' ? 'change' : ''}`;
      this.listenTo(this.get(name), events.trim(), (...args) => this.emitUpdate(name, ...args));
    });*/

    const { type } = this;
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    const { ppfx } = this;
    this.clsField = `${ppfx}field ${ppfx}field-${type}`;
    const signupEvents: { [id: string]: EventHandler } = {};
    //signupEvents['change:value'] = this.onValueChange;
    signupEvents['remove'] = this.removeView;
    Object.entries(signupEvents).forEach(([event, clb]) => {
      //model.off(event, clb);
      this.listenTo(model, event, clb);
    });
    //@ts-ignore
    //model.view = this;
    this.listenTo(this, 'change:label', this.render);
    this.listenTo(this, 'change:placeholder', this.rerender);
    eventCapture.forEach(event => (this.events[event] = 'onChange'));
    this.delegateEvents();
    this.init();

    const targetEvent = this.changeProp ? `change:${this.name}` : `change:attributes:${this.name}`;
    this.listenTo(this.model, targetEvent, this.targetUpdated);
  }

  targetUpdated(o: any) {
    console.log('Target updated');
    console.log(this.model.get('attributes')[this.name]);
    const el = this.getInputElem();
    el && this.updateValueView(el, this.target);

    this.em?.trigger('trait:update', {
      trait: this.target,
      component: this.model,
    });
  }

  getClbOpts() {
    return {
      component: this.model,
      trait: this.target,
      elInput: this.getInputElem(),
    };
  }

  removeView() {
    console.log('Remove View');
    this.remove();
    this.removed();
  }

  init() {}
  removed() {}
  onRender(event: { component: Component; trait: Trait; elInput: HTMLElement }) {}
  onEvent(event: { component: Component; trait: Trait; elInput: HTMLElement; event: Event }) {}

  protected updateValueView(el: HTMLInputElement, value: Trait) {
    el.value = value as any;
  }
  protected parseValueFromEl(el: HTMLInputElement): Trait {
    return el.value as any;
  }
  /**
   * Fires when the input is changed
   */
  protected onChange(event: Event) {
    console.log('onchange');
    const el = this.getInputElem();
    const value = el && this.parseValueFromEl(el);
    if (!isUndefined(value)) {
      this.target = value;
    }
    this.onEvent({
      ...this.getClbOpts(),
      event,
    });
  }

  //TODO this 2 should not exist the public API
  createLabel?(attr: any): any;

  createInput?(attr: any): any;
  /**
   * Render label
   * @private
   */
  private renderLabel() {
    const { $el, target, label } = this;
    let tpl = this.templateLabel;

    if (this.createLabel) {
      tpl =
        this.createLabel({
          label,
          component: target,
          trait: this,
        }) || '';
    }

    $el.find('[data-label]').append(tpl);
  }

  /**
   * Returns label for the input
   * @return {string}
   * @private
   */
  get label() {
    const { em } = this;
    const { _label, name } = this;
    return em.t(`traitManager.traits.labels.${name}`) || capitalize(_label || name).replace(/-/g, ' ');
  }

  protected getInput(): JQuery<HTMLInputElement> {
    const { em, model, name, type } = this;
    const md = model;
    const plh = md.get('placeholder') || md.get('default') || '';
    //const type = md.get('type') || 'text';
    const min = md.get('min');
    const max = md.get('max');
    const value = this.target;
    const $input = $<HTMLInputElement>(`<input type="${type}" placeholder="${plh}">`);
    const i18nAttr = em.t(`traitManager.traits.attributes.${name}`) || {};
    $input.attr(i18nAttr);

    if (!isUndefined(value)) {
      md.set({ value }, { silent: true });
      $input.prop('value', value as any);
    }

    if (min) {
      $input.prop('min', min);
    }

    if (max) {
      $input.prop('max', max);
    }

    return $input;
  }

  getInputElem() {
    const { input } = this;
    return input || this.getElInput();
  } /*
  private getInputElem() {
    const { input} = this;
    if(!this.input){
      this.input = this.getElInput().get(0) as HTMLInputElement
    }
    return this.input;
  }*/

  getElInput() {
    return this.elInput;
  }

  /**
   * Renders input
   * @private
   * */
  renderField() {
    const { $el, appendInput, model } = this;
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];
    //@ts-ignore
    let tpl = this.elInput;

    if (!tpl) {
      tpl = this.createInput ? this.createInput(this.getClbOpts()) : this.getInput().get(0);
    }

    if (isString(tpl)) {
      el.innerHTML = tpl;
      //@ts-ignore
      this.elInput = el.firstChild;
    } else {
      appendInput ? el.appendChild(tpl) : el.insertBefore(tpl, el.firstChild);
      this.elInput = tpl;
    }

    //@ts-ignore
    this.input = this.elInput;
  }

  hasLabel() {
    const { _label } = this;
    return !this.noLabel && _label !== false;
  }

  rerender() {
    //@ts-ignore
    //this.model.el = null;
    this.render();
  }

  render() {
    console.log('Render TraitView');
    const { $el, pfx, ppfx, model, type } = this;
    const { id } = model.attributes;
    const hasLabel = this.hasLabel && this.hasLabel();
    const cls = `${pfx}trait`;
    let tmpl = `<div class="${cls} ${cls}--${type}">
      ${hasLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ''}
      <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
        ${
          this.templateInput
            ? isFunction(this.templateInput)
              ? this.templateInput(this.getClbOpts())
              : this.templateInput
            : ''
        }
      </div>
    </div>`;
    $el.empty().append(tmpl);
    hasLabel && this.renderLabel();
    this.renderField();
    this.el.className = `${cls}__wrp ${cls}__wrp-${id}`;
    this.onRender(this.getClbOpts());
    return this;
  }
}
