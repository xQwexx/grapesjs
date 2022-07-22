import { Module, View } from '../../abstract';
import { ModuleConfig } from '../../abstract/Module';

export default abstract class TraitView extends View {
  abstract get type(): string;

  private _module: Module<ModuleConfig>;
  protected get module() {
    return this._module;
  }
  constructor(module: Module<ModuleConfig>, model: any) {
    super({ model: model.model });
    this._module = module;
  }
}
