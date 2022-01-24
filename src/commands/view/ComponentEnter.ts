import { CommandAbstract } from "./CommandAbstract";

export default class ComponentEnter extends CommandAbstract{
  run() {
    const ed = this.editor;
    if (!ed.Canvas.hasFocus()) return;
    const toSelect: any[] = [];

    ed.getSelectedAll().forEach(component => {
      const coll: any[] = component.components();
      const next = coll && coll.filter(c => c.get('selectable'))[0];
      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
};
