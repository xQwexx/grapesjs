import { debounce } from 'underscore';
import { Model } from '../common';
import defaults from './config/config';
import TraitsView from './view/TraitsView';
import TraitInputView from './view/TraitInputView';
import TraitSelectView from './view/TraitSelectView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitNumberView from './view/TraitNumberView';
import TraitColorView from './view/TraitColorView';
import TraitButtonView from './view/TraitButtonView';
import Module from '../abstract/Module';
import Component from '../dom_components/model/Component';
import EditorModel from '../editor/model/Editor';
import TraitsSectorView from './view/TraitSectorView';
import TraitFactory from './model/TraitFactory';
import TargetValueLink from './model/TargetValueLink';

export const evAll = 'trait';
export const evPfx = `${evAll}:`;
export const evCustom = `${evPfx}custom`;
const typesDef: { [id: string]: { new (link: TargetValueLink<any>, opts: any): TraitInputView<any> } } = {
  text: TraitInputView,
  number: TraitNumberView,
  select: TraitSelectView,
  checkbox: TraitCheckboxView,
  color: TraitColorView,
  button: TraitButtonView,
};

export default class TraitsModule extends Module<typeof defaults> {
  destroy(): void {}

  TraitsView = TraitsView;

  //@ts-ignore
  get events() {
    return {
      all: evAll,
      custom: evCustom,
    };
  }

  view?: TraitsSectorView;
  types: { [id: string]: { new (link: any, o: any): TraitInputView } };
  model: Model;
  __ctn?: any;

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'TraitManager', defaults);
    const model = new Model();
    this.model = model;
    this.types = typesDef;

    const upAll = debounce(() => this.__upSel(), 0);
    model.listenTo(em, 'component:toggled', upAll);

    const update = debounce(() => this.__onUp(), 0);
    model.listenTo(em, 'trait:update', update);

    return this;
  }

  private __upSel() {
    this.select(this.em.getSelected());
  }

  private __onUp() {
    this.select(this.getSelected());
  }

  select(component?: Component) {
    const traits = component ? component.getTraits() : [];
    this.model.set({ component, traits });
    this.__trgCustom();
  }

  getSelected() {
    return this.model.get('component') || null;
  }

  getCurrent() {
    return this.model.get('traits') || [];
  }

  __trgCustom(opts: any = {}) {
    this.__ctn = this.__ctn || opts.container;
    this.em.trigger(this.events.custom, { container: this.__ctn });
  }

  postRender() {
    this.__appendTo();
  }

  /**
   *
   * Get Traits viewer
   * @private
   */
  getTraitsViewer() {
    return this.view;
  }

  /**
   * Add new trait type
   * @param {string} name Type name
   * @param {Object} methods Object representing the trait
   */
  addType(name: string, trait: any) {
    const baseView = this.getType('text');
    //@ts-ignore
    this.types[name] = baseView.extend(trait);
  }

  /**
   * Get trait type
   * @param {string} name Type name
   * @return {Object}
   */
  getType(name: string) {
    return this.getTypes()[name];
  }

  /**
   * Get all trait types
   * @returns {Object}
   */
  getTypes() {
    return this.types;
  }

  render() {
    let { view, config } = this;
    const el = view && view.el;
    console.log('Render start !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log(this);
    const component = this.em.getSelected();
    const traits = component?.get('traits');

    //this.em.off( 'component:toggled', this.render, this);
    view?.remove();
    view = new TraitsSectorView(
      {
        el,
        type: 'sector',
        em: this.em,
        module: this,
        config,
        model: component,
        contains: traits,
      },
      new TraitFactory(this)
    ).render();
    this.em.on('traits:updated', this.render, this);
    //this.em.on( 'component:toggled', this.render, this);
    console.log(view.el);
    console.log(component);
    this.view = view;
    return view.el;
  }
}
