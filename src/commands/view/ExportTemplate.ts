import Backbone from 'backbone';
import Editor from 'editor';
import { CommandAbstract } from './CommandAbstract';
const $ = Backbone.$;

export default class ExportTemplate extends CommandAbstract {

  $editors?: JQuery<HTMLElement>;
  htmlEditor?: any;
  cssEditor?: any;
  codeMirror?: any;

  get cm() {return this.em.CodeManager}
  run(editor: Editor, sender: any, opts = {}) {
    sender && sender.set && sender.set('active', 0);
    const { pfx } = this;
    const config = editor.getConfig();
    const modal = editor.Modal;

    if (!this.$editors) {
      const oHtmlEd = this.buildEditor('htmlmixed', 'hopscotch', 'HTML');
      const oCsslEd = this.buildEditor('css', 'hopscotch', 'CSS');
      this.htmlEditor = oHtmlEd.el;
      this.cssEditor = oCsslEd.el;
      const $editors = $(`<div class="${pfx}export-dl"></div>`);
      $editors.append(oHtmlEd.$el).append(oCsslEd.$el);
      this.$editors = $editors;
    }

    modal
      .open({
        title: config.textViewCode,
        content: this.$editors
      })
      .getModel()
      .once('change:open', () => editor.stopCommand(this.id));
    this.htmlEditor?.setContent(editor.getHtml());
    this.cssEditor?.setContent(editor.getCss());
  }

  stop() {
    const modal = this.editor.Modal;
    modal && modal.close();
  }

  buildEditor(codeName: string, theme: string, label: string) {
    const input = document.createElement('textarea');
    !this.codeMirror && (this.codeMirror = this.cm.getViewer('CodeMirror'));

    const el = this.codeMirror.clone().set({
      label,
      codeName,
      theme,
      input
    });

    const $el = new this.cm.EditorView({
      model: el,
      config: this.cm.config
    } as any).render().$el;

    el.init(input);

    return { el, $el };
  }
};
