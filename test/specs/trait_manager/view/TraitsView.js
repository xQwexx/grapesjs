import TraitView from 'trait_manager/view/TraitView';
import Component from 'dom_components/model/Component';

describe('TraitView', () => {
  var obj;
  var model;
  var targetName = 'title';

  beforeEach(() => {
    model = new Component();

    obj = new TraitView({
      model,
      name: targetName,
    });
  });

  afterEach(() => {
    obj = null;
    model = null;
  });

  test('Object exists', () => {
    expect(TraitView).toBeTruthy();
  });

  test('Target has no attributes on init', () => {
    expect(model.get('attributes')).toEqual({});
  });

  test('On update of the value updates the target attributes', () => {
    obj.target = 'test';
    var eq = {};
    eq[targetName] = 'test';
    expect(model.get('attributes')).toEqual(eq);
  });

  test('Updates on different models do not alter other targets', () => {
    var model1 = new Component();
    var model2 = new Component();

    var obj1 = new TraitView({ model: model1, name: targetName });
    var obj2 = new TraitView({ model: model2, name: targetName });

    obj1.target = 'test1';
    obj2.target = 'test2';

    var eq1 = {};
    eq1[targetName] = 'test1';
    var eq2 = {};
    eq2[targetName] = 'test2';
    expect(model1.get('attributes')).toEqual(eq1);
    expect(model2.get('attributes')).toEqual(eq2);
  });
});
