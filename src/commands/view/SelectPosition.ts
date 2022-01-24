import Backbone from 'backbone';
import CommandWrapper, { CommandAbstract } from './CommandAbstract';
const $ = Backbone.$;

export default class SelectPosition extends CommandAbstract {
  sorter: any;
  /**
   * Start select position event
   * @param {HTMLElement} trg
   * @private
   * */
  startSelectPosition(trg, doc, opts: any = {}) {
    this.isPointed = false;
    var utils = this.em.Utils;
    const container = trg.ownerDocument.body;

    if (utils && !this.sorter)
      this.sorter = new utils.Sorter({
        container,
        placer: this.canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: this.ppfx,
        direction: 'a',
        document: doc,
        wmargin: 1,
        nested: 1,
        em: this.em,
        canvasRelative: 1,
        scale: () => this.em.getZoomDecimal()
      });

    if (opts.onStart) this.sorter.onStart = opts.onStart;
    trg && this.sorter.startSort(trg, { container });
  }

  /**
   * Get frame position
   * @return {Object}
   * @private
   */
  /*getOffsetDim() {
    const { wrapper } = this;
    var frameOff = wrapper.offset(this.canvas.getFrameEl());
    var canvasOff = wrapper.offset(this.canvas.getElement());
    var top = frameOff.top - canvasOff.top;
    var left = frameOff.left - canvasOff.left;
    return { top, left };
  }*/

  /**
   * Stop select position event
   * @private
   * */
  stopSelectPosition() {
    this.posTargetCollection = null;
    this.posIndex =
      this.posMethod == 'after' && this.cDim.length !== 0
        ? this.posIndex + 1
        : this.posIndex; //Normalize
    if (this.sorter) {
      this.sorter.moved = 0;
      this.sorter.endMove();
    }
    /*if (this.cDim) {
      this.posIsLastEl =
        this.cDim.length !== 0 &&
        this.posMethod == 'after' &&
        this.posIndex == this.cDim.length;
      this.posTargetEl =
        this.cDim.length === 0
          ? $(this.outsideElem)
          : !this.posIsLastEl && this.cDim[this.posIndex]
          ? $(this.cDim[this.posIndex][5]).parent()
          : $(this.outsideElem);
      this.posTargetModel = this.posTargetEl.data('model');
      this.posTargetCollection = this.posTargetEl.data('model-comp');
    }*/
  }

  /**
   * Check if the pointer is near to the float component
   * @param {number} index
   * @param {string} method
   * @param {Array<Array>} dims
   * @return {Boolean}
   * @private
   * */
  /*nearFloat(index: null, method: string, dims) {
    var i = index || 0;
    var m = method || 'before';
    var len = dims.length;
    var isLast = len !== 0 && m == 'after' && i == len;
    if (
      len !== 0 &&
      ((!isLast && !dims[i][4]) ||
        (dims[i - 1] && !dims[i - 1][4]) ||
        (isLast && !dims[i - 1][4]))
    )
      return true;
    return false;
  }*/

  run() {
    this.startSelectPosition();
  }

  stop() {
    this.stopSelectPosition();
  }
};
