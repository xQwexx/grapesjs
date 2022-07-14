import { isBoolean, isUndefined } from 'underscore';
import TraitView from './TraitView';

export default class TraitCheckboxView extends TraitView<boolean | string> {
  appendInput = false;
  valueTrue?: boolean | string;
  valueFalse?: boolean | string;
  get type() {
    return 'checkbox';
  }

  constructor(opts?: any) {
    super(opts);
    console.log('checkbox');
    this.valueTrue = opts.valueTrue;
    this.valueFalse = opts.valueFalse;
  }

  protected get templateInput() {
    const { ppfx, clsField } = this;
    return `<label class="${clsField}" data-input>
    <i class="${ppfx}chk-icon"></i>
  </label>`;
  }

  protected parseValueFromEl(el: HTMLInputElement) {
    let result: boolean | string = el.checked;
    const { valueTrue, valueFalse } = this;

    if (result && !isUndefined(valueTrue)) {
      result = valueTrue;
    }

    if (!result && !isUndefined(valueFalse)) {
      result = valueFalse;
    }

    return result;
  }

  protected updateValueView(el: HTMLInputElement, value: boolean | string) {
    const { valueFalse } = this;
    el.checked = isBoolean(value) ? value : !isUndefined(valueFalse) && value === valueFalse ? false : true;
  }
}
