import { Model, $ } from '../..';
import EditorModel from '../../../editor/model/Editor';
import InputFactory from '..';
import TraitView, { TraitViewOpts } from './TraitView';
import { isArray, isUndefined, times } from 'underscore';
import TraitRoot from '../model/TraitRoot';
import TraitObjectItem from '../model/TraitObjectItem';
import Trait from '../model/Trait';
import TraitFactory from '../model/TraitFactory';
import TraitListItem from '../model/TraitListItem';
import TraitObject from '../model/TraitObject';
import TraitList from '../model/TraitList';
import TraitListUnique from '../model/TraitListUnique';

export interface TraitListViewOpts<T extends string = 'object'> extends TraitViewOpts<T> {
  traits: any[] | any;
  title?: string;
}

export default class TraitListView extends TraitView<TraitList> {
  protected type = 'list';
  templates: any[];
  private toolbarEl?: HTMLDivElement;
  private itemsEl?: JQuery<HTMLDivElement>[];
  private selectedEl?: JQuery<HTMLDivElement>;
  protected traitOps?: any;
  events() {
    return {
      'click [addButton]': this.addItem,
      'click [removeButton]': this.removeItem,
      'click [data-item-title]': this.select,
    };
  }

  private select(e?: any) {
    e?.stopPropagation();
    e?.preventDefault();
    const { model, ppfx, selectedEl } = this;
    // model.setOpen(!model.get('open'));
    this.itemsEl?.forEach(el => {
      el.find('.data-item').get(0)!.style.display = 'none';
    });
    if (!isUndefined(e)) {
      var selected = $(e.target).closest(`.${ppfx}item-title`).parent().find('.data-item');
      this.selectedEl = selected;
      selected.get(0)!.style.display = '';
    } else if (!isUndefined(selectedEl)) {
      selectedEl.get(0)!.style.display = '';
    }
    // $el[isOpen ? 'addClass' : 'removeClass'](`${pfx}open`);
    // this.getPropertiesEl().style.display = isOpen ? '' : 'none';
  }

  title?: string;

  constructor(em: EditorModel, opts: TraitListViewOpts) {
    super(em, { ...opts });
    this.templates = opts.traits;
    this.title = opts.title;
  }
  get children() {
    return this.target.children as TraitObjectItem[];
  }
  //   get traits() {
  //     return Object.entries(this.target.value).map(([id, value]) => this.initTrait(id, {...this.traitOps?.value, ...value}))
  //   }

  private initTrait(index: string, value?: any) {
    const { templates } = this;
    const traits = this.templates;
    if (isArray(templates) && templates.length > 1) {
      return new TraitObjectItem(index, this.target, { name: index, traits, value, ...this.traitOps });
    } else {
      return new TraitObjectItem(index, this.target, { name: index, ...traits, value, ...this.traitOps });
    }
  }
  get editable() {
    return this.target.opts.editable ?? true;
  }

  //   initTarget(target: Trait){
  //       this.traits
  //   }

  onUpdateEvent(value: any, fromTarget: boolean): void {
    console.log('aaa', 'onUpdateEvent');
    console.log('aaa', this.target.children);
    if (fromTarget) {
      this.render();
    }
  }

  private addItem(e: any) {
    e.preventDefault();
    const name = this.$el.find('[variableName]').val() as any;
    console.log('alamr', this.target.opts.traits);
    if (this.target.type == 'list') {
      this.target.children.push(new TraitListItem(this.target.children.length, this.target, this.target.opts.traits));
    }
    this.render();
  }

  private removeItem(e: any) {
    e.preventDefault();
    const { value } = this.target;
    const name = this.selectedEl?.attr('item-id') as any;
    if (typeof value[name] != 'undefined') {
      delete value[name];
      this.target.value = value;
    }
    this.render();
  }

  renderToolbar() {
    if (!this.toolbarEl) {
      let el = document.createElement('div');
      el.append(document.createElement('button'));
      let tmpl = `<div class="">
      <input type="$text" variableName/>
      <button addButton> Add </button>
      <button removeButton> Remove </button>
    </div>`;
      this.toolbarEl = $(tmpl).get(0);
    }
    return this.toolbarEl!;
  }

  onItemRender(e: any) {}

  renderItem(trait: TraitObjectItem) {
    const { em, ppfx, title } = this;
    const icons = em?.getConfig().icons;
    const iconCaret = icons?.caret || '';
    const view = InputFactory.buildView(trait, em, { ...trait.opts, noLabel: true }).render();
    view.on('all', this.onItemRender, this);
    var itemEl = document.createElement('div');
    console.log(trait);
    const itemTitle = title ? trait.value[title] : trait.name;
    itemEl.innerHTML = `
    <div class="${ppfx}item-title" data-item-title>
        <div class="${ppfx}caret">${iconCaret}</div>
        <div class="${ppfx}label">${itemTitle}</div>
    </div>
    `;
    // <div class="${ppfx}label">${label}</div>
    console.log(itemEl);
    var itemDataEl = document.createElement('div');
    itemDataEl.className = 'data-item';
    itemDataEl.setAttribute('item-id', trait.name);
    itemDataEl.append(view.el);
    console.log(itemEl);
    itemEl.append(itemDataEl);
    return $(itemEl);
  }

  renderItems() {
    this.itemsEl = this.children.map(trait => this.renderItem(trait));
  }

  render() {
    const { $el, pfx, ppfx, name, type, className } = this;
    const hasLabel = this.hasLabel();
    const cls = `${pfx}trait`;
    var frag = document.createDocumentFragment();
    console.log('aaa', 'render');
    this.$el.empty();
    this.renderItems();
    this.itemsEl?.forEach(el => frag.appendChild(el.get(0)!));
    console.log(this.itemsEl);
    let itemsEl = document.createElement('div');
    itemsEl.className = `${ppfx}field-${type}-items`;
    itemsEl.append(frag);
    // el.className += model.isFull() ? ` ${className}--full` : '';
    let tmpl = `<div class="${cls} ${cls}--${type}">
    ${hasLabel ? `<div class="${ppfx}label" data-label></div>` : ''}
    <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type} gjs-trt-trait--full" data-input>

    </div>
  </div>`;
    this.$el.html(tmpl);
    const dataInput = this.$el.find('[data-input]');
    if (this.editable) {
      dataInput.append(this.renderToolbar());
    }
    dataInput.append(itemsEl);
    // ${this.renderToolbar()}
    // ${itemsEl}
    // console.log(frag);
    this.select();

    return this;
  }
}
