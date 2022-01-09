import Backbone from "backbone";
import { bindAll, isString, debounce, isUndefined } from "underscore";
import CssRulesView from "css_composer/view/CssRulesView";
import ComponentView from "dom_components/view/ComponentView";
import Droppable from "utils/Droppable";
import {
  appendVNodes,
  empty,
  append,
  createEl,
  createCustomEvent,
  motionsEv
} from "utils/dom";
import { on, off, setViewEl, hasDnd, getPointerEvent } from "utils/mixins";
import Frame from "canvas/model/Frame";
import EditorModel from "editor/model/Editor";
import { scriptIncludeAttr, styleIncludeAttr } from "canvas/model/Canvas";
import View from "common/View";
import CanvasConfig from "canvas/config/config";
import CanvasModule from "canvas";
import { Module } from "common/module";
import FrameWrapView from "./FrameWrapView";

interface styleLinkAttr {
  tag: string;
  attributes: {
    rel: string;
    href: string;
  };
}
export default class FrameView extends View<Frame, HTMLIFrameElement> {
  tagName = "iframe";

  attributes = {
    allowfullscreen: "allowfullscreen",
    "data-frame-el": true
  };
  dragging = false;
  jsContainer: any;
  wrapper?: any;
  droppable?: Droppable | false;
  rect?: DOMRect;
  tools: { [id: string]: any } = {};
  frameWrapView: FrameWrapView;
  lastClientY?: number;
  lastMaxHeight = 0;

  get config() {
    return this.module.config as CanvasConfig;
  }

  constructor(module: Module, model: Frame, frameWrapView: FrameWrapView) {
    super(module, model);
    bindAll(
      this,
      "updateClientY",
      "stopAutoscroll",
      "autoscroll",
      "_emitUpdate"
    );
    this.frameWrapView = frameWrapView;
    const cvModel = this.getCanvasModel();
    this.listenTo(model, "change:head", this.updateHead);
    this.listenTo(cvModel, "change:styles", this.renderStyles);
    model.view = this;
    setViewEl(this.el, this);
  }

  /**
   * Update `<head>` content of the frame
   */
  updateHead() {
    const { model } = this;
    const headEl = this.getHead();
    const toRemove: any[] = [];
    const toAdd: any[] = [];
    const current: any[] = model.get("head");
    const prev: any[] = model.previous("head");
    const attrStr = (attr: { [id: string]: any } = {}) =>
      Object.keys(attr)
        .sort()
        .map(i => `[${i}="${attr[i]}"]`)
        .join("");
    const find = (items: any[], stack: any[], res: any[]) => {
      items.forEach(item => {
        const { tag, attributes } = item;
        const has = stack.some(
          s => s.tag === tag && attrStr(s.attributes) === attrStr(attributes)
        );
        !has && res.push(item);
      });
    };
    find(current, prev, toAdd);
    find(prev, current, toRemove);
    toRemove.forEach(stl => {
      const el = headEl?.querySelector(`${stl.tag}${attrStr(stl.attributes)}`);
      el?.parentNode?.removeChild(el);
    });
    headEl && appendVNodes(headEl, toAdd);
  }

  getEl() {
    return this.el;
  }

  getCanvasModel() {
    return this.em.Canvas.getModel();
  }

  getWindow() {
    return this.getEl().contentWindow;
  }

  getDoc() {
    return this.getEl().contentDocument;
  }

  getHead() {
    return this.getDoc()?.querySelector("head");
  }

  getBody() {
    return this.getDoc()?.querySelector("body");
  }

  getWrapper() {
    return this.getBody()?.querySelector(
      "[data-gjs-type=wrapper]"
    ) as HTMLElement;
  }

  getJsContainer() {
    if (!this.jsContainer) {
      this.jsContainer = createEl("div", { class: `${this.ppfx}js-cont` });
    }

    return this.jsContainer;
  }

  getToolsEl() {
    return this.frameWrapView.elTools;
  }

  getGlobalToolsEl() {
    return this.em.Canvas.getGlobalToolsEl();
  }

  getHighlighter() {
    return this._getTool("[data-hl]");
  }

  getBadgeEl() {
    return this._getTool("[data-badge]");
  }

  getOffsetViewerEl() {
    return this._getTool("[data-offset]");
  }

  getRect() {
    if (!this.rect) {
      this.rect = this.el.getBoundingClientRect();
    }

    return this.rect;
  }

