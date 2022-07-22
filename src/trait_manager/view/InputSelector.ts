import Backbone from 'backbone';
import { isString, isUndefined } from 'underscore';
import TargetValueLink from '../model/TargetValueLink';
import Input from './Input';
import TraitInputView from './TraitInputView';

const $ = Backbone.$;

export default class InputSelector extends Input<string> {
  options: any[];

  name = '';
  constructor(link: TargetValueLink<string>, opts: any = {}) {
    super(link, opts);
    this.options = opts.options || [];
    //this.listenTo(this, 'change:options', this.render);
  }

  protected get templateInput() {
    const { ppfx, inputClass } = this;
    return `<div class="${inputClass}">
      <div data-input></div>
      <div class="${ppfx}sel-arrow">
        <div class="${ppfx}d-s-arrow"></div>
      </div>
    </div>`;
  }

  protected getInputEl(value: string) {
    const { name, options } = this;
    let $input;
    const values: string[] = [];
    let input = '<select>';

    options.forEach(el => {
      let attrs = '';
      let propName, value, style;

      if (isString(el)) {
        propName = el;
        value = el;
      } else {
        propName = el.name || el.label || el.value;
        value = `${isUndefined(el.value) ? el.id : el.value}`.replace(/"/g, '&quot;');
        style = el.style ? el.style.replace(/"/g, '&quot;') : '';
        attrs += style ? ` style="${style}"` : '';
      }
      const resultName = propName; //em.t(`traitManager.traits.options.${name}.${value}`) || propName;
      input += `<option value="${value}"${attrs}>${resultName}</option>`;
      values.push(value);
    });

    input += '</select>';
    $input = $<HTMLInputElement>(input);
    const valResult = values.indexOf(value) >= 0 ? value : 'No other option'; //this.default;
    !isUndefined(valResult) && $input.val(valResult);

    return $input;
  }
}
