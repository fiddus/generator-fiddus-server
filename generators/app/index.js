'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the lovely ' + chalk.red('FiddusServer') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'projectName',
      message: 'What is your project\'s name?',
      default: this.appname
    }, {
      type: 'input',
      name: 'organization',
      message: 'Enter your organization name:',
      default: this.config.get('organization') || 'fiddus'
    }, {
      type: 'input',
      name: 'projectDescription',
      message: 'Enter your project description:'
    }, {
      type: 'input',
      name: 'projectRepo',
      message: 'Enter your project repository:',
      default: (this.config.get('organization') || 'fiddus') + '/' + this.appname
    },{
      type: 'input',
      name: 'author',
      message: 'Enter project author:',
      default: this.config.get('author')
    },{
      type: 'input',
      name: 'domain',
      message: 'Enter domain from which emails will be sent:',
      default: 'fiddus.com.br'
    },{
      type: 'input',
      name: 'fromEmail',
      message: 'Enter email address that will figure in the "from" field in emails sent:',
      default: 'contato@fiddus.com.br'
    }];

    this.prompt(prompts, function (props) {
      this.props = props;
      this.config.set('author', props.author);
      this.config.set('organization', props.organization);

      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      this.fs.copy(
        this.templatePath('api'),
        this.destinationPath('api')
      );

      this.fs.copy(
        this.templatePath('auth'),
        this.destinationPath('auth')
      );

      this.fs.copyTpl(
        this.templatePath('config'),
        this.destinationPath('config'),
        this.props
      );

      this.fs.copy(
        this.templatePath('lib'),
        this.destinationPath('lib')
      );

      //this.fs.copy(
      //  this.templatePath('config/activatorConfig.js'),
      //  this.destinationPath('config/activatorConfig.js')
      //);
      //this.fs.copy(
      //  this.templatePath('config/express.js'),
      //  this.destinationPath('config/express.js')
      //);
      //this.fs.copy(
      //  this.templatePath('config/responseStuffing.js'),
      //  this.destinationPath('config/responseStuffing.js')
      //);
      //this.fs.copy(
      //  this.templatePath('config/responseTemplate.js'),
      //  this.destinationPath('config/responseTemplate.js')
      //);
      //this.fs.copy(
      //  this.templatePath('config/seeds.js'),
      //  this.destinationPath('config/seeds.js')
      //);


      this.fs.copy(
        this.templatePath('logs'),
        this.destinationPath('logs')
      );
      this.fs.copyTpl(
        this.templatePath('resources'),
        this.destinationPath('resources'),
        this.props
      );
      this.fs.copy(
        this.templatePath('app.js'),
        this.destinationPath('app.js')
      );
      this.fs.copy(
        this.templatePath('routes.js'),
        this.destinationPath('routes.js')
      );
    },

    projectfiles: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes')
      );
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copy(
        this.templatePath('jscsrc'),
        this.destinationPath('.jscsrc')
      );
      this.fs.copy(
        this.templatePath('jshintrc'),
        this.destinationPath('.jshintrc')
      );
      this.fs.copy(
        this.templatePath('nvmrc'),
        this.destinationPath('.nvmrc')
      );
      this.fs.copy(
        this.templatePath('_Gruntfile.js'),
        this.destinationPath('Gruntfile.js'),
        this.props
      );
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        this.props
      );
      this.fs.copy(
        this.templatePath('_README.md'),
        this.destinationPath('README.md'),
        this.props
      );
      this.fs.copy(
        this.templatePath('_shippable.yml'),
        this.destinationPath('shippable.yml'),
        this.props
      );
    }
  },

  install: function () {
    this.installDependencies();
  }
});
