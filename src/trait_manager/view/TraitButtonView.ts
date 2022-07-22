import Backbone from 'backbone';
import { isString } from 'underscore';
import TraitInputView from './TraitInputView';

const $ = Backbone.$;

export default class TraitButtonView extends TraitInputView<unknown> {
  full?: boolean;
  labelButton?: string;
  text?: string;
  command?: any;

  get type() {
    return 'button';
  }

  get eventCapture() {
    return ['click button'];
  }

  protected get templateInput() {
    return '';
  }

  protected onChange() {
    this.handleClick();
  }

  private handleClick() {
    const { command, em } = this;

    if (command) {
      if (isString(command)) {
        em.get('Commands').run(command);
      } else {
        command(em.get('Editor'), this);
      }
    }
  }

  protected getInput() {
    const { labelButton, text, full, ppfx } = this;
    const label = labelButton || text;
    const className = `${ppfx}btn`;
    const $input = $<HTMLInputElement>(
      `<button type="button" class="${className}-prim${full ? ` ${className}--full` : ''}">${label}</button>`
    );
    return $input;
  }
}
