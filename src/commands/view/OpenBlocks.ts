import { isFunction } from 'underscore';
import { createEl } from '../../utils/dom';
import { CommandAbstract } from './CommandAbstract';

export default class OpenBlocks extends CommandAbstract {

  firstRender?: boolean;
  container?: HTMLElement;

  get bm() {return this.em.BlockManager}

  open() {
    const { container, editor, bm } = this;
    const { custom, appendTo } = bm.config;

    if (custom && isFunction(custom.open)) {
      return custom.open(bm.__customData());
    }

    if (this.firstRender && !appendTo) {
      const id = 'views-container';
      const pn = editor.Panels;
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      panels.set('appendContent', container).trigger('change:appendContent');
      if (!custom) container?.appendChild(bm.render());
    }

    if (container) container.style.display = 'block';
  }

  close() {
    const { container, bm } = this;
    const { custom } = bm.config;

    if (custom && isFunction(custom.close)) {
      return custom.close(bm.__customData());
    }

    if (container) container.style.display = 'none';
  }

  run() {
    const { bm } = this;
    this.firstRender = !this.container;
    this.container = this.container || createEl('div');
    const { container } = this;
    bm.__behaviour({
      container
    });

    if (bm.config.custom) {
      bm.__trgCustom();
    }

    this.open();
  }

  stop() {
    this.close();
  }
};
