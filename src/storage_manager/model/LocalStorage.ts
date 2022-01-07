import { Model } from 'backbone';
import { hasWin } from 'utils/mixins';
import IStorage from './IStorage';

export default class LocalStorage extends Model implements IStorage{
  defaults(){ return{
    checkLocal: true
  }
}

  /**
   * @private
   */
  store(data: {[id: string]: string}, clb?: () => void) {
    if (this.hasLocal()) {
      for (let key in data) localStorage.setItem(key, data[key]);
    }

    clb && clb();
  }

  /**
   * @private
   */
  load(keys: string[], clb = (result:{[id: string]: string}) => {}) {
    const result: {[id: string]: string} = {};

    if (this.hasLocal()) {
      for (let i = 0, len = keys.length; i < len; i++) {
        const value = localStorage.getItem(keys[i]);
        if (value) result[keys[i]] = value;
      }
    }

    clb && clb(result);

    return result;
  }

  /**
   * @private
   */
  remove(keys: string[]) {
    if (!this.hasLocal()) return;

    for (let i = 0, len = keys.length; i < len; i++)
      localStorage.removeItem(keys[i]);
  }

  /**
   * Check storage environment
   * @private
   * */
  hasLocal() {
    const win = hasWin();

    if (this.get('checkLocal') && (!win || !localStorage)) {
      win && console.warn("Your browser doesn't support localStorage");
      return false;
    }

    return true;
  }
};
