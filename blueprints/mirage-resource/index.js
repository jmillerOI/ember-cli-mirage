/* eslint-env node */

let path = require('path'),
  stringUtils = require('ember-cli-string-utils'),
  pluralize = require('pluralize'),
  fs = require('fs-extra'),
  EOL = require('os').EOL;

module.exports = {
  description: 'Generates a mirage resource.',
  isAddon: false,

  normalizeEntityName(entityName) {
    return pluralize(stringUtils.dasherize(entityName));
  },

  locals(options) {
    let entity = options.entity,
      name = entity.name,
      dashedName = `mock-${stringUtils.dasherize(pluralize(name))}`,
      fixedName = stringUtils.camelize(dashedName),
      resourceName = stringUtils.dasherize(pluralize(name));
    // Return custom template variables here.
    return {
      fixedName,
      resourceName
    };
  },

  fileMapTokens: function () {
    var self = this;
    return {
      __root__: function (options) {
        self.isAddon = options.inAddon;

        if (!!self.project.config()['ember-cli-mirage'] && !!self.project.config()['ember-cli-mirage'].directory) {
          return self.project.config()['ember-cli-mirage'].directory;
        } else if (options.inAddon) {
          return path.join('tests', 'dummy', 'mirage');
        } else {
          return '/mirage';
        }
      }
    };
  },

  afterInstall(options) {
    let entity = options.entity,
      name = entity.name,
      dashedName = `mock-${stringUtils.dasherize(pluralize(name))}`,
      fixedName = stringUtils.camelize(dashedName),
      projectPath = null,
      self = this;

    if (!!self.project.config()['ember-cli-mirage'] && !!self.project.config()['ember-cli-mirage'].directory) {
      projectPath = self.project.config()['ember-cli-mirage'].directory;
    } else if (self.isAddon) {
      projectPath = path.join('tests', 'dummy', 'mirage');
    } else {
      projectPath = '/mirage';
    }

    let file = `${projectPath}/config.js`;

    // Perform extra work here.
    let text = "import " + fixedName + " from './resources/" + pluralize(stringUtils.dasherize(name)) + "';" + EOL;
    let before = 'export default function() {\n';

    return this.insertIntoFile(file, text, {before: before}).then(() => {
      let before = '\n}\n';
      let text = `  ${fixedName}(this);` + EOL;
      return this.insertIntoFile(file, text, {before: before});
    });
  },

  afterUninstall(options) {
    let entity = options.entity,
      name = entity.name,
      dashedName = `mock-${stringUtils.dasherize(pluralize(name))}`,
      fixedName = stringUtils.camelize(dashedName),
      projectPath = null,
      self = this;

    if (!!self.project.config()['ember-cli-mirage'] && !!self.project.config()['ember-cli-mirage'].directory) {
      projectPath = self.project.config()['ember-cli-mirage'].directory;
    } else if (self.isAddon) {
      projectPath = path.join('tests', 'dummy', 'mirage');
    } else {
      projectPath = '/mirage';
    }

    let file = `${projectPath}/config.js`;

    // Perform extra work here.
    let text = EOL + "import " + fixedName + " from './resources/" + pluralize(stringUtils.dasherize(name)) + "';" + EOL;
    let func = fixedName + "\\(this\\);" + EOL;

    let source = fs.readFileSync(file, 'utf-8'),
      regex = new RegExp(text),
      functionRegex = new RegExp(func);

    let newData = source;

    if (regex.test(source)) {
      newData = newData.replace(text, '');
    }

    if (functionRegex.test(source)) {
      newData = newData.replace(functionRegex, '');
    }

    if (newData) {
      fs.writeFileSync(file, newData);
    }
  }
};
