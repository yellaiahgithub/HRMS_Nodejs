const Store = require('data-store');

const store = new Store({ path: './logLevel/log.json' });

/* Use dummy config data for now.
   In the future, need to pull the config and update in local files
   Could test with some S3 files

   If no log field found in cache or cache is in different format.
 */
if (!store.has('log') || !store.get('log').category || !store.get('log').category.general) {
  store.set('log', {
    category: {
      api: {
        critical: false,
        error: false,
        warning: false,
        info: true,
        debug: false
      },
      security: {
        critical: true,
        error: true,
        warning: false,
        info: true,
        debug: false
      },
      session: {
        critical: false,
        error: false,
        warning: false,
        info: true,
        debug: false
      },
      general: {
        critical: true,
        error: true,
        warning: true,
        info: true,
        debug: true
      }
    }
  });
}

module.exports = store;
