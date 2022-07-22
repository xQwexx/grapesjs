import TraitInputView from './TraitInputView';
import Input from './Input';
import TargetValueLink from '../model/TargetValueLink';
import ColorPicker from '../../utils/ColorPicker';
import Backbone from 'backbone';
import { isUndefined } from 'underscore';
import Pickr from '@simonwep/pickr';

const $ = Backbone.$;
//$ && ColorPicker($);
type Color = string;
const getColor = (color: any) => {
  const name = color.getFormat() === 'name' && color.toName();
  const cl = color.getAlpha() == 1 ? color.toHexString() : color.toRgbString();
  return name || cl.replace(/ /g, '');
};

export class InputColor extends Input<Color> {
  colorEl!: any;
  template() {
    const ppfx = this.ppfx;
    return `
      <div class="${this.holderClass}"></div>
      <div class="${ppfx}field-colorp">
        <div class="${ppfx}field-colorp-c" data-colorp-c>
          <div class="${ppfx}checker-bg"></div>
        </div>
      </div>
    `;
  }

  remove() {
    super.remove();
    this.colorEl.spectrum('destroy');
    return this;
  }

  /**
   * Updates the view when the model is changed
   * */
  onTargetChanged(model: any, value: any) {
    const { inputEl } = this;
    inputEl && (inputEl.value = value);
  }

  /* handleChange(e: Event) {
    e.stopPropagation();
    const value = e.target?.value;
    if (isUndefined(value)) return;
    this.__onInputChange(value);
  }

  __onInputChange(val) {
    const { model, opts } = this;
    const { onChange } = opts;
    let value = val;
    const colorEl = this.getColorEl();

    // Check the color by using the ColorPicker's parser
    if (colorEl) {
      colorEl.spectrum('set', value);
      const tc = colorEl.spectrum('get');
      const color = value && getColor(tc);
      color && (value = color);
    }

    onChange ? onChange(value) : model.set({ value }, { fromInput: 1 });
  }

  /**
   * Set value to the model
   * @param {string} val
   * @param {Object} opts
   */
  /* setValue(val, opts = {}) {
    const { model } = this;
    const def = !isUndefined(opts.def) ? opts.def : model.get('defaults');
    const value = !isUndefined(val) ? val : !isUndefined(def) ? def : '';
    const inputEl = this.getInputEl();
    const colorEl = this.getColorEl();
    const valueClr = value != 'none' ? value : '';
    inputEl.value = value;
    colorEl.get(0).style.backgroundColor = valueClr;

    // This prevents from adding multiple thumbs in spectrum
    if (opts.fromTarget || (opts.fromInput && !opts.avoidStore)) {
      colorEl.spectrum('set', valueClr);
      this.noneColor = value == 'none';
    }
  }*/

  /**
   * Get the color input element
   * @return {HTMLElement}
   */
  protected getInputEl(value: Color) {
    var el = document.createElement('div');
    this.$el.find(`.${this.holderClass}`).get(0)?.append(el);
    var colorEl = $<HTMLInputElement>(`<div class="${this.ppfx}field-color-picker"></div>`);
    console.log(colorEl.get(0));
    const pick = Pickr.create({
      el: el,
      container: this.$el.find(`.${this.holderClass}`).get(0),
      theme: 'monolith',
      default: value,
      position: 'top-end',
      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          input: true,
          clear: true,
          save: true,
        },
      },
    });
    pick.on('save', (color: Pickr.HSVaColor, instance: Pickr) => {
      this.__onInputChange(color.toHEXA().toString());
    });
    return colorEl;
    /*const { em, model, opts } = this;
      const self = this;
      const ppfx = this.ppfx;
      const { onChange } = opts;

      var colorEl = $(`<div class="${this.ppfx}field-color-picker"></div>`) as any;
      var cpStyle = colorEl.get(0).style;
      var elToAppend = em && em.config ? em.config.el : '';
      var colorPickerConfig = (em && em.getConfig && em.getConfig().colorPicker) || {};

      let changed = false;
      let movedColor = '';
      let previousColor: Color;
      this.$el.find('[data-colorp-c]').append(colorEl);

      const handleChange = (value: string, complete = true) => {
        if (onChange) {
          onChange(value, !complete);
        } else {
          complete && model.setValueFromInput(0, false); // for UndoManager
          model.setValueFromInput(value, complete);
        }
      };

      colorEl.spectrum({
        color: value || false,
        containerClassName: `${ppfx}one-bg ${ppfx}two-color`,
        appendTo: elToAppend || 'body',
        maxSelectionSize: 8,
        showPalette: true,
        showAlpha: true,
        chooseText: 'Ok',
        cancelText: '⨯',
        palette: [],

        // config expanded here so that the functions below are not overridden
        ...colorPickerConfig,
        ...(model.get('colorPicker') || {}),

        move(color ) {
          const cl = getColor(color);
          movedColor = cl;
          cpStyle.backgroundColor = cl;
          handleChange(cl, false);
        },
        change(color) {
          changed = true;
          const cl = getColor(color);
          cpStyle.backgroundColor = cl;
          handleChange(cl);
          self.noneColor = 0;
        },
        show(color) {
          changed = false;
          movedColor = '';
          previousColor = onChange ? model.getValue({ noDefault: true }) : getColor(color);
        },
        hide() {
          if (!changed && (previousColor || onChange)) {
            if (self.noneColor) {
              previousColor = '';
            }
            cpStyle.backgroundColor = previousColor;
            colorEl.spectrum('set', previousColor);
            handleChange(previousColor, false);
          }
        },
      });

      if (em && em.on) {
        this.listenTo(em, 'component:selected', () => {
          movedColor && handleChange(movedColor);
          changed = true;
          movedColor = '';
          colorEl.spectrum('hide');
        });
      }

      this.colorEl = colorEl;
    }
    return this.colorEl;*/
  }
}

export default class TraitColorView extends TraitInputView<Color> {
  get type() {
    return 'color';
  }
  protected get templateInput() {
    return '';
  }

  protected initInput(link: TargetValueLink<Color>, opts: any) {
    const input = new InputColor(link, opts);
    //this.listenTo(input, "el:change", this.render)
    return input;
  }

  /*protected getInput() {
    const model = this.model;
    const value = this.target;
   const inputColor = new InputColor({
      model: model,//{...this, value: this.target},
      target: this.config.em,
      contClass: this.ppfx + 'field-color',
      ppfx: this.ppfx,
    });
    const $input = inputColor.render().inputEl as JQuery<HTMLInputElement>;
    $input.val(value);

    return $input;
  }*/
}
