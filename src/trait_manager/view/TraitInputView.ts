import Backbone, { EventHandler } from 'backbone';
import { isUndefined, isString, isFunction, any } from 'underscore';
import { capitalize } from '../../utils/mixins';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import { View } from '../../common';
import TargetValueLink from '../model/TargetValueLink';
import Input from './Input';
import TraitView from './TraitView';

const $ = Backbone.$;

type TargetValueLinkConstructor<Type> = { new (model: Component, opts: TargetValueLink.Opts): TargetValueLink<Type> };

export default class TraitInputView<Trait = any> extends TraitView {
  static TargetValueLink: TargetValueLinkConstructor<any> = TargetValueLink;
  events: any = {};
  get eventCapture() {
    return ['change'];
  }
  get type() {
    return 'text';
  }

  protected default: Trait;

  protected appendInput = true;
  noLabel = false;
  clsField: string;
  elInput!: HTMLInputElement;
  input: Input<Trait>;

  //@ts-ignore
  model!: Component;
  name: string;
  private _label: string | false;
  link: TargetValueLink<Trait>;

  get target() {
    return this.link.value;
  }

  set target(value: Trait) {
    this.link.value = value;
  }

  protected get templateLabel() {
    const { ppfx, label } = this;
    return `<div class="${ppfx}label" title="${label}">${label}</div>`;
  } //<div class="${ppfx}label-wrp" data-label></div>

  protected get templateInput() {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }

  constructor(link: TargetValueLink<Trait>, opts: any = {}) {
    super(opts.module, opts);
    console.log(opts);
    console.log(this.type);
    console.log(this.pfx);
    console.log('!!!!!!!!<<<<<<<<<<<<<<<<<<<<<!!!!!!!!!!!!!!!!!!>>>>>>>>>>>>>>>>>>>>>!!!!!!!!!!!!!!!!');
    this.default = '' as any;
    this.link = link;
    this.input = this.initInput(link, opts);
    //this.link.view= this;
    //this.target = opts.model;
    this.name = opts.name;
    this._label = opts.label ?? opts.name;
    const { model, eventCapture } = this;
    /*['classes', 'components'].forEach(name => {
      const events = `add remove ${name !== 'components' ? 'change' : ''}`;
      this.listenTo(this.get(name), events.trim(), (...args) => this.emitUpdate(name, ...args));
    });*/

    const { type, ppfx } = this;
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
    eventCapture.forEach(event => (this.events[event] = this.onChange));
    this.delegateEvents();
    this.init();
  }

  onTargetChanged(model: Component, value: Trait) {
    this.em?.trigger('trait:update', {
      trait: this.target,
      component: this.model,
    });
  }

  getClbOpts() {
    return {
      component: this.model,
      trait: this.target,
      elInput: this.elInput,
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

  /**
   * Fires when the input is changed
   */
  protected onChange(event: Event) {
    console.log('onchange');
    this.input.handleChange(event);
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

  protected initInput(link: TargetValueLink<Trait>, opts: any) {
    return new Input(link, opts);
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

  /**
   * Renders input
   * @private
   * */
  renderField() {
    const { $el, appendInput, model } = this;
    const inputs = $el.find('[data-input]');
    const el = inputs[inputs.length - 1];

    let tpl = this.createInput ? this.createInput(this.getClbOpts()) : this.input.render().el;

    console.log('Reaaly important');
    console.log(tpl);

    if (isString(tpl)) {
      el.innerHTML = tpl;
      //@ts-ignore
      this.elInput = el.firstChild;
    } else {
      appendInput ? el.appendChild(tpl) : el.insertBefore(tpl, el.firstChild);
      this.elInput = tpl;
    }
    console.log(this.elInput);

    console.log('Reaaly important');
    console.log(this.el);
  }

  hasLabel() {
    const { _label } = this;
    return !this.noLabel && _label !== false;
  }

  remove() {
    super.remove();
    console.log('destroy view');
    this.link.destroy();
    return this;
  }

  rerender() {
    //@ts-ignore
    //this.model.el = null;
    this.render();
  }

  render() {
    const { $el, pfx, ppfx, id, type } = this;

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
    this.el.className = `${cls}__wrp ${cls}__wrp-${this.name}`;
    this.onRender(this.getClbOpts());

    console.log(`Render TraitView ${this.el}`);
    return this;
  }
}
