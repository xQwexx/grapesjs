import Command from 'commands/model/Command';
import Commands from 'commands';
import mockEditor from '../index';

describe('Command', () => {
  let obj;

  beforeEach(() => {
    obj = new Command();
  });

  afterEach(() => {
    obj = null;
  });

  test('Has id property', () => {
    expect(obj.has('id')).toEqual(true);
  });
});

describe('Commands', () => {
  var obj;

  beforeEach(() => {
    obj = new Commands(mockEditor);
  });

  afterEach(() => {
    obj = null;
  });

  test('Object is ok', () => {
    expect(obj).toBeTruthy();
  });
});
