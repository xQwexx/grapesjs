import Trait from '../Trait';
import { SelectOption } from '../../view/TraitSelectView';
import TraitElement from '../TraitElement';
import { isFunction, isString } from 'underscore';
import Selectors from '../../../../selector_manager/model/Selectors';
import Selector from '../../../../selector_manager/model/Selector';

export type StateRef = { componentId: string; stateName: string }


export default class TraitClassSelector extends TraitElement<Selectors> {
  constructor(target: Trait<Selectors>) {
    super(target);
    target.opts.editable = false;
  }

  get name(): string{
      return this.target.name;
  }

  get defaultValue() {
      return this.target.value;
  }

  protected setValue(value: any): void {
    const options = this.opts.options;
    const opts: SelectOption[] = isFunction(options) ? options(this.em) : options;
    const optsVal: string[] = opts.map(opt => (isString(opt)? opt : opt.value))

    if (isString(value)){
        optsVal.forEach( opts =>{
            const classes = opts.split(' ');
            classes.forEach(oldClass => this.target.value.remove({name: oldClass, type: Selector.TYPE_CLASS}))
            }
        )

        const selectedClasses = (value.split(' ') as string[]).filter(c => c != '')
        selectedClasses.length > 0 && selectedClasses.forEach(newClass => this.target.value.add({name: newClass, type: Selector.TYPE_CLASS}))
    }
  }

  protected getValue(): any {
    const options = this.opts.options;
    const opts: SelectOption[] = isFunction(options) ? options(this.em) : options;
    const optsVal: string[] = opts.map(opt => (isString(opt)? opt : opt.value))

    let currentClasses = this.target.value.getFullString().split('.').filter(c => c != '');
    return optsVal.find(opt => opt.split(' ').every(c => currentClasses.find(cc => cc == c)))
  }

  get viewType(): string {
      return 'select';
  }

}
