'use strict';

module.exports = {
	// Test specific source files
	tests: ['src/**/*.spec.js', 'src/**/*.spec.ts'],
	e2e: ['e2e/**/*.spec.js'],

	models: ['src/**/*.model!(.spec).js', 'src/**/*.model!(.spec).ts'],
	routes: ['src/**/*.routes!(.spec).js', 'src/**/*.routes!(.spec).ts'],
	sockets: ['src/**/*.socket!(.spec).js'],
	config: ['src/**/*.config!(.spec).js'],
	docs: ['src/**/*/*.components.yml']
};
