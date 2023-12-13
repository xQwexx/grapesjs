import { isFunction } from 'underscore';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { hasDnd } from '../../utils/mixins';
import Page from '../../pages/model/Page';
import TraitTextView from '../../common/traits/view/TraitTextView';

export type ItemViewProps = {
  level: number;
  config: any;
  opened: {};
  model: Page;
  sorter: any;
};

const inputProp = 'contentEditable';

export interface PageViewConfig {
  em?: EditorModel;
  pStylePrefix?: string;
  getSorter?: any;
}

export default class PageView extends View<Page> {
  className: string;

  highlightedClass = 'gjs-three-bg';

  render() {
    const { em, pfx, ppfx, model } = this;
    this.$el.attr('class', this.className);
    let input = new TraitTextView('name', model, { em, pfx, ppfx });
    this.$el.append(input.render().el);
    return this;
  }
  events() {
    return {
      click: () => this.trigger('onClick', this),
    };
  }

  constructor(opt: any, config: PageViewConfig) {
    super(opt);
    this.config = config;
    const { model, pfx, ppfx } = this;
    const type = model.get('type') || 'default';
    this.className = `${ppfx}layer ${ppfx}layer__t-${type} no-select ${pfx}two-color`;
  }

  public get em(): EditorModel {
    return this.config.em;
  }

  public get ppfx(): string {
    return this.em.getConfig().stylePrefix!;
  }

  public get pfx(): string {
    return this.config.stylePrefix;
  }

  setHighlighted(status: boolean) {
    status ? this.$el.addClass(this.highlightedClass) : this.$el.removeClass(this.highlightedClass);
  }

  config: any;

  get page() {
    return this.model;
  }
}
