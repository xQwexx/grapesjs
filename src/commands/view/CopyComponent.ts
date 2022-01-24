import { CommandAbstract } from "./CommandAbstract";

export default class CopyComponents extends CommandAbstract {
  run() {
    const {em} = this;
    const models = [...em.getSelectedAll()];
    models.length && em.set('clipboard', models);
  }
};
