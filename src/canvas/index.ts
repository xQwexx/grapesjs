/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/canvas/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  canvas: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const canvas = editor.Canvas;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [getElement](#getelement)
 * * [getFrameEl](#getframeel)
 * * [getWindow](#getwindow)
 * * [getDocument](#getdocument)
 * * [getBody](#getbody)
 * * [setCustomBadgeLabel](#setcustombadgelabel)
 * * [hasFocus](#hasfocus)
 * * [scrollTo](#scrollto)
 * * [setZoom](#setzoom)
 * * [getZoom](#getzoom)
 * * [getCoords](#getcoords)
 * * [setCoords](#setcoords)
 *
 * [Component]: component.html
 * [Frame]: frame.html
 *
 * @module Canvas
 */

 import { Module } from "common/module";
 import Component from "dom_components/model/Component";
 import EditorModel from "editor/model/Editor";
 import config from "plugin_manager/config/config";
 import { isUndefined } from "underscore";
 import { getElement, getViewEl } from "utils/mixins";
 import CanvasConfig from "./config/config";
 import Canvas from "./model/Canvas";
 import Frame from "./model/Frame";
 import CanvasView from "./view/CanvasView";
 
 export default class CanvasModule extends Module<CanvasConfig> {
   constructor(em: EditorModel) {
     super(em, CanvasConfig);
 
     this.canvas = new Canvas(this.config);
     this.model = this.canvas;
     this.startAutoscroll = this.startAutoscroll.bind(this);
     this.stopAutoscroll = this.stopAutoscroll.bind(this);
   }
 
   canvas: Canvas;
   CanvasView?: CanvasView;
   model: any;
   getCanvasView() {
     return this.CanvasView;
   }
 
   /**
    * Initialize module. Automatically called with a new instance of the editor
    * @param {Object} config Configurations
    * @private
    */
   init(config = {}) {
     return this;
   }
 
   onLoad() {
     this.model.onLoad();
   }
 
   getModel() {
     return this.canvas;
   }
 
   /**
    * Get the canvas element
    * @returns {HTMLElement}
    */
   getElement(): HTMLElement {
     return this.CanvasView?.el ?? new HTMLElement();
   }
 
   getFrame(index?: number) {
     return this.getFrames()[index || 0];
   }
 
   /**
    * Get the main frame element of the canvas
    * @returns {HTMLIFrameElement}
    */
   getFrameEl() {
     const { frame } = this.CanvasView || {};
     return frame && frame.el;
   }
 
   getFramesEl() {
     return this.CanvasView?.framesArea;
   }
 
   /**
    * Get the main frame window instance
    * @returns {Window}
    */
   getWindow() {
     return this.getFrameEl()?.contentWindow ?? undefined;
   }
 
   /**
    * Get the main frame document element
    * @returns {HTMLDocument}
    */
   getDocument() {
     const frame = this.getFrameEl();
     return frame && frame.contentDocument;
   }
 
   /**
    * Get the main frame body element
    * @return {HTMLBodyElement}
    */
   getBody() {
     const doc = this.getDocument();
     return doc && doc.body;
   }
 
   _getCompFrame(compView: any) {
     return compView && compView._getFrame();
   }
 
   _getLocalEl(globalEl: any, compView: any, method: any): HTMLElement {
     let result = globalEl;
     const frameView = this._getCompFrame(compView);
     result = frameView ? frameView[method]() : result;
 
     return result;
   }
 
   /**
    * Returns element containing all global canvas tools
    * @returns {HTMLElement}
    * @private
    */
   getGlobalToolsEl() {
     return (this.CanvasView?.toolsGlobEl ?? undefined) as
       | HTMLElement
       | undefined;
   }
 
   /**
    * Returns element containing all canvas tools
    * @returns {HTMLElement}
    * @private
    */
   getToolsEl(compView?: any) {
     return this._getLocalEl(this.CanvasView?.toolsEl, compView, "getToolsEl");
   }
 
   /**
    * Returns highlighter element
    * @returns {HTMLElement}
    * @private
    */
   getHighlighter(compView: any) {
     return this._getLocalEl(this.CanvasView?.hlEl, compView, "getHighlighter");
   }
 
   /**
    * Returns badge element
    * @returns {HTMLElement}
    * @private
    */
   getBadgeEl(compView: any) {
     return this._getLocalEl(this.CanvasView?.badgeEl, compView, "getBadgeEl");
   }
 
   /**
    * Returns placer element
    * @returns {HTMLElement}
    * @private
    */
   getPlacerEl() {
     return this.CanvasView?.placerEl;
   }
 
   /**
    * Returns ghost element
    * @returns {HTMLElement}
    * @private
    */
   getGhostEl() {
     return this.CanvasView?.ghostEl;
   }
 
   /**
    * Returns toolbar element
    * @returns {HTMLElement}
    * @private
    */
   getToolbarEl(): HTMLElement| null {
     return this.CanvasView?.toolbarEl ?? null;
   }
 
   /**
    * Returns resizer element
    * @returns {HTMLElement}
    * @private
    */
   getResizerEl() {
     return this.CanvasView?.resizerEl;
   }
 
   /**
    * Returns offset viewer element
    * @returns {HTMLElement}
    * @private
    */
   getOffsetViewerEl(compView: any) {
     return this._getLocalEl(
       this.CanvasView?.offsetEl,
       compView,
       "getOffsetViewerEl"
     );
   }
 
   /**
    * Returns fixed offset viewer element
    * @returns {HTMLElement}
    * @private
    */
   getFixedOffsetViewerEl() {
     return this.CanvasView?.fixedOffsetEl;
   }
 
   render() {
     this.CanvasView?.remove();
     this.CanvasView = new CanvasView(this, this.canvas);
     return this.CanvasView?.render().el;
   }
 
   /**
    * Get frame position
    * @returns {Object}
    * @private
    */
   getOffset() {
     var frameOff = this.offset(this.getFrameEl());
     var canvasOff = this.offset(this.getElement());
     return {
       top: frameOff.top - canvasOff.top,
       left: frameOff.left - canvasOff.left
     };
   }
 
   /**
    * Get the offset of the passed component element
    * @param  {HTMLElement} el
    * @returns {Object}
    * @private
    */
   offset(el?: HTMLElement) {
     const def = {
       top: 0,
       left: 0,
       width: 0,
       height: 0
     };
     return this.CanvasView?.offset(el) ?? def;
   }
 
   /**
    * Set custom badge naming strategy
    * @param  {Function} f
    * @example
    * canvas.setCustomBadgeLabel(function(component){
    *  return component.getName();
    * });
    */
   setCustomBadgeLabel(f: any) {
     this.config.customBadgeLabel = f;
   }
 
   /**
    * Get element position relative to the canvas
    * @param {HTMLElement} el
    * @returns {Object}
    * @private
    */
   getElementPos(el: HTMLElement, opts?: any) {
     return this.CanvasView?.getElementPos(el, opts);
   }
 
   /**
    * Returns element's offsets like margins and paddings
    * @param {HTMLElement} el
    * @returns {Object}
    * @private
    */
   getElementOffsets(el: HTMLElement) {
     return this.CanvasView?.getElementOffsets(el);
   }
 
   /**
    * Get canvas rectangular data
    * @returns {Object}
    */
   getRect() {
     const { top, left } = this.CanvasView?.getPosition() ?? {};
     return {
       ...this.CanvasView?.getCanvasOffset(),
       topScroll: top,
       leftScroll: left
     };
   }
 
   /**
    * This method comes handy when you need to attach something like toolbars
    * to elements inside the canvas, dealing with all relative position,
    * offsets, etc. and returning as result the object with positions which are
    * viewable by the user (when the canvas is scrolled the top edge of the element
    * is not viewable by the user anymore so the new top edge is the one of the canvas)
    *
    * The target should be visible before being passed here as invisible elements
    * return empty string as width
    * @param {HTMLElement} target The target in this case could be the toolbar
    * @param {HTMLElement} element The element on which I'd attach the toolbar
    * @param {Object} options Custom options
    * @param {Boolean} options.toRight Set to true if you want the toolbar attached to the right
    * @return {Object}
    * @private
    */
   getTargetToElementDim(
     target: HTMLElement,
     element: HTMLElement,
     options: any = {}
   ) {
     var opts = options || {};
     var canvasPos = this.CanvasView?.getPosition();
     if (!canvasPos) return;
     var pos = opts.elPos || this.CanvasView?.getElementPos(element);
     var toRight = options.toRight || 0;
     var targetHeight = opts.targetHeight || target.offsetHeight;
     var targetWidth = opts.targetWidth || target.offsetWidth;
     var eventToTrigger = opts.event || null;
 
     var elTop = pos.top - targetHeight;
     var elLeft = pos.left;
     elLeft += toRight ? pos.width : 0;
     elLeft = toRight ? elLeft - targetWidth : elLeft;
 
     var leftPos = elLeft < canvasPos.left ? canvasPos.left : elLeft;
     var topPos = elTop < canvasPos.top ? canvasPos.top : elTop;
     topPos = topPos > pos.top + pos.height ? pos.top + pos.height : topPos;
 
     var result = {
       top: topPos,
       left: leftPos,
       elementTop: pos.top,
       elementLeft: pos.left,
       elementWidth: pos.width,
       elementHeight: pos.height,
       targetWidth: target.offsetWidth,
       targetHeight: target.offsetHeight,
       canvasTop: canvasPos.top,
       canvasLeft: canvasPos.left,
       canvasWidth: canvasPos.width,
       canvasHeight: canvasPos.height
     };
 
     // In this way I can catch data and also change the position strategy
     if (eventToTrigger) {
       this.em?.trigger(eventToTrigger, result);
     }
 
     return result;
   }
 
   canvasRectOffset(el: HTMLElement, pos: any, opts: any = {}) {
     const getFrameElFromDoc = (doc: Document): HTMLElement => {
       return (doc.defaultView?.frameElement ?? {}) as HTMLElement;
     };
 
     const rectOff = (el: HTMLElement, top = 1, pos: any) => {
       const zoom = this.em.getZoomDecimal();
       const side = top ? "top" : "left";
       const doc = el.ownerDocument;
       const { offsetTop = 0, offsetLeft = 0 } = opts.offset
         ? getFrameElFromDoc(doc)
         : {};
       const { scrollTop = 0, scrollLeft = 0 } = doc.body || {};
       const scroll = top ? scrollTop : scrollLeft;
       const offset = top ? offsetTop : offsetLeft;
 
       // if (!top) {
       //   console.log('LEFT', { posLeft: pos[side], scroll, offset } el);
       // }
 
       return pos[side] - (scroll - offset) * zoom;
     };
 
     return {
       top: rectOff(el, 1, pos),
       left: rectOff(el, 0, pos)
     };
   }
 
   getTargetToElementFixed(
     el: HTMLElement,
     elToMove: HTMLElement,
     opts: any = {}
   ) {
     const pos = opts.pos || this.getElementPos(el);
     const cvOff = opts.canvasOff || this.canvasRectOffset(el, pos);
     const toolbarH = elToMove.offsetHeight || 0;
     const toolbarW = elToMove.offsetWidth || 0;
     const elRight = pos.left + pos.width;
     const cv = this.getCanvasView();
     const frCvOff = cv?.getPosition();
     const frameOffset = cv?.getFrameOffset(el);
     const { event } = opts;
 
     let top = -toolbarH;
     let left: number = !isUndefined(opts.left)
       ? opts.left
       : pos.width - toolbarW;
     left = pos.left < -left ? -pos.left : left;
     left =
       frCvOff && elRight > frCvOff.width
         ? left - (elRight - frCvOff.width)
         : left;
 
     // Scroll with the window if the top edge is reached and the
     // element is bigger than the canvas
     const fullHeight = pos.height + toolbarH;
     const elIsShort = frameOffset && fullHeight < frameOffset.height;
 
     if (cvOff.top < toolbarH) {
       if (elIsShort) {
         top = top + fullHeight;
       } else {
         top = -cvOff.top < pos.height ? -cvOff.top : pos.height;
       }
     }
 
     const result = {
       top,
       left,
       canvasOffsetTop: cvOff.top,
       canvasOffsetLeft: cvOff.left
     };
 
     // In this way I can catch data and also change the position strategy
     event && this.em.trigger(event, result);
 
     return result;
   }
 
   /**
    * Instead of simply returning e.clientX and e.clientY this function
    * calculates also the offset based on the canvas. This is helpful when you
    * need to get X and Y position while moving between the editor area and
    * canvas area, which is in the iframe
    * @param {Event} e
    * @return {Object}
    * @private
    */
   getMouseRelativePos(e: any, options: any) {
     var opts = options || {};
     var addTop = 0;
     var addLeft = 0;
     var subWinOffset = opts.subWinOffset;
     var doc = e.target.ownerDocument;
     var win = doc.defaultView || doc.parentWindow;
     var frame = win.frameElement;
     var yOffset = subWinOffset ? win.pageYOffset : 0;
     var xOffset = subWinOffset ? win.pageXOffset : 0;
 
     if (frame) {
       var frameRect = frame.getBoundingClientRect();
       addTop = frameRect.top || 0;
       addLeft = frameRect.left || 0;
     }
 
     return {
       y: e.clientY + addTop - yOffset,
       x: e.clientX + addLeft - xOffset
     };
   }
 
   /**
    * X and Y mouse position relative to the canvas
    * @param {Event} ev
    * @return {Object}
    * @private
    */
   getMouseRelativeCanvas(ev: any, opts?: any) {
     const zoom = this.getZoomDecimal();
     const { top, left } = this.CanvasView?.getPosition(opts) ?? {};
 
     return {
       y: ev.clientY * zoom + (top ?? 0),
       x: ev.clientX * zoom + (left ?? 0)
     };
   }
 
   /**
    * Check if the canvas is focused
    * @returns {Boolean}
    */
   hasFocus() {
     return this.getDocument()?.hasFocus() ?? false;
   }
 
   /**
    * Detects if some input is focused (input elements, text components, etc.)
    * @return {Boolean}
    * @private
    */
   isInputFocused() {
     const doc = this.getDocument();
     const frame = this.getFrameEl();
     const toIgnore = ["body", ...this.getConfig().notTextable];
     const docActive = frame && document.activeElement === frame;
     const focused = docActive ? doc?.activeElement : document.activeElement;
 
     return (focused && !toIgnore.some(item => focused.matches(item))) || false;
   }
 
   /**
    * Scroll canvas to the element if it's not visible. The scrolling is
    * executed via `scrollIntoView` API and options of this method are
    * passed to it. For instance, you can scroll smoothly by using
    * `{ behavior: 'smooth' }`.
    * @param  {HTMLElement|[Component]} el
    * @param  {Object} [opts={}] Options, same as options for `scrollIntoView`
    * @param  {Boolean} [opts.force=false] Force the scroll, even if the element is already visible
    * @example
    * const selected = editor.getSelected();
    * // Scroll smoothly (this behavior can be polyfilled)
    * canvas.scrollTo(selected, { behavior: 'smooth' });
    * // Force the scroll, even if the element is alredy visible
    * canvas.scrollTo(selected, { force: true });
    */
   scrollTo(el: HTMLElement | Component, opts = {}) {
     const elem = getElement(el);
     const view = elem && getViewEl(elem);
     view?.scrollIntoView(opts);
   }
 
   /**
    * Start autoscroll
    * @private
    */
   startAutoscroll(frame?: Frame) {
     const fr = (frame && frame.view) || this.em.getCurrentFrame();
     fr && fr.startAutoscroll();
   }
 
   /**
    * Stop autoscroll
    * @private
    */
   stopAutoscroll(frame?: Frame) {
     const fr = (frame && frame.view) || this.em.getCurrentFrame();
     fr && fr.stopAutoscroll();
   }
 
   /**
    * Set canvas zoom value
    * @param {Number} value The zoom value, from 0 to 100
    * @returns {this}
    * @example
    * canvas.setZoom(50); // set zoom to 50%
    */
   setZoom(value: string) {
     this.canvas.set("zoom", parseFloat(value));
     return this;
   }
 
   /**
    * Get canvas zoom value
    * @returns {Number}
    * @example
    * canvas.setZoom(50); // set zoom to 50%
    * const zoom = canvas.getZoom(); // 50
    */
   getZoom() {
     return parseFloat(this.canvas.get("zoom"));
   }
 
   /**
    * Set canvas position coordinates
    * @param {Number} x Horizontal position
    * @param {Number} y Vertical position
    * @returns {this}
    * @example
    * canvas.setCoords(100, 100);
    */
   setCoords(x: string, y: string) {
     this.canvas.set({ x: parseFloat(x), y: parseFloat(y) });
     return this;
   }
 
   /**
    * Get canvas position coordinates
    * @returns {Object} Object containing coordinates
    * @example
    * canvas.setCoords(100, 100);
    * const coords = canvas.getCoords();
    * // { x: 100, y: 100 }
    */
   getCoords() {
     const { x, y } = this.canvas.attributes;
     return { x, y };
   }
 
   getZoomDecimal() {
     return this.getZoom() / 100;
   }
 
   getZoomMultiplier() {
     const zoom = this.getZoomDecimal();
     return zoom ? 1 / zoom : 1;
   }
 
   toggleFramesEvents(on: boolean = false) {
     if (this.getFramesEl()) {
       const { style } = this.getFramesEl() as HTMLElement;
       style.pointerEvents = on ? "" : "none";
     }
   }
 
   getFrames() {
     return this.canvas.frames.map(item => item);
   }
 
   /**
    * Add new frame to the canvas
    * @param {Object} props Frame properties
    * @returns {[Frame]}
    * @example
    * canvas.addFrame({
    *   name: 'Mobile home page',
    *   x: 100, // Position in canvas
    *   y: 100,
    *   width: 500, // Frame dimensions
    *   height: 600,
    *   // device: 'DEVICE-ID',
    *   components: [
    *     '<h1 class="testh">Title frame</h1>',
    *     '<p class="testp">Paragraph frame</p>',
    *   ],
    *   styles: `
    *     .testh { color: red; }
    *     .testp { color: blue; }
    *   `,
    * });
    */
   addFrame(props = {}, opts = {}): Frame | Frame[] {
     return this.canvas.frames.add(
       new Frame(
         {
           ...props
         },
         {
           ...opts,
           em: this.em
         }
       )
     );
   }
 
   destroy() {
     this.canvas.stopListening();
     this.CanvasView?.remove();
     [this.config, this.canvas, this.CanvasView].forEach(i => (i = undefined));
     //@ts-ignore
     ["model", "droppable"].forEach(i => (this[i] = {}));
   }
 }