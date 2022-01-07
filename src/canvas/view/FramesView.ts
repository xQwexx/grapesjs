import { View, Model, ModelSetOptions } from 'backbone';
import Frame from 'canvas/model/Frame';
import DomainViews from 'domain_abstract/view/DomainViews';
import FrameWrapView from './FrameWrapView';

export default class FramesView extends DomainViews<Frame>{
  getModelView(model: Frame) {return new FrameWrapView(model)};
  autoAdd = true;

  init() {
    this.listenTo(this.collection, 'reset', this.render);
  }

  onRemoveBefore(items: View[], opts={}) {
    items.forEach(item => (item as FrameWrapView).remove(opts));
  }

  onRender() {
    const { config, $el } = this;
    const { em } = config;
    em && $el.attr({ class: `${em.getConfig().stylePrefix}frames` });
  }
};
