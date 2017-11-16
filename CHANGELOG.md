
<a name="0.6.0"></a>
## [0.5.2](https://github.com/miter-framework/miter/compare/0.5.1...0.5.2) (2017-11-15)

### Breaking Changes

* **angular:** remove dependence on @angular and zone.js completely.
  - Remove modules.
  - Remove pluralize pipe.
  - Remove @angular@* and zone.js peer dependencies.
  - *Note:* this module still depends on rxjs. In order to avoid importing it twice, it is
    listed as a peer dependency in the package.json.



<a name="0.5.1"></a>
## [0.5.1](https://github.com/miter-framework/miter/compare/0.5.0...0.5.1) (2017-10-28)

### Features

* **search-results:** add .error helper method to return an error SearchResults object



<a name="0.5.0"></a>
## [0.5.0](https://github.com/miter-framework/miter/compare/0.1.8...0.5.0) (2017-10-27)

### Features

* **search-results:** add .empty helper method to return an empty SearchResults object



<a name="0.1.8"></a>
## [0.1.8](https://github.com/miter-framework/miter/compare/0.1.7...0.1.8) (_A While Ago_)

### Features

* **crud-service:** make get, findOne, create, and update return Result<T> instead of T | null



<a name="0.1.7"></a>
## [0.1.7](https://github.com/miter-framework/miter/compare/0.1.5...0.1.7) (2017-04-28)

### Features

* **repository:** add CHANGELOG.md to record changes between versions
* **crud-service:** add findOne helper method
* **crud-service:** refactor duplicated code into extensible methods
* **crud-service:** serialize params and queryParams and remove unnecessary model information



<a name="0.1.5"></a>
## [0.1.5](https://github.com/miter-framework/miter/tree/0.1.5) (2017-04-13)

Changes before this point in time have not been recorded here.
