import Backbone from 'backbone';
import Editor from 'editor';
import EditorModel from 'editor/model/Editor';
import CommandWrapper, { CommandAbstract, ICommand } from './CommandAbstract';

const $ = Backbone.$;

export default class OpenTraitManager extends CommandAbstract{
  target?: EditorModel;
  sender: any;
  $cn?: JQuery<HTMLElement>;
  $cn2?: JQuery<HTMLElement>;
  $header?: JQuery<HTMLElement>;

  run(ed: Editor, sender: any) {
    this.sender = sender;
    const em = this.em;

    const pfx = this.pfx;
    const tm = em.TraitManager;
    const confTm = tm.getConfig();

    if (confTm.appendTo) return;

    if (!this.$cn) {
      this.$cn = $('<div></div>');
      this.$cn2 = $('<div></div>');
      this.$cn.append(this.$cn2);
      this.$header = $('<div>').append(
        `<div class="${confTm.stylePrefix}header">${em.t(
          'traitManager.empty'
        )}</div>`
      );
      this.$cn.append(this.$header);
      this.$cn2.append(
        `<div class="${pfx}traits-label">${em.t('traitManager.label')}</div>`
      );
      this.$cn2.append(tm.render());
      var panels = em.Panels;

      const panelC = panels.getPanel('views-container') ?? panels.addPanel({ id: 'views-container' });

      panelC
        .set('appendContent', this.$cn.get(0))
        .trigger('change:appendContent');

      this.target = em;
      this.wrapper.listenTo(this.target, 'component:toggled', this.toggleTm);
    }

    this.toggleTm();
  }

  /**
   * Toggle Trait Manager visibility
   * @private
   */
  toggleTm() {
    const sender = this.sender;
    if (sender && sender.get && !sender.get('active')) return;

    if (this.target?.getSelectedAll().length === 1) {
      this.$cn2?.show();
      this.$header?.hide();
    } else {
      this.$cn2?.hide();
      this.$header?.show();
    }
  }

  stop() {
    this.$cn2 && this.$cn2.hide();
    this.$header && this.$header.hide();
  }
};
