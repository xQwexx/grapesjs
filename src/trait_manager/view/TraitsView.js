import { View } from 'backbone';
import { isString } from 'underscore';
import { Collection } from '../../abstract';
import DomainViews from '../../domain_abstract/view/DomainViews';
import TraitInputView from './TraitInputView';

export default class TraitsView extends View {
  reuseView = true;

  constructor(o = {}, itemsView) {
    super(o);
    this.itemsView = itemsView;
    const config = o.config || {};
    const pfx = config.stylePrefix || '';
    const em = o.editor;
    this.config = config;
    this.em = em;
    this.pfx = pfx;
    this.ppfx = config.pStylePrefix || '';
    this.className = `${pfx}traits`;
    console.log(o);
    this.listenTo(em, 'component:toggled', this.updatedCollection);
    this.updatedCollection();
  }

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const { ppfx, className, em } = this;
    const comp = em.getSelected();
    this.el.className = `${className} ${ppfx}one-bg ${ppfx}two-color`;
    //this.collection = comp ? comp.get('traits') : [];
    this.render();
  }

  render() {
    console.log('---------------RENDER THE LIST');
    const { config } = this;
    console.log(this.el);
    var frag = document.createDocumentFragment();
    //this.clearItems();
    this.$el.empty();

    const component = this.em.getSelected();
    console.log(component?.get('traits'));
    const traits = component?.get('traits');
    traits?.forEach(trait => {
      trait = isString(trait) ? { name: trait } : trait;
      const type = trait.type || 'text';
      console.log('print one run');
      const view = new this.itemsView[type]({ ...trait, config, model: component });
      frag.appendChild(view.render().el);
    });

    this.$el.append(frag);
    //this.onRender();
    console.log('---------------RENDER THE LIST END');
    return this;
  }
}

TraitsView.prototype.itemView = TraitInputView;
