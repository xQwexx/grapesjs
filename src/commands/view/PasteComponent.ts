import { isArray, contains } from 'underscore';
import { CommandAbstract } from './CommandAbstract';

export default class PasteComponent extends CommandAbstract {
  run() {
    const { em } = this;
    const clp: any[] = em.get('clipboard');
    const selected = em.getSelected();

    if (clp && selected) {
      em.getSelectedAll().forEach(comp => {
        if (!comp) return;

        const coll = comp.collection;
        if (!coll) return;

        const at = coll.indexOf(comp) + 1;
        const copyable = clp.filter(cop => cop.get('copyable'));
        let added;

        if (contains(clp, comp) && comp.get('copyable')) {
          added = coll.add(comp.clone(), { at });
        } else {
          added = coll.add(
            copyable.map(cop => cop.clone()),
            { at }
          );
        }

        added = isArray(added) ? added : [added];
        added.forEach(add => em.trigger('component:paste', add));
      });

      selected.emitUpdate();
    }
  }
};
