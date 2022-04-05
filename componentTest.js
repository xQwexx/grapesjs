

//mport cardIcon from "raw-loader!../icons/credit-card-solid.svg";
//import defaultType from "const"
//
//import components from "./src//components";

 const kanbanBoard = (bm, c) => {
  console.log("kanban-board");
  bm.add('kanban-board', {
    label: `
            <div>kanbanboard</div>
        `,
    category: 'Basic',
    content: {
      type: 'kanban-board'
    }
  });
  bm.add('card_container', {
    label: `
            <div>container</div>
        `,
    category: 'Basic',
    content: {
      type: 'card_container'
    }
  });
};

function dom(domc, editor){
  const comps = editor.Components;
  const defaultType = comps.getType('default');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;
  const imageType = domc.getType('image');
  const imageModel = imageType.model;
  const imageView = imageType.view;
  
  domc.addType('kanban-board', {
    model: defaultModel.extend({
      defaults: Object.assign({}, defaultModel.prototype.defaults, {
        'custom-name': 'Kanban board',
        classes: ['kanban-board', 'container', 'p-2'],
        traits: [
          {
            type: 'list',
            name: 'kanban-column',
            changeProp: true,
            traits: [
              {
                type: 'number',
                label: 'Number of columns',
                name: 'kanban-column',
                min: 1,
                max: 10,
                changeProp: 1
              },
              {
                type: 'checkbox',
                label: 'Header',
                name: 'card-header',
                changeProp: 1
              },
              {
                type: 'checkbox',
                label: 'Image',
                name: 'card-img',
                changeProp: 1
              },
            ]
          },
          {
            type: 'number',
            label: 'Number of columns',
            name: 'kanban-column-number',
            min: 1,
            max: 10,
            changeProp: 1
          },
          {
            type: 'checkbox',
            label: 'Header',
            name: 'card-header',
            changeProp: 1
          },
          {
            type: 'checkbox',
            label: 'Image',
            name: 'card-img',
            changeProp: 1
          },
          {
            type: 'checkbox',
            label: 'Image Overlay',
            name: 'card-img-overlay',
            changeProp: 1
          },
          {
            type: 'checkbox',
            label: 'Body',
            name: 'card-body',
            changeProp: 1
          },
          {
            type: 'checkbox',
            label: 'Footer',
            name: 'card-footer',
            changeProp: 1
          },
          {
            type: 'checkbox',
            label: 'Image Bottom',
            name: 'card-img-bottom',
            changeProp: 1
          }
        ].concat(defaultModel.prototype.defaults.traits),
        alma: true,
        components: [
          {
            type: 'text',
            content: `<h1 class="h3 mb-3">Kanban Board</h1>`},
          {
            classes: ['row', 'kanban-board-canvas'],
            draggable: false,
            badgable: false,
          },
          {
            tagName: 'script',
            content: `
            function allowDrop(ev) {
              ev.preventDefault();
            }
            
            function drop(ev) {
              ev.preventDefault();
              var data = ev.dataTransfer.getData("text");
              console.log(ev);
              ev.target.appendChild(document.getElementById(data));
            }
            
            function drag(ev) {
              ev.dataTransfer.setData("text", ev.target.id);
            }
            `
          }
        ]
      }),
      init() {
        this.listenTo(this, 'change:kanban-column', this.createColumns);
        this.listenTo(this, 'change', (event) => console.log(event));
        //this.set('kanban-column-number', 4);
        /*this.listenTo(this, 'change:card-header', this.cardHeader);
        this.listenTo(this, 'change:card-img', this.cardImage);
        this.listenTo(this, 'change:card-img-overlay', this.cardImageOverlay);
        this.listenTo(this, 'change:card-body', this.cardBody);
        this.listenTo(this, 'change:card-footer', this.cardFooter);
        this.listenTo(this, 'change:card-img-bottom', this.cardImageBottom);
        this.components().comparator = 'card-order';
        
        this.set('card-body', true);*/
        console.log(this);
      },
      createColumns(event, list) { 
        let root = this.components().filter(function(comp) {
          return comp.attributes.classes.filter(function(comp) {
            return comp.attributes.name == 'row';
          }).length == 1;
        })[0];
        //root.clean();
        
        let children = root.components();

        children.filter(() => true).forEach((comp) => {comp.destroy()});
        for (let idx = 0; idx < list.length; idx++) {
          children.add({ type: 'kanban-column' });
        }
      },
      cardHeader() { this.createCardComponent('card-header'); },
      cardImage() { this.createCardComponent('card-img'); },
      cardImageOverlay() { this.createCardComponent('card-img-overlay'); },
      cardBody() { this.createCardComponent('card-body'); },
      cardFooter() { this.createCardComponent('card-footer'); },
      cardImageBottom() { this.createCardComponent('card-img-bottom'); },
      createCardComponent(prop) {
        const state = this.get(prop);
        const type = prop.replace(/-/g,'_').replace(/img/g,'image')
        let children = this.components();
        let existing = children.filter(function(comp) {
          return comp.attributes.type === type;
        })[0]; // should only be one of each.

        if(state && !existing) {
          var comp = children.add({
            type: type
          });
          let comp_children = comp.components();
          if(prop === 'card-header') {
            comp_children.add({
              type: 'header',
              tagName: 'h4',
              style: { 'margin-bottom': '0px' },
              content: 'Card Header'
            });
          }
          if(prop === 'card-img-overlay') {
            comp_children.add({
              type: 'header',
              tagName: 'h4',
              classes: ['card-title'],
              content: 'Card title'
            });
            comp_children.add({
              type: 'text',
              tagName: 'p',
              classes: ['card-text'],
              content: "Some quick example text to build on the card title and make up the bulk of the card's content."
            });
          }
          if(prop === 'card-body') {
            comp_children.add({
              type: 'header',
              tagName: 'h4',
              classes: ['card-title'],
              content: 'Card title'
            });
            comp_children.add({
              type: 'header',
              tagName: 'h6',
              classes: ['card-subtitle', 'text-muted', 'mb-2'],
              content: 'Card subtitle'
            });
            comp_children.add({
              type: 'text',
              tagName: 'p',
              classes: ['card-text'],
              content: "Some quick example text to build on the card title and make up the bulk of the card's content."
            });
            comp_children.add({
              type: 'link',
              classes: ['card-link'],
              href: '#',
              content: 'Card link'
            });
            comp_children.add({
              type: 'link',
              classes: ['card-link'],
              href: '#',
              content: 'Another link'
            });
          }
          this.order();
        } else if (!state) {
          existing.destroy();
        }
      },
      order() {

      }
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('kanban-board')) {
          return {type: 'kanban-board'};
        }
      }
    }),
    view: defaultView
  });

  domc.addType('card_image_top', {
    model: imageModel.extend({
      defaults: Object.assign({}, imageModel.prototype.defaults, {
        'custom-name': 'Card Image Top',
        classes: ['card-img-top'],
        'card-order': 1
      })
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('card-img-top')) {
          return {type: 'card_image_top'};
        }
      }
    }),
    view: imageView
  });

  domc.addType('card_header', {
    model: defaultModel.extend({
      defaults: Object.assign({}, defaultModel.prototype.defaults, {
        'custom-name': 'Card Header',
        classes: ['card-header'],
        'card-order': 2
      })
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('card-header')) {
          return {type: 'card_header'};
        }
      }
    }),
    view: defaultView
  });

  domc.addType('card_image', {
    model: imageModel.extend({
      defaults: Object.assign({}, imageModel.prototype.defaults, {
        'custom-name': 'Card Image',
        classes: ['card-img'],
        'card-order': 3
      })
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('card-img')) {
          return {type: 'card_image'};
        }
      }
    }),
    view: imageView
  });

  domc.addType('card_image_overlay', {
    model: defaultModel.extend({
      defaults: Object.assign({}, defaultModel.prototype.defaults, {
        'custom-name': 'Card Image Overlay',
        classes: ['card-img-overlay'],
        'card-order': 4
      })
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('card-img-overlay')) {
          return {type: 'card_image_overlay'};
        }
      }
    }),
    view: defaultView
  });

  domc.addType('card_body', {
    model: defaultModel.extend({
      defaults: Object.assign({}, defaultModel.prototype.defaults, {
        'custom-name': 'Card Body',
        classes: ['card-body'],
        'card-order': 5
      })
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('card-body')) {
          return {type: 'card_body'};
        }
      }
    }),
    view: defaultView
  });
  const kanbanTaskScript =/* function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }*/function() {
    // `this` is bound to the component element
    console.log('the element', this);

    function allowDrop(ev) {
    ev.preventDefault();
    }

    function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    }
  };
  domc.addType('kanban-task', {
    model: defaultModel.extend({
      defaults: Object.assign({}, defaultModel.prototype.defaults, {
        'custom-name': 'Kanban Task',
        classes: ['kanban-task', 'card', 'mb-3', 'bg-light'],
        draggable: ".kanban-task-canvas",
        attributes: { ondragstart: 'drag(event)' },
        propagate: ['draggable'],
        'card-order': 6,
        content: ` 
        <div class="card-body p-3">
            <div class="float-right mr-n2">
                <label class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" checked="">
                    <span class="custom-control-label"></span>
                </label>
            </div>
            <p>Curabitur ligula sapien, tincidunt non, euismod vitae, posuere imperdiet, leo. Maecenas malesuada.</p>
            <div class="float-right mt-n1">
                <img src="https://bootdey.com/img/Content/avatar/avatar6.png" width="32" height="32" class="rounded-circle" alt="Avatar">
            </div>
            <a class="btn btn-outline-primary btn-sm" href="#">View</a>
        </div>
        `,
        styles: `
        .card {
          margin-bottom: 1.5rem;
          box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,.025);
      }
      
      .card {
          position: relative;
          display: -ms-flexbox;
          display: flex;
          -ms-flex-direction: column;
          flex-direction: column;
          min-width: 0;
          word-wrap: break-word;
          background-color: #fff;
          background-clip: border-box;
          border: 1px solid #e5e9f2;
          border-radius: .2rem;
      }
      .hide {
        display: none;
    }
        `,
        script: kanbanTaskScript,
        /*script:
        `
function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}
`*/
      })
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('kanban-task')) {
          return {type: 'kanban-task'};
        }
      }
    }),
    view: defaultView
  });

  domc.addType('kanban-column', {
    model: defaultModel.extend({
      defaults: Object.assign({}, defaultModel.prototype.defaults, {
        'custom-name': 'Kanban Column',
        classes: ['kanban-column', 'col-3'],
        'card-order': 7,
        droppable: false,
        draggable: ".kanban-board-canvas",
        traits: [
          {
            type: 'text',
            placeholder: 'Title',
            label: 'Title',
            name: 'karban-column-title',
          },
        ],
        components: [
          { 
            classes: ['card', 'card-border-primary'],
            draggable: false,
            badgable: false,
            components: [
              { 
                classes: ['card-header'],
                draggable: false,
                components: [
                  { 
                    classes: ['card-actions', 'float-right'],
                    components: [
                      { content: `                <div class="dropdown show">
                      <a href="#" data-toggle="dropdown" data-display="static">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-horizontal align-middle">
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="19" cy="12" r="1"></circle>
                              <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                      </a>

                      <div class="dropdown-menu dropdown-menu-right" id="collapseExample">
                          <a class="dropdown-item" href="#">Action</a>
                          <a class="dropdown-item" href="#">Another action</a>
                          <a class="dropdown-item" href="#">Something else here</a>
                      </div>
                  </div>` },
                    ],
                    styles: `
                    .card-actions a {
                      color: #495057;
                      text-decoration: none
                    }
                    
                    .card-actions svg {
                        width: 16px;
                        height: 16px
                    }
                    
                    .card-actions .dropdown {
                        line-height: 1.4
                    }`
                  },
                  { components: `<h5 class="card-title">Upcoming</h5>` },
                  { components: `<h6 class="card-subtitle text-muted">Nam pretium turpis et arcu. Duis arcu tortor.</h6>` },
                ],
                styles: `
                .card-header:first-child {
                  border-radius: calc(.2rem - 1px) calc(.2rem - 1px) 0 0;
                }
                
                .card-header {
                    border-bottom-width: 1px;
                }
                .card-header {
                    padding: .75rem 1.25rem;
                    margin-bottom: 0;
                    color: inherit;
                    background-color: #fff;
                    border-bottom: 1px solid #e5e9f2;
                }`
              },
              { 
                classes: ['kanban-task-canvas', 'card-body', 'p-3'],
                draggable: false,
                badgable: false,
                attributes: { ondrop: 'drop(event)' , ondragover: 'allowDrop(event)'},
                components: [
                  { type: 'kanban-task' },
                  { type: 'kanban-task' },
                  { type: 'kanban-task' },
                ],
                kanbanTaskScript
              }
            ],
          }
        ]
      })
    }, {
      isComponent(el) {
        if(el && el.classList && el.classList.contains('kanban-column')) {
          return {type: 'kanban-column'};
        }
      }
    }),
    view: defaultView,
   
      
    
  });

  domc.addType('card_container', {
    model: defaultModel.extend({
      defaults: Object.assign({}, defaultModel.prototype.defaults, {
        'custom-name': 'Card Container',
        classes: ['card-group', 'container', 'p-0'],
        droppable: '.card',
        traits: [
          {
            type: 'class_select',
            options: [
              {value: 'card-group', name: 'Group'},
              {value: 'card-deck', name: 'Deck'},
              {value: 'card-columns', name: 'Columns'},
            ],
            label: 'Layout',
          }
        ].concat(defaultModel.prototype.defaults.traits)
      })
    }, {
      isComponent(el) {
        const css = Array.from(el.classList || []);
        const includes = ['card-group','card-deck','card-columns'];
        const intersection = css.filter(x => includes.includes(x));

        if(el && el.classList && intersection.length) {
          return {type: 'card_container'};
        }
      }
    }),
    view: defaultView,
    components:[{ type: 'kanban-column' },
    { type: 'kanban-column' },
    { type: 'kanban-column' },

  ]
  });

  kanbanBoard(editor.BlockManager);


}
  //do something here

  dom(editor.DomComponents, editor)
  console.log(editor)