import TraitsModule from '..';
import Component from '../../dom_components/model/Component';
import TraitsSectorView from '../view/TraitSectorView';
import Trait from './Trait';

export default class TraitFactory {
  config: any;
  module: TraitsModule;
  constructor(module: TraitsModule) {
    this.module = module;
  }
  /**
   * Build props object by their name
   */
  public build(props: any, target: Component) {
    const { module } = this;
    const { config } = module;
    const c = this.preprocess(props);
    console.log(target);
    let view;
    if (module.getTypes()[c.type]) {
      const PropType = module.getTypes()[c.type];
      console.log();
      //@ts-ignore
      const LinkType = PropType.TargetValueLink;
      const link = new LinkType(target, { ...c });
      console.log(link);
      view = new PropType(link, {
        ...c,
        module,
        model: target,
        ppfx: module.em.config.stylePrefix || '',
        id: target.attributes,
      });
    } else {
      view = new TraitsSectorView({ ...c, module, model: target }, this);
    }
    return view;
  }
  private preprocess(props: string | any) {
    if (typeof props === 'string') props = { name: props };

    switch (props.name) {
      case 'target':
        props.type = 'select';
        props.default = false;
        props.options = this.module.config.optionsTarget;
        break;
    }

    props.type = props.type || 'text';

    return props;
  }
}