  /**
   * Get rect data, not affected by the canvas zoom
   */
  getOffsetRect() {
    const { el } = this;
    const { scrollTop = 0, scrollLeft = 0 } = this.getBody() ?? {};
    const height = el.offsetHeight;
    const width = el.offsetWidth;

    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      height,
      width,
      scrollTop,
      scrollLeft,
      scrollBottom: scrollTop + height,
      scrollRight: scrollLeft + width
    };
  }

  _getTool(name: string) {
    const { tools } = this;
    const toolsEl = this.getToolsEl();

    if (!tools[name]) {
      tools[name] = toolsEl?.querySelector(name);
    }

    return tools[name];
  }

  remove(arg?: any) {
    const wrp = this.wrapper;
    this._toggleEffects(false);
    this.tools = {};
    wrp && wrp.remove();
    Backbone.View.prototype.remove.apply(this, arg);
    return this;
  }

  startAutoscroll() {
    this.lastMaxHeight = this.getWrapper()?.offsetHeight - this.el.offsetHeight;

    // By detaching those from the stack avoid browsers lags
    // Noticeable with "fast" drag of blocks
    setTimeout(() => {
      this._toggleAutoscrollFx(true);
      requestAnimationFrame(this.autoscroll);
    }, 0);
  }

  autoscroll() {
    if (this.dragging) {
      const { lastClientY } = this;
      const canvas = this.em.Canvas;
      const win = this.getWindow();
      const body = this.getBody();
      const actualTop = body?.scrollTop ?? 0;
      const clientY = lastClientY || 0;
      const limitTop = canvas.getConfig().autoscrollLimit;
      const limitBottom = this.getRect().height - limitTop;
      let nextTop = actualTop;

      if (clientY < limitTop) {
        nextTop -= limitTop - clientY;
      }

      if (clientY > limitBottom) {
        nextTop += clientY - limitBottom;
      }

      if (
        !isUndefined(lastClientY) && // Fixes #3134
        nextTop !== actualTop &&
        nextTop > 0 &&
        nextTop < this.lastMaxHeight
      ) {
        const toolsEl = this.getGlobalToolsEl();
        if (toolsEl) toolsEl.style.opacity = "0";
        this.showGlobalTools();
        win?.scrollTo(0, nextTop);
      }

      requestAnimationFrame(this.autoscroll);
    }
  }

  updateClientY(ev: Event) {
    ev.preventDefault();
    this.lastClientY = getPointerEvent(ev).clientY * this.em.getZoomDecimal();
  }

  showGlobalTools = debounce(() => {
    const gtel = this.getGlobalToolsEl();
    if (gtel) gtel.style.opacity = "";
  }, 50);

  stopAutoscroll() {
    this.dragging && this._toggleAutoscrollFx();
  }

  _toggleAutoscrollFx(enable: boolean = false) {
    this.dragging = enable;
    const win = this.getWindow();
    if (win) {
      const method = enable ? "on" : "off";
      const mt = { on, off };
      mt[method](win, "mousemove dragover", this.updateClientY);
      mt[method](win, "mouseup", this.stopAutoscroll);
    }
  }

  render() {
    const { $el, ppfx } = this;
    $el.attr({ class: `${ppfx}frame` });
    this.renderScripts();
    return this;
  }

  renderScripts() {
    const { el, model, em } = this;
    const evLoad = "frame:load";
    const evOpts = { el, model, view: this };
    const canvas = this.getCanvasModel();
    const appendScript = (scripts: (string | scriptIncludeAttr)[]) => {
      if (scripts.length > 0) {
        const src = scripts.shift();
        const scriptEl = createEl("script", {
          type: "text/javascript",
          ...(isString(src) ? { src } : src)
        });
        scriptEl.onerror = scriptEl.onload = appendScript.bind(null, scripts);
        el.contentDocument?.head.appendChild(scriptEl);
      } else {
        this.renderBody();
        em && em.trigger(evLoad, evOpts);
      }
    };

    el.onload = () => {
      em && em.trigger(`${evLoad}:before`, evOpts);
      appendScript([...canvas.scripts]);
    };
  }

  renderStyles(opts: { prev?: (string | styleIncludeAttr)[] }) {
    const head = this.getHead();
    const canvas = this.getCanvasModel();
    if (head) {
      const normalize = (stls: (string | styleIncludeAttr)[]) =>
        stls.map(href => ({
          tag: "link",
          attributes: {
            rel: "stylesheet",
            ...(isString(href) ? { href } : href)
          }
        }));
      const prevStyles = normalize(opts.prev || canvas.previous("styles"));
      const styles = normalize(canvas.styles);
      const toRemove: styleLinkAttr[] = [];
      const toAdd: styleLinkAttr[] = [];
      const find = (
        items: styleLinkAttr[],
        stack: styleLinkAttr[],
        res: styleLinkAttr[]
      ) => {
        items.forEach(item => {
          const { href } = item.attributes;
          const has = stack.some(s => s.attributes.href === href);
          !has && res.push(item);
        });
      };
      find(styles, prevStyles, toAdd);
      find(prevStyles, styles, toRemove);
      toRemove.forEach(stl => {
        const el = head.querySelector(`link[href="${stl.attributes.href}"]`);
        el && el.parentNode?.removeChild(el);
      });
      appendVNodes(head, toAdd);
    }
  }

  renderBody() {
    const { config, model, ppfx } = this;
    const { em } = config;
    const doc = this.getDoc();
    const body = this.getBody();
    const win = this.getWindow();
    const conf = em.get("Config");
    //@ts-ignore
    win && (win._isEditor = true);
    this.renderStyles({ prev: [] });

    const colorWarn = "#ffca6f";

    if (doc && body && win) {
      // I need all this styles to make the editor work properly
      // Remove `html { height: 100%;}` from the baseCss as it gives jumpings
      // effects (on ENTER) with RTE like CKEditor (maybe some bug there?!?)
      // With `body {height: auto;}` jumps in CKEditor are removed but in
      // Firefox is impossible to drag stuff in empty canvas, so bring back
      // `body {height: 100%;}`.
      // For the moment I give the priority to Firefox as it might be
      // CKEditor's issue
      append(
        body,
        `<style>
      ${conf.baseCss || ""}

      .${ppfx}dashed *[data-highlightable] {
        outline: 1px dashed rgba(170,170,170,0.7);
        outline-offset: -2px;
      }

      .${ppfx}selected {
        outline: 3px solid #3b97e3 !important;
        outline-offset: -3px;
      }

      .${ppfx}selected-parent {
        outline: 2px solid ${colorWarn} !important
      }

      .${ppfx}no-select {
        user-select: none;
        -webkit-user-select:none;
        -moz-user-select: none;
      }

      .${ppfx}freezed {
        opacity: 0.5;
        pointer-events: none;
      }

      .${ppfx}no-pointer {
        pointer-events: none;
      }

      .${ppfx}plh-image {
        background: #f5f5f5;
        border: none;
        height: 100px;
        width: 100px;
        display: block;
        outline: 3px solid #ffca6f;
        cursor: pointer;
        outline-offset: -2px
      }

      .${ppfx}grabbing {
        cursor: grabbing;
        cursor: -webkit-grabbing;
      }

      .${ppfx}is__grabbing {
        overflow-x: hidden;
      }

      .${ppfx}is__grabbing,
      .${ppfx}is__grabbing * {
        cursor: grabbing !important;
      }

      ${conf.canvasCss || ""}
      ${conf.protectedCss || ""}
    </style>`
      );
      const component = model.getComponent();
      this.wrapper = new ComponentView({
        model: component,
        config: {
          ...component.config,
          frameView: this
        }
      }).render();
      append(body, this.wrapper.el);
      append(
        body,
        new CssRulesView({
          collection: model.getStyles(),
          config: {
            ...em.CssComposer.getConfig(),
            frameView: this
          }
        }).render().el
      );
      append(body, this.getJsContainer());
      // em.trigger('loaded'); // I need to manage only the first one maybe
      //this.updateOffset(); // TOFIX (check if I need it)

      // Avoid some default behaviours
      on(
        body,
        "click",
        (ev: Event) =>
          ev?.target &&
          (ev.target as HTMLElement).tagName == "A" &&
          ev.preventDefault()
      );
      on(body, "submit", (ev: Event) => ev && ev.preventDefault());

      // When the iframe is focused the event dispatcher is not the same so
      // I need to delegate all events to the parent document
      [
        { event: "keydown keyup keypress", class: "KeyboardEvent" },
        { event: "mousedown mousemove mouseup", class: "MouseEvent" },
        { event: "pointerdown pointermove pointerup", class: "PointerEvent" },
        { event: "wheel", class: "WheelEvent" }
      ].forEach(obj =>
        obj.event.split(" ").forEach(event => {
          doc.addEventListener(event, ev =>
            this.el.dispatchEvent(createCustomEvent(ev, obj.class))
          );
        })
      );

      this._toggleEffects(true);
      this.droppable = hasDnd(em) && new Droppable(em, this.wrapper.el);
      model.trigger("loaded");
    }
  }

  _toggleEffects(enable: boolean) {
    const method = enable ? on : off;
    const win = this.getWindow();
    win && method(win, `${motionsEv} resize`, this._emitUpdate);
  }

  _emitUpdate() {
    this.model._emitUpdated();
  }
}
