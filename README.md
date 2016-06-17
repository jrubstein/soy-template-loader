Soy Template loader
---

Simple soy template webpack loader. It compiles a soy template without adding all the soy utils code.

Install
-----

    npm i soy-template-loader --save-dev

Example
------

    ...{
      test: /\.soy$/,
      loader: 'soy-template-loader',
      query: {
        debug: false,
        yui: true
      }
    }...

Options
------

1. debug: Adds debug lines from the compiler.
1. yui: Adds the YUI.add.


Use
------

* Template

      {namespace NAMESPACE}

      /**
       * Template description
       * @param name arguments
       */
      {template .hello}
        Hello {$name}!
      {/template}

* Javascript

      import * as template from './template.soy';

      var html = template.hello({
        name: 'name'
      });

Note: namespace is mandatory.
