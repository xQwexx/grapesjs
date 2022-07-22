import { View, $ } from 'backbone';
import { isString } from 'underscore';
import TraitsModule from '..';
import { Collection } from '../../abstract';
import DomainViews from '../../domain_abstract/view/DomainViews';
import Component from '../../dom_components/model/Component';
import html from '../../utils/html';
import TraitFactory from '../model/TraitFactory';
import TraitInputView from './TraitInputView';
import TraitView from './TraitView';

export default class TraitsSectorView extends TraitView {
  get type() {
    return 'sector';
  }
  contains: any[];
  factory: TraitFactory;
  label?: string;
  open = true;
  name: string;

  component: Component;
  protected views: (TraitInputView | TraitsSectorView)[] = [];

  constructor(o: any = {}, factory: any) {
    super(o.module, o);
    console.log(this.module);
    console.log(this.pfx);
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    this.contains = o.contains;
    this.factory = factory;
    this.label = o.label;
    this.name = o.name;
    this.component = o.model;
    /*this.itemsView = itemsView;
        const config = o.config || {};*/

    //this.className = `${this.pfx}traits`;
    console.log(o);
    //this.listenTo(em, 'component:toggled', this.updatedCollection);
    //this.updatedCollection();
  }

  events() {
    return {
      'click [data-sector-title]': 'toggle',
    };
  }
  toggle(e: Event) {
    e.stopPropagation();
    const { open, name, pfx } = this;
    this.open = !this.open;
    const { $el } = this;
    //$el[open ? 'addClass' : 'removeClass'](`${pfx}open`);
    ($el.find(`#${pfx}properties-${name}`).get(0) as any).style.display = this.open ? '' : 'none';
  }

  template(pfx: string, label: string) {
    const icons = this.em?.getConfig().icons;
    const iconCaret = icons?.caret || '';
    const clsPfx = `${pfx}sector-`;

    return html`
      <div class="${clsPfx}title" data-sector-title>
        <div class="${clsPfx}caret">$${iconCaret}</div>
        <div class="${clsPfx}label">${label}</div>
      </div>
    `;
  }

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    //const { ppfx, className, em } = this;
    //const comp = em.getSelected();
    // this.el.className = `${className} ${ppfx}one-bg ${ppfx}two-color`;
    //this.collection = comp ? comp.get('traits') : [];
    this.render();
  }
  remove() {
    this.views.forEach(view => view.remove());
    super.remove();
    console.log('View is removed');
    return this;
  }
  protected renderList() {
    const { factory, component, $el, pfx, name } = this;
    var frag = $(`<div id="${pfx}properties-${name}" class="${pfx}properties">`);
    //this.clearItems();
    //this.$el.empty();
    console.log(this.contains);

    this.contains?.forEach(trait => {
      const view = factory.build(trait, component as any);
      this.views.push(view);
      console.log(trait);
      frag.append(view.render().el);
      console.log(view);
    });

    this.$el.append(frag);
  }

  render() {
    console.log('---------------RENDER THE LIST');
    console.log(this.pfx);
    const { $el, label, pfx } = this;
    const id = 'lkjadslf';
    //$el.empty();
    if (label) {
      $el.html(this.template(pfx, label));
      //this.renderProperties();
      $el.attr('class', `${pfx}sector ${pfx}sector__${id} no-select`);
    } else {
      $el.empty();
    }
    this.renderList();
    console.log('---------------RENDER THE LIST END');
    console.log($el);
    return this;
  }
}
