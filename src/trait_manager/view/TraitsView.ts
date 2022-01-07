import DomainViews from 'domain_abstract/view/DomainViews';
import EditorModel from 'editor/model/Editor';
import TraitManagerConfig from 'trait_manager/config/config';
import Trait from 'trait_manager/model/Trait';
import { includes } from 'underscore';
import TraitView from './TraitView';

const inputTypes = [
  'button',
  'checkbox',
  'color',
  'date',
  'datetime-local',
  'email',
  'file',
  'hidden',
  'image',
  'month',
  'number',
  'password',
  'radio',
  'range',
  'reset',
  'search',
  'submit',
  'tel',
  'text',
  'time',
  'url',
  'week'
];
export default class TraitsView extends DomainViews<Trait>{
  itemType: any;
  
  itemsViewLookup: {[id: string]: { new (model: Trait, config: any): TraitView }} = {};

  className: string;
  config: any;
  pfx: string;
  ppfx: string;
  //em: EditorModel;

  constructor(config: TraitManagerConfig, o = {}) {
    super(config);
    const pfx = config.stylePrefix || '';
    this.config = config;
    this.pfx = pfx;
    this.ppfx = config.pStylePrefix || '';
    this.className = `${pfx}traits`;
    this.listenTo(this.em, 'component:toggled', this.updatedCollection);
  }

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const { ppfx, className, em } = this;
    const comp = em.getSelected();
    this.el.className = `${className} ${ppfx}one-bg ${ppfx}two-color`;
    this.collection = comp ? comp.get('traits') : [];
    this.render();
  }
  itemViewNotFound(type: string) {
    const ns = 'Traits' 
    const { em } = this;
    const warn = `${ns ? `[${ns}]: ` : ''}'${type}' type not found`;
    em && em.logWarning(warn);
  }

  getModelView(model: Trait){
    
    const itemsView = this.itemsViewLookup;
    var typeField = model.get("type");
    let view;
    var itemView:{ new (model: Trait, config: any): TraitView } = TraitView;
    if (itemsView[typeField]) {
      itemView = itemsView[typeField];
    } else if (
      typeField &&
      !itemsView[typeField] &&
      !includes(inputTypes, typeField)
    ) {
      this.itemViewNotFound(typeField);
    }

    if (model.view) {
      view = model.view;
    } else {
      view = new itemView(model, this.config);
    }
    return view;
  }
};
