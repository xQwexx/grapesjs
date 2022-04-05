import TraitView from './TraitView';
import TraitsView from './TraitsView';
import Traits from '../model/Traits';
import Backbone from 'backbone';

const $ = Backbone.$;

export default class TraitListView extends TraitView {
  name = 'list';

  views = [];
  /*default(){
    return {events: {
      "click .button-up": "transitionUp",
    }}}*/
  init() {
    console.log('>>>>>>>>>>>>>>>>>>>run init');
    console.log(this);
    console.log(this.model);
    this.hasLabel = false;
    this.listenTo(this.model, 'change:traits', this.rerender);
    console.log(this.model.get('traits'));
    this.events['click .button-up'] = 'transitionUp';
    this.events['click'] = function () {
      alert(this.model.get('name'));
    };
    //console.log(new Backbone.Model.extend(this.model.get('traits')[0]));
    //console.log(new Backbone.Model(this.model.get('traits')[0]));
    //console.log(new Trait(this.model.get('traits')[0]));
    //let array = this.model.get('traits')?.map(tr => new Trait(tr));
    //console.log(array);
    //this.model.set('traits', array);
    this.model.on('click .button-up', 'transitionUp');
    this.listenTo(this, 'click .button-up', () => {
      console.log('clicked element');
    });
    console.log(this.model);
    this.button = document.createElement('button');
    this.button.innerText = 'Do something';
    this.button.onclick = () => {
      this.transitionUp();
    };

    this.model.setValue([]);
    console.log(this.button);
    console.log(this.model.target);

    //this.setElement(Backbone.$('.button-up'));
  }

  transitionUp() {
    console.log(`Transition up ${this.model.attributes.traits}`);
    console.log(this.model.attributes.traits);
    const { el } = this;
    var traitsI = this.model.attributes.traits.map(a => ({ ...a }));
    const traits = new Traits([], this.opt);

    traits.setTarget(this.model.target);
    console.log(traitsI);
    if (traitsI.length) {
      traitsI.forEach(tr => tr.attributes && delete tr.attributes.value);
      traitsI.forEach(tr => console.log(this.model.getName() + tr.name + this.views.length));
      traitsI.forEach(tr => (tr.name = this.model.getName() + ':' + tr.name + this.views.length));
      traits.add(traitsI);
    }
    this.model.getValue().push(traits);
    this.model.setValue(this.model.getValue());
    //this.model.targetUpdated();
    const view = new TraitsView({
      //el: this,
      collection: [],
      editor: this.em,
      config: this,
    });
    view.updatedCollection(traits);
    this.views.push(view);
    console.log(this.collection);
    console.log(this);
    console.log(view);
    this.rerender();
  }

  templateInput() {
    console.log('Rerender ListView');
    const { ppfx, clsField, views } = this;

    let input = '<div>';
    console.log('TraitsViewer.itemsView');
    //console.log(this.events["click"])
    /* let TraitsViewer = new TraitsView({
          input,
          collection: [],
          editor: this.em,
          config: this
        });
        TraitsViewer.itemsView = editor.TraitManager.getTypes();
        console.log(TraitsViewer.itemsView);
        TraitsViewer.updatedCollection(this.model);
        console.log(input);*/
    input += '<div>';
    console.log(views.length);
    //console.log(collection.map(element => {return element.$el}))
    //console.log(collection.map(element => {return element.collection}))

    var root = document.createElement('div');
    root.innerHTML = `<div class="jss332 jss335 jss333 jss530 jss531">
        <div class="jss59 jss534" tabindex="0" role="button" aria-expanded="false">
          <div class="jss538"><div style="display: flex; align-items: center; width: 100%;">
            <div tabindex="0" data-react-beautiful-dnd-drag-handle="0" aria-roledescription="Draggable item. Press space bar to lift" draggable="false">
              <svg class="jss62" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation" style="position: relative; top: 2px; left: -10px; opacity: 0.3;">
                <g><path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z"></path></g>
              </svg>
            </div>
            <p class="jss105 jss114">New field</p>
            <p class="jss105 jss114 css-inc1w8">Text</p>
            </div>
          </div>
          <div class="jss59 jss53 jss539" tabindex="-1" role="button" aria-hidden="true">
            <span class="jss58">
              <svg class="jss62" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                <g><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></g>
              </svg>
            </span>
          </div>
        </div>
      </div>`.trim();
    //this.model.getValue().forEach(element => root.appendChild(element.render().$el))
    console.log(this.model.getValue());
    this.model.getValue().forEach(element => console.log(element));
    views.forEach(element => console.log(element));
    views.forEach(element => root.appendChild(element.el));
    console.log('element.$el');
    //root.appendChild(collection.render().$el)
    root.appendChild(this.button);
    return root;
    return $(`
        <div data-react-beautiful-dnd-draggable="0">
          <div class="jss332 jss335 jss333 jss530 jss531">
            <div class="jss59 jss534" tabindex="0" role="button" aria-expanded="false">
              <div class="jss538"><div style="display: flex; align-items: center; width: 100%;">
                <div tabindex="0" data-react-beautiful-dnd-drag-handle="0" aria-roledescription="Draggable item. Press space bar to lift" draggable="false">
                  <svg class="jss62" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation" style="position: relative; top: 2px; left: -10px; opacity: 0.3;">
                    <g><path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z"></path></g>
                  </svg>
                </div>
                <p class="jss105 jss114">New field</p>
                <p class="jss105 jss114 css-inc1w8">Text</p>
                </div>
              </div>
              <div class="jss59 jss53 jss539" tabindex="-1" role="button" aria-hidden="true">
                <span class="jss58">
                  <svg class="jss62" focusable="false" viewBox="0 0 24 24" aria-hidden="true" role="presentation">
                    <g><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path></g>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          ${collection.map(element => {
            return element.el.outerHTML;
          })}
          ${this.button.outerHTML}
          <button class="button-up" id="up">
          Go Up
       </button>
        </div>`);
  }
  /* ${
              this.templateInput
                ? isFunction(this.templateInput)
                  ? this.templateInput(this.getClbOpts())
                  : this.templateInput
                : ''
            }*/
  /*render() {
        const { $el, pfx, ppfx, model } = this;
        const { type, id } = model.attributes;
        const hasLabel = this.hasLabel && this.hasLabel();
        const cls = `${pfx}trait`;
        this.$input = null;
        let tmpl = `<div class="${cls} ${cls}--${type}">
          ${hasLabel ? `<div class="${ppfx}label-wrp" data-label></div>` : ''}
          <div class="${ppfx}field-wrp ${ppfx}field-wrp--${type}" data-input>
          ${this.templateInput()}
          </div>
        </div>`;
        $el.empty().append(tmpl).find(`.${ppfx}field-wrp.${ppfx}field-wrp--${type}`)//.append(this.button);
        console.log($el.render)
        hasLabel && this.renderLabel();
        this.renderField();
        this.el.className = `${cls}__wrp ${cls}__wrp-${id}`;
        this.postUpdate();
        this.onRender(this.getClbOpts());
        return this;
      }*/
}

TraitListView.prototype.events = {
  'click .button-up': 'transitionUp',
};
