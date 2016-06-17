var loaderUtils = require('loader-utils'),
  Promise = require('bluebird'),
  soynode = Promise.promisifyAll(require('soynode')),
  fs = Promise.promisifyAll(require('fs')),
  rimrafAsync = Promise.promisify(require('rimraf')),
  path = require('path'),
  EOL = require('os').EOL;

module.exports = function(source) {
  var query = loaderUtils.parseQuery(this.query),
    callback = this.async(),
    tempDir = path.join(__dirname, Date.now() + ''),
    namespace = /\{namespace\s+(.*?)\}/.exec(source)[1],
    filename = path.basename(this.resourcePath, '.soy'),
    yuiAdd = '',
    debug = 'var goog = {};';


  if (query.yui) {
    yuiAdd = [
      'var Y;',
      'YUI.add(\'' + filename + '\', function(Y1) {',
      '  Y = Y1;',
      '}, \'1.0.0\', {',
      '  \'requires\': [\'wt2-templates\']',
      '});',
    ].join(EOL);
  }

  if (query.debug) {
    debug += EOL + 'goog.DEBUG = true';
  }

  this.cacheable && this.cacheable();
  soynode.setOptions({
		outputDir: '/',
		uniqueDir: false,
		eraseTemporaryFiles: false
	});

  fs.mkdirAsync(tempDir)
	// Get the temp directory path
	.then(function() {
		dirPath = tempDir;
		// Handle drive letters in windows environments (C:\)
		if (dirPath.indexOf(':') !== -1) {
			dirPath = dirPath.split(':')[1];
		}
		return path.join(dirPath, 'source.soy');

	// Write the raw source template into the temp directory
	}).then(function(soyPath) {
		return fs.writeFileAsync(path.resolve(soyPath), source).return(soyPath);

	// Run the compiler on the raw template
	}).then(function(soyPath) {
		return soynode.compileTemplateFilesAsync([soyPath]).return(soyPath);

	// Read the newly compiled source
	}).then(function(soyPath) {
		return fs.readFileAsync(path.resolve(soyPath) + '.js');

	// Return utils and module return value, shimmed for module encapsulation.
	}).then(function(template) {
		return callback(null, [
      yuiAdd,
      debug,
			template,
			'module.exports = ' + namespace + ';'
		].join(EOL));
	// Handle any errors
	}).catch(function(e) {
		return callback(e);
	// Cleanup temp directory
	}).finally(function(template) {
		return rimrafAsync(tempDir).return(template);
	});
};
