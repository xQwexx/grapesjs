import Backbone from 'backbone';
import { isString, isUndefined } from 'underscore';
import TraitView from './TraitView';

const $ = Backbone.$;

export default class TraitSelectView extends TraitView<string> {
  options: any[];

  constructor(o: any = {}) {
    super(o);
    this.options = o.options || [];
    this.listenTo(this.model, 'change:options', this.rerender);
  }

  protected get templateInput() {
    const { ppfx, clsField } = this;
    return `<div class="${clsField}">
      <div data-input></div>
      <div class="${ppfx}sel-arrow">
        <div class="${ppfx}d-s-arrow"></div>
      </div>
    </div>`;
  }

  protected getInput() {
    const { name, options, em } = this;
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
      const resultName = em.t(`traitManager.traits.options.${name}.${value}`) || propName;
      input += `<option value="${value}"${attrs}>${resultName}</option>`;
      values.push(value);
    });

    input += '</select>';
    console.log(input);
    $input = $<HTMLInputElement>(input);
    const val = this.target;
    const valResult = values.indexOf(val) >= 0 ? val : this.default;
    !isUndefined(valResult) && $input.val(valResult);

    return $input;
  }
}
