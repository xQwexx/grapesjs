import Backbone from "backbone";
import { EditorConfig } from "editor/config/config";
import EditorModel from "editor/model/Editor";
import { appendStyles } from "utils/mixins";

const $ = Backbone.$;

export default class EditorView extends Backbone.View {
  conf: EditorConfig;
  pn: any;
  cv: any;

  constructor(model: EditorModel) {
    super({ model: model });
    model.view = this;
    this.conf = model.getConfig();
    this.pn = model.get("Panels");
    this.cv = model.get("Canvas");
    model.once("change:ready", () => {
      this.pn.active();
      this.pn.disableButtons();
      setTimeout(() => {
        model.trigger("load", model.get("Editor"));
        model.set("changesCount", 0);
      });
    });
  }

  render() {
    const { $el, conf } = this;
    const pfx = conf.stylePrefix;
    const contEl = $(
      ((conf.el as unknown) as string) || `body ${conf.container}`
    );
    appendStyles(conf.cssIcons as string, { unique: 1, prepand: 1 });
    $el.empty();

    if (conf.width) contEl.css("width", conf.width);
    if (conf.height) contEl.css("height", conf.height);

    $el.append(this.cv.render());
    $el.append(this.pn.render());
    $el.attr("class", `${pfx}editor ${pfx}one-bg ${pfx}two-color`);
    contEl
      .addClass(`${pfx}editor-cont`)
      .empty()
      .append($el);

    return this;
  }
}
