import Backbone from 'backbone';
import Editor from 'editor';
import EditorModel from 'editor/model/Editor';
import CommandWrapper, { CommandAbstract, ICommand } from './CommandAbstract';
const $ = Backbone.$;

export default class OpenStyleManager extends CommandAbstract {
  target?: EditorModel;
  sender: any;
  $cn?: JQuery<HTMLElement>;
  $cn2?: JQuery<HTMLElement>;
  $header?: JQuery<HTMLElement>;

  run(editor: Editor, sender: any) {
    this.sender = sender;
    const em = this.em

    if (!this.$cn) {
      const config = em.getConfig();
      const panels = em.Panels;
      const trgEvCnt = 'change:appendContent';
      this.$cn = $('<div></div>');
      this.$cn2 = $('<div></div>');
      this.$cn.append(this.$cn2);

      // Device Manager
      const dvm = em.DeviceManager;
      if (dvm && config.showDevices) {
        const devicePanel = panels.addPanel({ id: 'devices-c' });
        const dvEl = dvm.render();
        devicePanel.set('appendContent', dvEl).trigger(trgEvCnt);
      }

      // Selector Manager container
      const slm = em.SelectorManager;
      const slmConfig = slm.getConfig();
      if (slmConfig.custom) {
        slm.__trgCustom({ container: this.$cn2.get(0) });
      } else if (!slmConfig.appendTo) {
        this.$cn2.append(slm.render([]));
      }

      // Style Manager
      const sm = em.StyleManager;
      const smConfig = sm.getConfig();
      if (!smConfig.appendTo) {
        this.$cn2.append(sm.render());
        const pfx = smConfig.pfx;
        this.$header = $(
          `<div class="${pfx}header">${em.t('styleManager.empty')}</div>`
        );
        this.$cn.append(this.$header);
      }

      // Create panel if not exists
      const pnCnt = 'views-container';
      let panel = panels.getPanel(pnCnt);
      if (!panel) panel = panels.addPanel({ id: pnCnt });

      // Add all containers to the panel
      panel.set('appendContent', this.$cn).trigger(trgEvCnt);

      this.target = em;
      this.wrapper.listenTo(this.target, 'component:toggled', this.toggleSm);
    }

    this.toggleSm();
  }

  /**
   * Toggle Style Manager visibility
   * @private
   */
  toggleSm() {
    const { target, sender } = this;
    if (target){
      if (sender && sender.get && !sender.get('active')) return;
      const { componentFirst } = target.SelectorManager.getConfig();
      const selectedAll = target.getSelectedAll().length;

      if (selectedAll === 1 || (selectedAll > 1 && componentFirst)) {
        this.$cn2 && this.$cn2.show();
        this.$header && this.$header.hide();
      } else {
        this.$cn2 && this.$cn2.hide();
        this.$header && this.$header.show();
      }
    }

  }

  stop() {
    this.$cn2 && this.$cn2.hide();
    this.$header && this.$header.hide();
  }
};
