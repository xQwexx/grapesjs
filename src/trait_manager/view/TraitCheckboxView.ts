import Backbone from 'backbone';
import { isBoolean, isUndefined } from 'underscore';
import Component from '../../dom_components/model/Component';
import TargetValueLink from '../model/TargetValueLink';
import Input from './Input';
import TraitInputView from './TraitInputView';

const $ = Backbone.$;

class TargetValueLinkBoolean extends TargetValueLink<boolean> {
  valueTrue?: boolean | string;
  valueFalse?: boolean | string;

  constructor(model: Component, opts: TargetValueLinkBoolean.Opts) {
    super(model, opts);

    this.valueTrue = opts.valueTrue;
    this.valueFalse = opts.valueFalse;
  }

  get value() {
    const { valueFalse } = this;
    const value = this._value;
    return isBoolean(value)
      ? value
      : !isUndefined(this.valueTrue) && value === this.valueTrue
      ? true
      : this.default ?? false;
  }

  set value(value: boolean) {
    const { valueTrue, valueFalse } = this;
    if (isUndefined(value)) return;
    let valueToSet: boolean | string = value;

    if (value && !isUndefined(valueTrue)) {
      valueToSet = valueTrue;
    }

    if (!value && !isUndefined(valueFalse)) {
      valueToSet = valueFalse;
    }

    this._value = valueToSet;
  }
}
namespace TargetValueLinkBoolean {
  export interface Opts extends TargetValueLink.Opts {
    valueTrue?: boolean | string;
    valueFalse?: boolean | string;
  }
}
class InputCheckbox extends Input<boolean> {
  /**
   * Updates the view when the model is changed
   * */
  onTargetChanged(model: any, value: any) {
    const { inputEl } = this;
    inputEl && (inputEl.checked = value);
  }

  /**
   * Handled when the view is changed
   */
  handleChange(e: Event) {
    //e.stopPropagation();
    const { inputEl } = this;
    const value = inputEl.checked;
    //inputEl && (inputEl.checked = value);
    console.log(value);
    console.log(inputEl);
    this.__onInputChange(value);
  }

  /**
   * Get the input element
   * @return {HTMLElement}
   */
  protected getInputEl(value: Boolean) {
    const { placeholder, type } = this;
    const placeholderAttr = placeholder ? `placeholder="${placeholder}">` : '';
    const $el = $<HTMLInputElement>(`<input type="${type}" ${placeholderAttr} ${value ? 'checked' : ''}>`);
    console.log('dummu print oit');
    console.log($el.get(0));
    return $el;
  }
}

export default class TraitCheckboxView extends TraitInputView<boolean> {
  appendInput = false;

  static TargetValueLink = TargetValueLinkBoolean;

  get type() {
    return 'checkbox';
  }

  protected get templateInput() {
    const { ppfx, clsField } = this;
    return `<label class="${clsField}" data-input>
    <i class="${ppfx}chk-icon"></i>
  </label>`;
  }

  protected initInput(link: TargetValueLink<boolean>, opts: any) {
    const input = new InputCheckbox(link, opts);
    //this.listenTo(input, "el:change", this.render)
    return input;
  }

  render() {
    super.render();
    console.log('Something nice');
    return this;
  }
}
