import Backbone from "backbone";
import { Module } from "common/module";
import View from "common/View";
import TraitManagerConfig from "trait_manager/config/config";
import Trait from "trait_manager/model/Trait";
import { isUndefined, isString, isFunction } from "underscore";
import { capitalize } from "utils/mixins";

const $ = Backbone.$;

export default class TraitView extends View<Trait> {
  //events: {},
  eventCapture = ["change"];

  appendInput = true;

  /*attributes() {
    return this.model.get('attributes');
  }*/

  templateLabel() {
    const { ppfx } = this;
    const label = this.getLabel();
    return `<div class="${ppfx}label" title="${label}">${label}</div>`;
  }

  templateInput(ev?: any) {
    const { clsField } = this;
    return `<div class="${clsField}" data-input></div>`;
  }
  clsField: string;
  target: Trait;
  elInput?: HTMLElement;
  $input?: JQuery<HTMLElement>;
  input: any;
  noLabel = false;

  constructor(module: Module, model: Trait) {
    super(module, model);
    const { eventCapture } = this;
    const { target } = model;
    const { type } = model.attributes;
    this.target = target;
    const { ppfx } = this;
    this.clsField = `${ppfx}field ${ppfx}field-${type}`;
    [
      ["change:value", this.onValueChange],
      ["remove", this.removeView]
    ].forEach(tuple => {
      const [event, clb] = tuple as [string, any];
      model.off(event, clb);
      this.listenTo(model, event, clb);
    });
    model.view = this;
    this.listenTo(model, "change:label", this.render);
    this.listenTo(model, "change:placeholder", this.rerender);
    //this.events = {};
    //@ts-ignore
    eventCapture.forEach(event => (this.events[event] = "onChange"));
    this.delegateEvents();
    this.init();
  }

  getClbOpts() {
    return {
      component: this.target,
      trait: this.model,
      elInput: this.getInputElem()
    };
  }

  removeView() {
    this.remove();
    this.removed();
  }

  init() {}
  removed() {}
  onRender(ev: any) {}
  onUpdate(ev: any) {}
  onEvent(ev: any) {}
  createInput?(ev: any): HTMLElement;
  createLabel?(ev: any): string;

  /**
   * Fires when the input is changed
   * @private
   */
  onChange(event: any) {
    const el = this.getInputElem();
    if (el && !isUndefined(el.value)) {
      this.model.set("value", el.value);
    }
    this.onEvent({
      ...this.getClbOpts(),
      event
    });
  }

  getValueForTarget() {
    return this.model.get("value");
  }

  setInputValue(value: any) {
    const el = this.getInputElem();
    el && (el.value = value);
  }

  /**
   * On change callback
   * @private
   */
  onValueChange(model: Trait, value: any, opts: any = {}) {
    if (opts.fromTarget) {
      this.setInputValue(model.get("value"));
      this.postUpdate();
    } else {
      const val = this.getValueForTarget();
      model.setTargetValue(val, opts);
    }
  }

  /**
   * Render label
   * @private
   */
  renderLabel() {
    const { $el, target } = this;
    const label = this.getLabel();
    let tpl = this.templateLabel();

    if (this.createLabel) {
      tpl =
        this.createLabel({
          label,
          component: target,
          trait: this
        }) || "";
    }

    $el.find("[data-label]").append(tpl);
  }

  /**
   * Returns label for the input
   * @return {string}
   * @private
   */
  getLabel() {
    const { em } = this;
    const { label, name } = this.model.attributes;
    return (
      em.t(`traitManager.traits.labels.${name}`) ||
      capitalize(label || name).replace(/-/g, " ")
    );
  }

  /**
   * Returns current target component
   */
  getComponent() {
    return this.target;
  }

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      const { em, model } = this;
      const md = model;
      const { name } = model.attributes;
      const plh = md.get("placeholder") || md.get("default") || "";
      const type = md.get("type") || "text";
      const min = md.get("min");
      const max = md.get("max");
      const value = this.getModelValue();
      const input = $(`<input type="${type}" placeholder="${plh}">`);
      const i18nAttr = em.t(`traitManager.traits.attributes.${name}`) || {};
      input.attr(i18nAttr);

      if (!isUndefined(value)) {
        md.set({ value }, { silent: true });
        input.prop("value", value);
      }

      if (min) {
        input.prop("min", min);
      }

      if (max) {
        input.prop("max", max);
      }

      this.$input = input;
    }
    return this.$input.get(0);
  }

  getInputElem() {
    const { input, $input } = this;
    return (
      input || ($input && $input.get && $input.get(0)) || this.getElInput()
    );
  }

  getModelValue() {
    let value;
    const model = this.model;
    const target = this.target;
    const name = model.get("name");

    if (model.get("changeProp")) {
      value = target.get(name);
    } else {
      const attrs = target.get("attributes");
      value = model.get("value") || attrs[name];
    }

    return !isUndefined(value) ? value : "";
  }

  getElInput() {
    return this.elInput;
  }

  /**
   * Renders input
   * @private
   * */
  renderField() {
    const { $el, appendInput, model } = this;
    const inputs = $el.find("[data-input]");
    const el = inputs[inputs.length - 1];
    let tpl = model.el;

    if (!tpl) {
      tpl = this.createInput
        ? this.createInput(this.getClbOpts())
        : this.getInputEl();
    }

    if (isString(tpl)) {
      el.innerHTML = tpl;
      this.elInput = (el.firstChild as HTMLElement) ?? undefined;
    } else {
      appendInput ? el.appendChild(tpl) : el.insertBefore(tpl, el.firstChild);
      this.elInput = tpl;
    }

    model.el = this.elInput;
  }

  hasLabel() {
    const { label } = this.model.attributes;
    return !this.noLabel && label !== false;
  }

  rerender() {
    this.model.el = null;
    this.render();
  }

  postUpdate() {
    this.onUpdate(this.getClbOpts());
  }

  render() {
    const { $el, pfx, ppfx, model } = this;
    const { type, id } = model.attributes;
    const hasLabel = this.hasLabel && this.hasLabel();
    const cls = `${pfx}trait`;
    this.$input = undefined;
    let tmpl = `<div class="${cls} ${cls}--${type}">
      ${hasLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ""}
      <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
        ${
          this.templateInput
            ? isFunction(this.templateInput)
              ? this.templateInput(this.getClbOpts())
              : this.templateInput
            : ""
        }
      </div>
    </div>`;
    $el.empty().append(tmpl);
    hasLabel && this.renderLabel();
    this.renderField();
    this.el.className = `${cls}__wrp ${cls}__wrp-${id}`;
    this.postUpdate();
    this.onRender(this.getClbOpts());
    return this;
  }
}
