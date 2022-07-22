import Backbone from 'backbone';
import { bindAll, indexOf, isUndefined } from 'underscore';
import { off } from '../../utils/mixins';
import TargetValueLink from '../model/TargetValueLink';
import Input from './Input';
import TraitInputView from './TraitInputView';

const $ = Backbone.$;
interface NumberWithUnit {
  value: number;
  unit?: string;
}

class NumberWithUnitLink extends TargetValueLink<NumberWithUnit> {
  get value() {
    const value = this._value;
    const number = parseFloat(value.replace(/^\D|,+/g, ''));
    const unit = value.lastIndexOf(/D/g);
    console.log(unit);
    return value;
  }

  set value(value: NumberWithUnit) {
    if (isUndefined(value)) return;
    this._value = !value.unit ? value.value : value.value + value.unit;
  }
}

export class InputNumber extends Input<NumberWithUnit> {
  template() {
    const ppfx = this.ppfx;
    return `
      <span class="${ppfx}input-holder"></span>
      <span class="${ppfx}field-units"></span>
      <div class="${ppfx}field-arrows" data-arrows>
        <div class="${ppfx}field-arrow-u" data-arrow-up></div>
        <div class="${ppfx}field-arrow-d" data-arrow-down></div>
      </div>
    `;
  }
  get events() {
    return {
      'change input': this.handleChange,
      'change select': this.handleUnitChange,
      'click [data-arrow-up]': this.upArrowClick,
      'click [data-arrow-down]': this.downArrowClick,
      'mousedown [data-arrows]': this.downIncrement,
      keydown: this.handleKeyDown,
    };
  }

  get inputClass() {
    const ppfx = this.ppfx;
    return `${ppfx}field ${ppfx}field-integer`;
  }

  constructor(link: TargetValueLink<NumberWithUnit>, opts: any) {
    super(link, opts);
    bindAll(this, 'moveIncrement', 'upIncrement');
    this.units = opts.units || [];
    console.log('3489059854585804239-5098432-0598234059');
    console.log('================================================================================');
    console.log(this.ppfx);
    //this.doc = document;
  }

  units: string[];
  unitEl?: HTMLSelectElement;

  /**
   * Set value to the model
   * @param {string} value
   * @param {Object} opts
   */
  setValue(value: NumberWithUnit) {
    this.__onInputChange(value);
    return;
    // var opt = opts || {};
    // var valid = this.validateInputValue(value, { deepCheck: 1 });
    // var validObj = { value: valid.value };

    // // If found some unit value
    // if (valid.unit || valid.force) {
    //   validObj.unit = valid.unit;
    // }

    // this.model.set(validObj, opt);

    // // Generally I get silent when I need to reflect data to view without
    // // reupdating the target
    // if (opt.silent) {
    //   this.handleModelChange();
    // }
  }

  /**
   * Handled when the view is changed
   */
  handleChange(e: Event) {
    e.stopPropagation();
    this.setValue({ value: this.inputEl.value as any });
    this.elementUpdated();
  }

  /**
   * Handled when the view is changed
   */
  handleUnitChange(e: Event) {
    e.stopPropagation();
    this.elementUpdated();
  }

