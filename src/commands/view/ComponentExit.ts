import Editor from "editor";
import { CommandAbstract } from "./CommandAbstract";

export default class ComponentExit extends CommandAbstract {
  run(ed: Editor, snd: any, opts: any = {}) {
    if (!this.canvas.hasFocus() && !opts.force) return;
    const toSelect: any = [];

    this.em.getSelectedAll().forEach(component => {
      let next = component.parent();

      // Recurse through the parent() chain until a selectable parent is found
      while (next && !next.get('selectable')) {
        next = next.parent();
      }

      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
};
