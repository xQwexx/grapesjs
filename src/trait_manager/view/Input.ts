import Backbone, { EventHandler } from 'backbone';
import { isUndefined } from 'underscore';

const $ = Backbone.$;

export default class Input<ValueType> extends Backbone.View {
  ppfx: string;
  type: string;
  template() {
    return `<span class="${this.holderClass}"></span>`;
  }

  protected get inputClass() {
    return `${this.ppfx}field`;
  }

  protected get holderClass() {
    return `${this.ppfx}input-holder`;
  }

  private _$inputEl!: JQuery<HTMLInputElement> | null;

  protected get $inputEl() {
    if (!this._$inputEl) {
      this._$inputEl = this.getInputEl();
    }
    return this._$inputEl;
  }

  protected get input() {
    return this.$inputEl.get(0) as HTMLInputElement;
  }

  inputChangeCallbacks: EventHandler[] = [];

  constructor(opts: any = {}) {
    super(opts);
    this.ppfx = opts.ppfx || '';
    this.type = opts.type || 'text';
    //!opts.onChange && this.listenTo(this.model, 'change:value', this.handleModelChange);
  }

  onInputChange(callback: EventHandler) {
    this.inputChangeCallbacks.push(callback);
  }

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    this.model.trigger('el:change');
  }

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange(model: any, value: any) {
    const { input } = this;
    input && (input.value = value);
  }

  /**
   * Handled when the view is changed
   */
  handleChange(e: Event) {
    e.stopPropagation();
    const value = this.input.value as any;
    this.__onInputChange(value);
    this.elementUpdated();
  }

  __onInputChange(value: ValueType) {
    this.inputChangeCallbacks.forEach(callback => callback(value));
    this.model.set({ value }, { fromInput: 1 });
  }

  /**
   * Get the input element
   * @return {HTMLElement}
   */
  protected getInputEl() {
    const { model } = this;
    const type = this.type || 'text';
    const plh = model.get('placeholder') || model.get('defaults') || model.get('default') || '';
    return $<HTMLInputElement>(`<input type="${type}" placeholder="${plh}">`);
  }

  render() {
    this._$inputEl = null;
    const el = this.$el;
    el.addClass(this.inputClass);
    el.html(this.template());
    el.find(`.${this.holderClass}`).append(this.getInputEl());
    return this;
  }
}
/*
Input.prototype.events = {
  change: 'handleChange',
};*/
