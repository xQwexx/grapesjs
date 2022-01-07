import Trait from "./Trait";

export default (config:any = {}) => ({
  /**
   * Build props object by their name
   * @param  {Array<string>|string} props Array of properties name
   * @return {Array<Object>}
   */
  build(props: string |string[]) {
    const objs = [];

    if (typeof props === 'string') props = [props];

    for (let i = 0; i < props.length; i++) {
      const obj: any = {};
      const prop: string = props[i];
      obj.name = prop;

      switch (prop) {
        case 'target':
          obj.type = 'select';
          obj.default = false;
          obj.options = config.optionsTarget;
          break;
      }

      objs.push(obj);
    }

    return objs as Trait[];
  }
});
