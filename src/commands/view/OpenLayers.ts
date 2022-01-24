import { CommandAbstract } from "./CommandAbstract";
export default class OpenLayers extends CommandAbstract {

  layers?: HTMLElement;
  run() {
    const lm = this.editor.LayerManager;
    const pn = this.editor.Panels;

    if (lm.getConfig().appendTo) return;

    if (!this.layers) {
      const id = 'views-container';
      const layers = document.createElement('div');
      const panels = pn.getPanel(id) || pn.addPanel({ id });
      layers.appendChild(lm.render());
      panels.set('appendContent', layers).trigger('change:appendContent');
      this.layers = layers;
    }

    this.layers.style.display = 'block';
  }

  stop() {
    const { layers } = this;
    layers && (layers.style.display = 'none');
  }
};
