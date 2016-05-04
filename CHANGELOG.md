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
