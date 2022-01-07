import { View } from 'backbone';
import DomainViews from 'domain_abstract/view/DomainViews';
import ToolbarButton from 'dom_components/model/ToolbarButton';
import ToolbarButtonView from './ToolbarButtonView';

export default class ToolbarView extends DomainViews<ToolbarButton>{
  getModelView(model: ToolbarButton): View<ToolbarButton, HTMLElement> {
    return new ToolbarButtonView(model)
  }

  constructor(collection: any, config: any) {
    super(config);
    this.config = config;//{ editor: opts.editor || '', em: opts.em };
    this.listenTo(this.collection, 'reset', this.render);
  }
};
