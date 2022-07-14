import { isUndefined } from 'underscore';
import InputNumber from '../../domain_abstract/ui/InputNumber';
import TraitView from './TraitView';

export default class TraitNumberView extends TraitView<number> {
  get type() {
    return 'number';
  }

  constructor(o: any) {
    super(o);
  }

  getValueForTarget() {
    const { model } = this;
    const { value, unit } = model.attributes;
    return !isUndefined(value) && value !== '' ? value + unit : model.get('default');
  }

  protected getInput() {
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
  }
}
