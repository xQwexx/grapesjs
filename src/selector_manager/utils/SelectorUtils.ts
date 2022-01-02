// Type selectors: https://developer.mozilla.org/it/docs/Web/CSS/CSS_Selectors
export enum SelectorType {
  class = 1,
  id = 2
}
export default class SelectorUtils {
  /**
   * Escape string
   * @param {string} name
   * @return {string}
   * @private
   */
  escapeName = (name: string) => {
    return `${name}`.trim().replace(/([^a-z0-9\w-\:]+)/gi, "-");
  };
}
