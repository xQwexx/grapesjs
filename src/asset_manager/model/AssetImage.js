import Asset from './Asset';

export default class AssetImage extends Asset {
  get defaults() {
    return {
      ...super.defaults,
      type: 'image',
      unitDim: 'px',
      height: 0,
      width: 0,
    };
  }
}
