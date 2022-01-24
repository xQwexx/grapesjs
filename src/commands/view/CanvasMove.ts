import { bindAll } from 'underscore';
import { on, off, getKeyChar } from 'utils/mixins';
import Dragger from 'utils/Dragger';
import { CommandAbstract } from './CommandAbstract';

export default class CanvasMove extends CommandAbstract {
  dragger?: Dragger;

  run() {
    bindAll(this, 'onKeyUp', 'enableDragger', 'disableDragger');
    this.toggleMove(true);
  }
  stop() {
    this.toggleMove(false);
    this.disableDragger();
  }

  onKeyUp(ev: Event) {
    if (getKeyChar(ev) === ' ') {
      this.editor.stopCommand(this.id);
    }
  }

  enableDragger(ev: Event) {
    this.toggleDragger(true, ev);
  }

  disableDragger(ev?: Event) {
    this.toggleDragger(false, ev);
  }

  toggleDragger(enable: boolean, ev?: Event) {
    const { canvasElement, em } = this;
    let { dragger } = this;
    const methodCls = enable ? 'add' : 'remove';
    canvasElement.classList[methodCls](`${this.ppfx}is__grabbing`);
    const canvasModel = this.canvas.getCanvasView()?.model;
    if (!dragger) {
      dragger = new Dragger({
        getPosition() {
          return {
            x: canvasModel?.get('x'),
            y: canvasModel?.get('y')
          };
        },
        setPosition({ x, y }: {x: number, y: number}) {
          canvasModel?.set({ x, y });
        },
        onStart(ev: Event, dragger: Dragger) {
          em.trigger('canvas:move:start', dragger);
        },
        onDrag(ev: Event, dragger: Dragger) {
          em.trigger('canvas:move', dragger);
        },
        onEnd(ev: Event, dragger: Dragger) {
          em.trigger('canvas:move:end', dragger);
        }
      });
      this.dragger = dragger;
    }

    enable ? dragger.start(ev) : dragger.stop();
  }

  toggleMove(enable: boolean) {
    const { ppfx, canvasElement } = this;
    const methodCls = enable ? 'add' : 'remove';
    const methodEv = enable ? 'on' : 'off';
    const methodsEv = { on, off };
    const classes = [`${ppfx}is__grab`];
    !enable && classes.push(`${ppfx}is__grabbing`);
    classes.forEach(cls => canvasElement.classList[methodCls](cls));
    methodsEv[methodEv](document, 'keyup', this.onKeyUp);
    methodsEv[methodEv](canvasElement, 'mousedown', this.enableDragger);
    methodsEv[methodEv](document, 'mouseup', this.disableDragger);
  }
};
