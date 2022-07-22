import Backbone, { EventHandler, EventMap } from 'backbone';
import TargetValueLink from '../model/TargetValueLink';

const $ = Backbone.$;

class Input<ValueType> extends Backbone.View {
  ppfx: string;
  type: string;
  placeholder?: string;
  private link: TargetValueLink<ValueType>;

  protected get value() {
    return this.link.value;
  }

  template?(): string;
  //@ts-ignore
  get events(): EventMap {
    return { change: this.handleChange };
  }

  protected get inputClass() {
    const { ppfx, type } = this;
    return `${ppfx}field ${ppfx}field-${type}`;
  }

  protected get holderClass() {
    return `${this.ppfx}input-holder`;
  }

  protected resetEl() {
    this._inputEl = null;
  }

  private _inputEl!: JQuery<HTMLInputElement> | null;

  get $inputEl() {
    if (!this._inputEl) {
      this._inputEl = this.getInputEl(this.link.value);
      console.log(this.link.value);
    }
    return this._inputEl;
  }

  get inputEl() {
    return this.$inputEl.get(0) as HTMLInputElement;
  }

  constructor(link: TargetValueLink<ValueType>, opts: Input.Opts) {
    super();
    this.ppfx = opts.ppfx || '';
    this.type = opts.type || 'text';
    link.view = this;
    this.link = link;
    this.placeholder = opts.placeholder;
    //!opts.onChange && this.listenTo(this.model, 'change:value', this.handleModelChange);
  }

  /**
   * Fired when the element of the property is updated
   */
  /*elementUpdated() {
    this.model.trigger('el:change');
  }*/

  /**
   * Updates the view when the model is changed
   * */
  onTargetChanged(model: any, value: any) {
    const { inputEl } = this;
    inputEl && (inputEl.value = value);
  }

  /**
   * Handled when the view is changed
   */
  handleChange(e: Event) {
    e.stopPropagation();
    console.log(this.inputEl);
    const value = this.inputEl.value as any;
    this.__onInputChange(value);
    //this.elementUpdated();
  }

  protected __onInputChange(value: ValueType) {
    this.link.value = value;
    this.trigger('el:change');
  }

  /**
   * Get the input element
   * @return {HTMLElement}
   */
  protected getInputEl(value: ValueType) {
    const { placeholder, type } = this;
    const placeholderAttr = placeholder ? `placeholder="${placeholder}">` : '';
    const $el = $<HTMLInputElement>(`<input type="${type}" ${placeholderAttr}>`);
    $el.val(value as any);
    console.log($el.get(0));
    return $el;
  }

  render() {
    this._inputEl = null;
    const el = this.$el;
    el.addClass(this.inputClass);
    console.log('Input render first');
    console.log(el.get(0));
    el.empty();
    if (this.template) {
      el.html(this.template());
      el.find(`.${this.holderClass}`).append(this.inputEl);
    } else {
      console.log(this.inputEl);
      this.el = this.inputEl;
      //this.el = this.inputEl
      //el.append(this.inputEl);
    }
    console.log('Input render');
    console.log(el.get(0));

    return this;
  }
}
namespace Input {
  export interface Opts {
    ppfx: string;
    type: string;
    placeholder?: string;
  }
}
export default Input;
