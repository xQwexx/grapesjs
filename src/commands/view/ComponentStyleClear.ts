import Editor from 'editor';
import { isArray, flatten } from 'underscore';
import { CommandAbstract } from './CommandAbstract';

export default class ComponentStyleClear extends CommandAbstract {
  run(ed: Editor, s: any, opts: any = {}) {
    const { target } = opts;
    let toRemove: any = [];

    if (!target.get('styles')) return toRemove;
    const { em } = this;

    // Find all components in the project, of the target component type
    const type = target.get('type');
    const wrappers = em.PageManager.getAllWrappers();
    const len = flatten(wrappers.map(wrp => wrp.findType(type))).length;

    // Remove component related styles only if there are no more components
    // of that type in the project
    if (!len) {
      const rules = em.CssComposer.getAll();
      toRemove = rules.filter(rule => rule.get('group') === `cmp:${type}`);
      rules.remove(toRemove);
    }

    return toRemove;
  }
};
