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
import TraitElement from '../model/TraitElement';

export interface TraitListViewOpts<T extends string = 'object'> extends TraitViewOpts<T> {
  traits: any[] | any;
  title?: string;
}

export default class TraitListView extends TraitView<TraitList> {
  protected type = 'list';
  templates: any[];
  private toolbarEl?: HTMLDivElement;
  private itemsEl?: JQuery<HTMLDivElement>;
  // private selectedEl?: JQuery<HTMLDivElement>;
  private selectedIndex?: number;
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
    const { model, ppfx } = this;
    // model.setOpen(!model.get('open'));
    // this.itemsEl?.find('').css({ "display": 'none' }).get(0)
    this.itemsEl?.children().each((i, el) => {
      $(el).find('.data-item')?.css({ "display": 'none' });
    });
    if (!isUndefined(e)) {
      const selectedEl: JQuery<HTMLDivElement> = $(e.target).closest(`.${ppfx}item-title`).parent()
      console.log("aaaa", selectedEl.index())
      this.selectedIndex = selectedEl.index()
      // var selected = $(e.target).closest(`.${ppfx}item-title`).parent().find('.data-item');
      // this.selectedEl = selected;
      // selected.get(0)!.style.display = '';
    }
    //  else if (!isUndefined(selectedEl)) {
    //   selectedEl.get(0)!.style.display = '';
    // }
    console.log("aaaaIndex", this.selectedIndex)
    if (!isUndefined(this.selectedIndex)){
      const el = this.itemsEl?.children()[this.selectedIndex]
      console.log("aaaaEl", el)
      $(el).find('.data-item')?.css({ "display": '' });
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
    return this.target.children;
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
    e?.stopPropagation();
    e.preventDefault();
    this.selectedIndex = this.target.children.length
    this.target.add();
    
    // this.render();
  }

  private removeItem(e: any) {
    e?.stopPropagation();
    e.preventDefault();
    // const id = this.selectedEl?.attr('item-id') as any;
    this.selectedIndex && this.target.remove(this.selectedIndex);
    this.selectedIndex = undefined;
    // this.render();
  }

  renderToolbar() {
    if (!this.toolbarEl) {
      let el = document.createElement('div');
      el.append(document.createElement('button'));
      let tmpl = `<div class="">
      <button addButton> Add </button>
      <button removeButton> Remove </button>
    </div>`;
      this.toolbarEl = $(tmpl).get(0);
    }
    return this.toolbarEl!;
  }

  onItemRender(e: any) {}

  renderItem(trait: TraitElement) {
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

  renderItems(): JQuery<HTMLDivElement> {
    const {ppfx, type } = this;
    let itemsEl = document.createElement('div');
    this.children.forEach(trait => itemsEl.appendChild(this.renderItem(trait).get(0)!));
    console.log(this.itemsEl);
    itemsEl.className = `${ppfx}field-${type}-items`;

    return $(itemsEl);
  }

  render() {
    const { $el, pfx, ppfx, name, type, className } = this;
    const hasLabel = this.hasLabel();
    const cls = `${pfx}trait`;
    // var frag = document.createDocumentFragment();
    console.log('aaa', 'render');
    this.$el.empty();
    this.itemsEl = this.renderItems();

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
    dataInput.append(this.itemsEl.get(0)!);
    // ${this.renderToolbar()}
    // ${itemsEl}
    // console.log(frag);
    this.select();

    return this;
  }
}
