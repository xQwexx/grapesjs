export enum SelectorType {
  class = 1,
  id = 2
}
export default class SelectorUtils {
  // Type selectors: https://developer.mozilla.org/it/docs/Web/CSS/CSS_Selectors
  TYPE_CLASS = 1;
  TYPE_ID = 2;

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
