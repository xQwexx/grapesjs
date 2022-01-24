import Backbone from 'backbone';
module.exports = {
  storageMock() {
    var db = {};
    return {
      id: 'testStorage',
      store(data) {
        db = data;
      },
      load(keys) {
        return db;
      },
      getDb() {
        return db;
      }
    };
  },

  mockEditor: {
    ...Backbone.Events,
    get(id) {
      switch (id) {
        case 'Canvas':
          return {
            getElement: () => ({}),
            getWrapperEl: () => ({}),
            getFrameEl: () => ({}),
            getToolsEl: () => ({}),
            getBody: () => ({})
          };
        case 'Editor':
          return { ...Backbone.Events };
        default:
      }
      return null;
    },
    logWarning() {},
    config: { stylPrefix: '' },
    getConfig() {
      return this.config;
    }
  }
};
