# [0.8.0](https://github.com/danwkennedy/arango-datasouce/compare/0.7.0...0.8.0) (2020-09-17)


### Features

* **arangojs:** upgrade to arangojs 7.0.1 ([ae3c8ff](https://github.com/danwkennedy/arango-datasouce/commit/ae3c8ff01c7b5fd10fcd5221d08049d6bb4b3e8f))
* **readme:** document how to use the package ([70fccf0](https://github.com/danwkennedy/arango-datasouce/commit/70fccf0bcb2538afaa13078532c5d40c5c4fde2a))


### BREAKING CHANGES

* **arangojs:** arangojs 7+ has quite a few breaking changes. We've addressed the issues that look like they need to be addressed but more testing is likely necessary to make sure.



# [0.7.0](https://github.com/danwkennedy/arango-datasouce/compare/0.6.4...0.7.0) (2020-05-17)


### Features

* **dataloader:** bump dataloader to 2.0.0 ([5f24845](https://github.com/danwkennedy/arango-datasouce/commit/5f248451ec39958ba57306d02050d955f4519217))


### BREAKING CHANGES

* **dataloader:** since Dataloader's implementation of LoadMany() has changed, the same behavior changes can happen here.



## [0.6.4](https://github.com/danwkennedy/arango-datasouce/compare/0.6.3...0.6.4) (2019-08-28)



## [0.6.3](https://github.com/danwkennedy/arango-datasouce/compare/0.6.2...0.6.3) (2019-08-28)



## [0.6.2](https://github.com/danwkennedy/arango-datasouce/compare/0.6.1...0.6.2) (2019-07-19)



## [0.6.1](https://github.com/danwkennedy/arango-datasouce/compare/0.6.0...0.6.1) (2019-07-02)


### Bug Fixes

* **document datasource:** handle the correct return type for the AQL query ([69204fb](https://github.com/danwkennedy/arango-datasouce/commit/69204fb))



# [0.6.0](https://github.com/danwkennedy/arango-datasouce/compare/0.5.0...0.6.0) (2019-07-02)


### Features

* **document datasource:** add exists and manyExists calls ([9eda7d4](https://github.com/danwkennedy/arango-datasouce/commit/9eda7d4))



# [0.5.0](https://github.com/danwkennedy/arango-datasouce/compare/0.4.0...0.5.0) (2019-06-14)


### Features

* **edge manager:** add bulk operations ([b698949](https://github.com/danwkennedy/arango-datasouce/commit/b698949))



# [0.4.0](https://github.com/danwkennedy/arango-datasouce/compare/0.3.0...0.4.0) (2019-06-02)



# [0.3.0](https://github.com/danwkennedy/arango-datasouce/compare/0.2.1...0.3.0) (2019-05-29)


### Features

* **DocumentManager:** add a document manager ([d8d106b](https://github.com/danwkennedy/arango-datasouce/commit/d8d106b))
* **EdgeManager:** add an edge manager ([8b8078a](https://github.com/danwkennedy/arango-datasouce/commit/8b8078a))



## [0.2.1](https://github.com/danwkennedy/arango-datasouce/compare/0.2.0...0.2.1) (2019-05-27)


### Bug Fixes

* **document datasource:** unroll the array returned by the cursor. ([b495423](https://github.com/danwkennedy/arango-datasouce/commit/b495423))



# [0.2.0](https://github.com/danwkennedy/arango-datasouce/compare/0.1.0...0.2.0) (2019-05-14)


### Features

* **npm:** add an npmignore file ([e5c68a3](https://github.com/danwkennedy/arango-datasouce/commit/e5c68a3))



# 0.1.0 (2019-05-14)


### Features

* **datasource:** add datasource ([ca204df](https://github.com/danwkennedy/arango-datasouce/commit/ca204df))
* **document datasource:** add document datasource ([274a1d8](https://github.com/danwkennedy/arango-datasouce/commit/274a1d8))
* **eslint:** setup eslint ([f0e8b65](https://github.com/danwkennedy/arango-datasouce/commit/f0e8b65))
* **release:** automate releasing new versions ([49ec15f](https://github.com/danwkennedy/arango-datasouce/commit/49ec15f))



