import { renderVariableValue } from '../../../../src/common/traits';
import TraitAjax from '../../../../src/common/traits/model/js-traits/TraitAjax';
import TraitUrl from '../../../../src/common/traits/model/js-traits/TraitUrl';
import Trait from '../../../../src/common/traits/model/Trait';
import TraitObject from '../../../../src/common/traits/model/TraitObject';
import TraitRoot from '../../../../src/common/traits/model/TraitRoot';
import Component from '../../../../src/dom_components/model/Component';
import Editor from '../../../../src/editor';
import EditorModel from '../../../../src/editor/model/Editor';

describe('TraitModels', () => {
  var trait: Trait;
  var target: Component;
  var modelName = 'title';
  const title = 'Title Test';
  var em: EditorModel;

  beforeEach(() => {
    em = new Editor().getModel();
    target = new Component({}, { em });
    //@ts-ignore
    trait = new TraitRoot(modelName, target, {});
  });

  afterEach(() => {});

  test('Set title', () => {
    var traitAjax = new TraitAjax(trait);
    // trait.opts = { traits: [{name: "test", type: "text"}]}
    (traitAjax.children[0] as any).children[0].value = title;
    console.log(expect(renderVariableValue(trait.value)).toBe(title));
  });
  //   test('Trait undo property', () => {
  //     em.loadOnStart();

  //     trait.value = title;

  //     expect(target.getAttributes()[modelName]).toBe(title);
  //     em.UndoManager.undo();
  //     expect(target.getAttributes()[modelName]).toBeUndefined;
  //   });

  //   test('Trait object property', () => {
  //     trait.opts = { traits: [{name: "test", type: "text"}]}
  //     trait = new TraitObject(trait)
  //     trait.children[0].value = title;

  //     expect(target.get(modelName)).toEqual({test: title});
  //   });
});
