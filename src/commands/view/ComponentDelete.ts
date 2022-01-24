import Editor from 'editor';
import { isArray } from 'underscore';
import { CommandAbstract } from './CommandAbstract';

export default class ComponentDelete extends CommandAbstract {
  run(editor: Editor, sender: any, opts: any = {}) {
    const toSelect: any[] = [];
    const ed = this.editor
    let components = opts.component || ed.getSelectedAll();
    components = isArray(components) ? [...components] : [components];

    // It's important to deselect components first otherwise,
    // with undo, the component will be set with the wrong `collection`
    ed.select(null);

    components.forEach((component: any) => {
      if (!component || !component.get('removable')) {
        return this.em.logWarning('The element is not removable', {
          component
        });
      }
      component.remove();
      component.collection && toSelect.push(component);
    });

    toSelect.length && ed.select(toSelect);

    return components;
  }
};
