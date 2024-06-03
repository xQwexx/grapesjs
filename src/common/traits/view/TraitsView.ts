import EditorModel from '../../../editor/model/Editor';
import InputFactory from '..';
import TraitView, { TraitViewOpts } from './TraitView';
import TraitObjectItem from '../model/TraitObjectItem';
import TraitParent from '../model/TraitParent';
import Trait from '../model/Trait';
import TraitElement from '../model/TraitElement';

export interface TraitListUniqueViewOpts<T extends string = 'object'> extends TraitViewOpts<T> {
  traits: any[] | any;
}

export default abstract class TraitsView<T extends TraitParent<TraitElement>> extends TraitView<T> {
  protected type = 'list';
  templates: any[];
  private _items?: TraitView[];
  protected traitOps?: any;

  get items() {
    return this._items ?? [];
  }

  constructor(em: EditorModel, opts: TraitListUniqueViewOpts) {
    super(em, { ...opts });
    this.templates = opts.traits;
    console.log("Tryed to select Object", this.templates)
  }

  get children() {
    return this.target.children as TraitElement[];
  }

  onUpdateEvent(value: any, fromTarget: boolean): void {
    console.log('aaa', 'onUpdateEvent');
    console.log('aaa', this.target.children);
    if (fromTarget) {
      this._items = undefined;
      this.render();
    }
  }

  onItemRender(e: any) {
    console.log('setValueFromModellsadkfj;lkasdj;flk', e);
    this.render();
  }

  renderItems(traits?: Trait[]) {
    if (!this._items) {
      console.log('important', traits, this.target, this.target?.children);
      this._items = (traits ?? this.children).map(trait => {
        console.log('///TraitView/////', trait);
        const view = InputFactory.buildView(trait, trait.em, {...trait.opts  }).render();
        //   traits ?? view.on('render', this.onItemRender, this)
        return view;
      });
    }
  }

  protected abstract renderTraits(traitViews: TraitView[]): void;

  render(traits?: Trait[]) {
    this.renderItems(traits);
    console.log('important', this.items, traits);
    this.renderTraits(this.items);
    super.render();
    return this;
  }
}
