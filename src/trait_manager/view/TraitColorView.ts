import TraitView from './TraitView';
import InputColor from '../../domain_abstract/ui/InputColor';

export default class TraitColorView extends TraitView<any> {
  get type() {
    return 'color';
  }
  protected get templateInput() {
    return '';
  }

  /*protected getInput() {
    const model = this.model;
    const value = this.target;
   const inputColor = new InputColor({
      model: model,//{...this, value: this.target},
      target: this.config.em,
      contClass: this.ppfx + 'field-color',
      ppfx: this.ppfx,
    });
    const $input = inputColor.render().inputEl as JQuery<HTMLInputElement>;
    $input.val(value);

    return $input;
  }*/
}
