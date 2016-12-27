# 2.0.2

* Better handling of spaces within at-rule parameters.

# 2.0.1

* Update `hast-util-to-html` to version 3.
* Resolves an issue where named functions inside at-rule parameters would not
  be properly highlighted.

# 2.0.0

* Adds the ability to render a virtual DOM. A new option, `stringify` is
  provided, which will yield the internal HAST to the supplied function. By
  default this uses `hast-util-to-html`, so that you can use Midas to render
  HTML as before. But, if `false` is passed instead, Midas will return the HAST
  instead of a string; this makes it easy to use in libraries that rely on
  virtual DOM, such as React.

## Breaking changes

* The main `midas` export is now a constructor function `Midas` which accepts
  an options object, and exposes a `.stringifier` property for PostCSS usage
  and a `process` method for other usage.
* Midas cannot be passed in directly to PostCSS anymore, you must instantiate
  it and then pass the instance's `stringifier` property to PostCSS.
* The `wrap` option will now wrap the root `<code></code>` node with
  `<pre class="midas"></pre>`. Unlike before, setting this to `false` will not
  remove the `<code></code>` from the string, as virtual DOM requires a single
  root element.
* The CLI for this module does not make sense now that Midas can yield virtual
  DOM as well as the previous behaviour of returning a string. It has been
  removed entirely.

# 1.2.2

* midas did not properly parse certain custom media queries and would crash
  in certain cases; this has now been fixed.

# 1.2.1

* Update postcss-value-parser to v3.3.0.
* Update postcss-selector-parser to v2.0.0.
* midas will now render spaces before/after function parentheses accurately.
  e.g. filter: blur( 5px ) will now render with the extra spaces.
* Now compiled with Babel 6.

# 1.2.0

* Adds a `wrap` option to enable configuration of the HTML container used
  by midas.
* Bump dependencies.

# 1.1.2

* Fixes parsing of media query parameters since the recent update to
  postcss-value-parser.

# 1.1.1

* CLI command was added to the npm distribution.

# 1.1.0

* midas can now be consumed by an existing PostCSS instance.

# 1.0.0

* Initial release.