  /**
   * Handled when user uses keyboard
   */
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.upArrowClick();
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.downArrowClick();
    }
  }

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    var unit = this.unitEl?.value;
    //this.model.trigger('el:change');
  }

  /**
   * Updates the view when the model is changed
   * */
  onTargetChanged(model: any, value: NumberWithUnit) {
    const { inputEl } = this;
    this.inputEl.value = value.value.toString();
    const unitEl = this.getUnitEl();
    unitEl && (unitEl.value = value.unit || '');
  }

  /**
   * Get the unit element
   * @return {HTMLElement}
   */
  getUnitEl(unitToSet?: string) {
    if (!this.unitEl) {
      const units = this.units || [];

      if (units.length) {
        const options = ['<option value="" disabled hidden>-</option>'];

        units.forEach(unit => {
          const selected = unit == unitToSet ? 'selected' : '';
          options.push(`<option ${selected}>${unit}</option>`);
        });

        const temp = document.createElement('div');
        temp.innerHTML = `<select class="${this.ppfx}input-unit">${options.join('')}</select>`;
        this.unitEl = temp.firstChild as HTMLSelectElement;
      }
    }

    return this.unitEl;
  }

  /**
   * Invoked when the up arrow is clicked
   * */
  upArrowClick() {
    const { model } = this;
    const step = model.get('step');
    let value = parseFloat(model.get('value'));
    //this.setValue(this.normalizeValue(value + step));
    this.elementUpdated();
  }

  /**
   * Invoked when the down arrow is clicked
   * */
  downArrowClick() {
    const { model } = this;
    const step = model.get('step');
    const value = parseFloat(model.get('value'));
    //this.setValue(this.normalizeValue(value - step));
    this.elementUpdated();
  }

  /**
   * Change easily integer input value with click&drag method
   * @param Event
   *
   * @return void
   * */
  downIncrement(e: Event) {
    e.preventDefault();
    // this.moved = 0;
    // var value = this.model.get('value') || 0;
    // value = this.normalizeValue(value);
    // this.current = { y: e.pageY, val: value };
    // on(this.doc, 'mousemove', this.moveIncrement);
    // on(this.doc, 'mouseup', this.upIncrement);
  }

  /** While the increment is clicked, moving the mouse will update input value
   * @param Object
   *
   * @return bool
   * */
  moveIncrement(ev: Event) {
    // this.moved = 1;
    // const model = this.model;
    // const step = model.get('step');
    // const data = this.current;
    // var pos = this.normalizeValue(data.val + (data.y - ev.pageY) * step);
    // const { value, unit } = this.validateInputValue(pos);
    // this.prValue = value;
    // model.set({ value, unit }, { avoidStore: 1 });
    return false;
  }

  /**
   * Stop moveIncrement method
   * */
  upIncrement() {
    // const model = this.model;
    // const step = model.get('step');
    // off(this.doc, 'mouseup', this.upIncrement);
    // off(this.doc, 'mousemove', this.moveIncrement);
    // if (this.prValue && this.moved) {
    //   var value = this.prValue - step;
    //   model.set('value', value, { avoidStore: 1 }).set('value', value + step);
    //   this.elementUpdated();
    // }
  }

  normalizeValue(value: string, defValue = 0) {
    const model = this.model;
    const step = model.get('step');
    let stepDecimals = 0;

    const valueNumber = parseFloat(value);
    if (isNaN(valueNumber)) {
      return defValue;
    }
    if (Math.floor(valueNumber) !== valueNumber) {
      const side = step.toString().split('.')[1];
      stepDecimals = side ? side.length : 0;
    }

    return stepDecimals ? parseFloat(valueNumber.toFixed(stepDecimals)) : valueNumber;
  }

  /**
   * Validate input value
   * @param {String} value Raw value
   * @param {Object} opts Options
   * @return {Object} Validated string
   */
  validateInputValue(value: NumberWithUnit, opts = {}) {
    const { units } = this;
    var force = 0;
    var opt = opts || {};
    var model = this.model;
    const defValue = ''; //model.get('defaults');
    var val = !isUndefined(value) ? value.value : defValue;
    var unit = value.unit || '';
    // var max = !isUndefined(opts.max) ? opts.max : model.get('max');
    // var min = !isUndefined(opts.min) ? opts.min : model.get('min');
    // var limitlessMax = !!model.get('limitlessMax');
    // var limitlessMin = !!model.get('limitlessMin');

    // if (opt.deepCheck) {
    //   var fixed = model.get('fixedValues') || [];

    //   if (val === '') unit = '';

    //   if (val) {
    //     // If the value is one of the fixed values I leave it as it is
    //     var regFixed = new RegExp('^' + fixed.join('|'), 'g');
    //     if (fixed.length && regFixed.test(val)) {
    //       val = val.match(regFixed)[0];
    //       unit = '';
    //       force = 1;
    //     } else {
    //       var valCopy = val + '';
    //       val += ''; // Make it suitable for replace
    //       val = parseFloat(val.replace(',', '.'));
    //       val = !isNaN(val) ? val : defValue;
    //       var uN = valCopy.replace(val, '');
    //       // Check if exists as unit
    //       if (indexOf(units, uN) >= 0) unit = uN;
    //     }
    //   }
    // }

    // if (!limitlessMax && !isUndefined(max) && max !== '') val = val > max ? max : val;
    // if (!limitlessMin && !isUndefined(min) && min !== '') val = val < min ? min : val;

    return {
      force,
      value: val,
      unit,
    };
  }

  protected getInputEl(value: NumberWithUnit) {
    const { placeholder, type } = this;
    const placeholderAttr = placeholder ? `placeholder="${placeholder}">` : '';
    const $el = $<HTMLInputElement>(`<input type="${type}" ${placeholderAttr}>`);
    console.log(value);
    $el.val(value.value as any);
    console.log($el.get(0));

    // this.unitEl = null;
    const unit = this.getUnitEl(value.unit);
    unit && this.$el.find(`.${this.ppfx}field-units`).get(0)?.appendChild(unit);
    return $el;
  }

  render() {
    Input.prototype.render.call(this);

    return this;
  }
}

export default class TraitNumberView extends TraitInputView<NumberWithUnit> {
  TargetValueLink = NumberWithUnitLink;

  get type() {
    return 'number';
  }

  constructor(link: TargetValueLink<NumberWithUnit>, opts: any) {
    super(link, opts);
  }

  protected initInput(link: TargetValueLink<NumberWithUnit>, opts: any) {
    const input = new InputNumber(link, opts);
    //this.listenTo(input, "el:change", this.render)
    return input;
  }

  /* protected getInput() {
    const { ppfx, model } = this;
    const value = this.target;
    const inputNumber = new InputNumber({
      contClass: `${ppfx}field-int`,
      type: 'number',
      model: model,
      ppfx,
    });
    inputNumber.render();
    const $input = inputNumber.inputEl as JQuery<HTMLInputElement>;
    //this.$unit = inputNumber.unitEl;
    //@ts-ignore
    //model.set('value', value, { fromTarget: true });
    $input.val(value);
    return $input;
  }*/
}
