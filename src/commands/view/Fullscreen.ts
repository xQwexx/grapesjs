import Editor from 'editor';
import { isElement } from 'underscore';
import { CommandAbstract } from './CommandAbstract';

export default class Fullscreen extends CommandAbstract {
  sender: any;
  /**
   * Check if fullscreen mode is enabled
   * @return {Boolean}
   */
  isEnabled() {
    var d: any = document;
    if (
      d.fullscreenElement ||
      d.webkitFullscreenElement ||
      d.mozFullScreenElement
    )
      return true;
    else return false;
  }

  /**
   * Enable fullscreen mode and return browser prefix
   * @param  {HTMLElement} el
   * @return {string}
   */
  enable(el: any) {
    var pfx = '';
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) {
      pfx = 'webkit';
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      pfx = 'moz';
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) el.msRequestFullscreen();
    else console.warn('Fullscreen not supported');
    return pfx;
  }

  /**
   * Disable fullscreen mode
   */
  disable() {
    const d: any = document;
    if (this.isEnabled()) {
      if (d.exitFullscreen) d.exitFullscreen();
      else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
      else if (d.mozCancelFullScreen) d.mozCancelFullScreen();
      else if (d.msExitFullscreen) d.msExitFullscreen();
    }
  }

  /**
   * Triggered when the state of the fullscreen is changed. Inside detects if
   * it's enabled
   * @param  {strinf} pfx Browser prefix
   * @param  {Event} e
   */
  fsChanged(pfx: string) {
    var d = document;
    var ev = (pfx || '') + 'fullscreenchange';
    if (!this.isEnabled()) {
      this.stop(null, this.sender);
      //@ts-ignore
      document.removeEventListener(ev, this.fsChanged);
    }
  }

  run(editor: Editor, sender: any, opts: any = {}) {
    this.sender = sender;
    const { target } = opts;
    const targetEl = isElement(target)
      ? target
      : document.querySelector(target);
    const pfx = this.enable(targetEl || editor.getContainer());
    this.fsChanged = this.fsChanged.bind(this, pfx);
    //@ts-ignore
    document.addEventListener(pfx + 'fullscreenchange', this.fsChanged);
    editor.trigger('change:canvasOffset');
  }

  stop(editor: any, sender: any) {
    if (sender && sender.set) sender.set('active', false);
    this.disable();
    this.editor.trigger('change:canvasOffset');
  }
};
