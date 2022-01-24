import Frame from 'canvas/model/Frame';
import Frames from 'canvas/model/Frames';
import Editor from 'editor';
import EditorModel from 'editor/model/Editor';
import { bindAll } from 'underscore';
import CommandWrapper, { CommandAbstract, ICommand } from './CommandAbstract';

export default class SwitchVisibility extends CommandAbstract {
  constructor(wrapper: CommandWrapper) {
    super(wrapper)
    bindAll(this, '_onFramesChange');
  }

  run() {
    this.toggleVis(this.em, true);
  }
  

  stop() {
    this.toggleVis(this.em, false);
  }

  toggleVis(em: EditorModel, active: boolean) {
    if (!em.Commands.isActive('preview')) {
      const cv = em.Canvas;
      const mth = active ? 'on' : 'off';
      cv.getFrames().forEach(frame => this._upFrame(frame, active));
      cv.getModel()[mth]('change:frames', this._onFramesChange);
    }
  }

  _onFramesChange(m: any, frames: Frames) {
    frames.forEach(frame => this._upFrame(frame, true));
  }

  _upFrame(frame: Frame, active: boolean) {
    const method = active ? 'add' : 'remove';
    frame.view?.getBody()?.classList[method](`${this.ppfx}dashed`);
  }
};
