import DomainViews from '../../domain_abstract/view/DomainViews';
import TraitView from './TraitView';

export default class TraitsView extends DomainViews {
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
    this.listenTo(em, 'component:toggled', this.updatedCollection);
    this.updatedCollection();
  }

  /**
   * Update view collection
   * @private
   */
  updatedCollection(traits = []) {
    const { ppfx, className } = this;
    this.el.className = `${className} ${ppfx}one-bg ${ppfx}two-color`;
    this.collection = traits ?? [];
    this.render();
  }
}

TraitView.prototype.itemView = TraitView;
