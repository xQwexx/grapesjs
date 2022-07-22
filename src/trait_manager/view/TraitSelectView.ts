import Backbone from 'backbone';
import { isString, isUndefined } from 'underscore';
import TargetValueLink from '../model/TargetValueLink';
import InputSelector from './InputSelector';
import TraitInputView from './TraitInputView';

const $ = Backbone.$;

export default class TraitSelectView extends TraitInputView<string> {
  options: any[];

  constructor(link: TargetValueLink<string>, opts: any) {
    super(link, opts);
    this.options = opts.options || [];
    this.listenTo(this.model, 'change:options', this.rerender);
    //this.link = link: TargetValueLink<ValueType>, opts: any = {}
    //this.input = new InputSelector()
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
  protected initInput(link: TargetValueLink<string>, opts: any) {
    const input = new InputSelector(link, opts);
    this.listenTo(input, 'el:change', this.render);
    return input;
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
