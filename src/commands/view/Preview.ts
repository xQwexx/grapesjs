import Editor from 'editor';
import { each } from 'underscore';
import { CommandAbstract } from './CommandAbstract';

const cmdVis = 'sw-visibility';

export default class Preview extends CommandAbstract {

  shouldRunSwVisibility?: boolean;
  helper?: any;
  selected?: any;
  sender: any;

  get panels() {return this.em.Panels.getPanels()}

  preventDrag(opts: any) {
    opts.abort = 1;
  }

  tglEffects(on: boolean) {
    const { em } = this;
    const mthEv = on ? 'on' : 'off';
    if (em) {
      const canvas = em.Canvas;
      const body = canvas.getBody();
      const tlb = canvas.getToolbarEl();
      tlb && (tlb.style.display = on ? 'none' : '');
      const elP = body?.querySelectorAll(`.${this.ppfx}no-pointer`);
      elP && each(elP, (item: any) => (item.style.pointerEvents = on ? 'all' : ''));
      em[mthEv]('run:tlb-move:before', this.preventDrag);
    }
  }

  run(editor: Editor, sender: any) {
    this.sender = sender;
    this.selected = [...editor.getSelectedAll()];
    editor.select();

    if (!this.shouldRunSwVisibility) {
      this.shouldRunSwVisibility = editor.Commands.isActive(cmdVis);
    }

    this.shouldRunSwVisibility && editor.stopCommand(cmdVis);
    editor.getModel().stopDefault();

    const canvas = editor.Canvas.getElement();
    const editorEl = editor.getEl();
    const pfx = editor.Config.stylePrefix;

    if (!this.helper) {
      const helper = document.createElement('span');
      helper.className = `${pfx}off-prv fa fa-eye-slash`;
      editorEl.appendChild(helper);
      helper.onclick = () => this.stopCommand();
      this.helper = helper;
    }

    this.helper.style.display = 'inline-block';

    this.panels.forEach(panel => panel.set('visible', false));

    const canvasS = canvas.style;
    canvasS.width = '100%';
    canvasS.height = '100%';
    canvasS.top = '0';
    canvasS.left = '0';
    canvasS.padding = '0';
    canvasS.margin = '0';
    editor.refresh();
    this.tglEffects(true);
  }

  stop() {
    const { editor, sender = {}, selected } = this;
    sender.set && sender.set('active', 0);

    if (this.shouldRunSwVisibility) {
      editor.runCommand(cmdVis);
      this.shouldRunSwVisibility = false;
    }

    editor.getModel().runDefault();
    this.panels.forEach(panel => panel.set('visible', true));

    const canvas = editor.Canvas.getElement();
    canvas.setAttribute('style', '');
    selected && editor.select(selected);
    delete this.selected;

    if (this.helper) {
      this.helper.style.display = 'none';
    }

    editor.refresh();
    this.tglEffects(false);
  }
};
