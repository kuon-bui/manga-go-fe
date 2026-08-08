# Changelog

## [0.2.0](https://github.com/kuon-bui/manga-go-fe/compare/v0.1.0...v0.2.0) (2026-08-08)


### Features

* add comprehensive documentation and guidelines for Manga Go frontend ([138cc61](https://github.com/kuon-bui/manga-go-fe/commit/138cc61b446d479f3513866fcb6340b407ec5073))
* add content discovery ([03a189d](https://github.com/kuon-bui/manga-go-fe/commit/03a189df420f7e6c8a2f1a3dacf8afcd87ab5c1a))
* add notification poll ([b7da7f7](https://github.com/kuon-bui/manga-go-fe/commit/b7da7f7db4f34c7ad54b35c544395011707b07af))
* add readers ([348a932](https://github.com/kuon-bui/manga-go-fe/commit/348a932e31016fcd32f1c59bc089d13d7bd787c1))
* add redesign plan for Sakura Kawaii theme migration ([8ad4f66](https://github.com/kuon-bui/manga-go-fe/commit/8ad4f66b5516522b24136174556b63cdab7cc549))
* add state management documentation and improve UI components ([aca2c2f](https://github.com/kuon-bui/manga-go-fe/commit/aca2c2f4933d070efc6a30e1c4723ad11dac8a49))
* add translator dashboard ([87750c5](https://github.com/kuon-bui/manga-go-fe/commit/87750c5a1e3322a5ecc6225a0ab4322caa045f5d))
* **authz:** add admin authorization management UI ([#11](https://github.com/kuon-bui/manga-go-fe/issues/11)) ([af6f8aa](https://github.com/kuon-bui/manga-go-fe/commit/af6f8aa93d4567cddc9c112d1c29ab3adfde7fdf))
* enhance API client with comics, chapters, authors, tags, and RBAC functionalities ([1512517](https://github.com/kuon-bui/manga-go-fe/commit/1512517cc71ccc84c630163dbb8b4162b2aa171d))
* enhance chapter image upload functionality with chapterSlug and pageIdx parameters ([213431e](https://github.com/kuon-bui/manga-go-fe/commit/213431edfc55e2637ac5bbad82f4f9280253a902))
* enhance notification system with delete functionality and improve UI interactions ([#10](https://github.com/kuon-bui/manga-go-fe/issues/10)) ([fb5f278](https://github.com/kuon-bui/manga-go-fe/commit/fb5f278a3de2043c4366b60dc27c456a26066051))
* enhance rating functionality with average score calculation and submission handling ([#9](https://github.com/kuon-bui/manga-go-fe/issues/9)) ([4c784df](https://github.com/kuon-bui/manga-go-fe/commit/4c784df4680045c01696dadf6602c815e30424ab))
* implement comprehensive comment system with optimistic updates and permission-based access control ([eda6246](https://github.com/kuon-bui/manga-go-fe/commit/eda6246f76628496d763a199efdb441fc5206a32))
* implement comprehensive dashboard components, custom hooks, and API client for group management and content viewing ([dde39d8](https://github.com/kuon-bui/manga-go-fe/commit/dde39d8049e270e79a2f5a25cdbec4c35e19ae2b))
* implement core dashboard, reader, and layout components with associated API hooks and management views ([ef36b4c](https://github.com/kuon-bui/manga-go-fe/commit/ef36b4ce119cb6132fc3a8d01d41700c9f6664f9))
* implement core manga platform components including dashboard, reader, library, and authentication modules ([7e444ff](https://github.com/kuon-bui/manga-go-fe/commit/7e444ffe9b73fd1a98b3b59f2f717b24d0114e5f))
* implement core UI components and layouts for admin, dashboard, and manga browsing pages ([d5355de](https://github.com/kuon-bui/manga-go-fe/commit/d5355de960aeba3fc886082118d3f90bcfa53851))
* implement core UI components, layout structure, and manga reader functionality with theme persistence ([09c6ae2](https://github.com/kuon-bui/manga-go-fe/commit/09c6ae20bbb4ad3d25990d5a5545d6ca91923d28))
* implement dashboard chapter upload flow and file proxy route ([6d1a90d](https://github.com/kuon-bui/manga-go-fe/commit/6d1a90de6119094ceee6b291e01b9b08888c1eea))
* implement dashboard management hooks and UI components for titles, chapters, and translation groups ([02a387d](https://github.com/kuon-bui/manga-go-fe/commit/02a387d7b474696fcc91efb0f5f27aae7aed7036))
* implement dashboard upload form and core reader application routes and components ([b157c5b](https://github.com/kuon-bui/manga-go-fe/commit/b157c5b46fcd8eea06c3605af701a3119236dd5a))
* implement image proxy and SafeImage component to bypass local CORS and optimization restrictions ([002a322](https://github.com/kuon-bui/manga-go-fe/commit/002a3229c22951d4fada3eeabab483a7ad1348fd))
* implement Kawaii reader UI mode with sidebars and custom controls ([0ace657](https://github.com/kuon-bui/manga-go-fe/commit/0ace6579dd3b4d8e934bbd2009e804e11da24a63))
* implement manga reader components, home sections, and comment system with state management ([71c0e22](https://github.com/kuon-bui/manga-go-fe/commit/71c0e22a15a157c76d880afe646ea99f82698187))
* implement RBAC system with role/permission management, admin dashboard, and authentication integration ([e4a7c33](https://github.com/kuon-bui/manga-go-fe/commit/e4a7c33a275407483e6c50b828f4de25857f920e))
* integrate web-toon-weaver project, add home sections, and initialize git hooks ([4468ee1](https://github.com/kuon-bui/manga-go-fe/commit/4468ee10ea0fca8c92b9c754904e87da00efc95d))
* update chapter timestamps to use publishedAt and enhance type definitions for recent updates ([#8](https://github.com/kuon-bui/manga-go-fe/issues/8)) ([42ec99b](https://github.com/kuon-bui/manga-go-fe/commit/42ec99ba3646e13af46d34d638f2993335d16a42))


### Bug Fixes

* fix lint warning ([01c31e6](https://github.com/kuon-bui/manga-go-fe/commit/01c31e6b4e817f67ddb44d8fb884d232391db61b))
* fix runtime error ([f34dbaa](https://github.com/kuon-bui/manga-go-fe/commit/f34dbaa9bd5efd85d9eada574d088b19fc270632))
* update API endpoint in useRecentComments to fetch new comments ([1332765](https://github.com/kuon-bui/manga-go-fe/commit/1332765fdf4e5e938ca90711d09f1d5f7f76ed90))


### Refactoring

* remove mock handlers for auth, comments, dashboard, and manga; update library and notification handlers to bypass to real backend ([56176d6](https://github.com/kuon-bui/manga-go-fe/commit/56176d6bc2d4e6c7be7a688d5a3c2e490c893da2))
* update comment hook scope validation and pass comic/chapter identifiers to page components ([f53ded8](https://github.com/kuon-bui/manga-go-fe/commit/f53ded8d0ac67020a9dbfd22c9f82c653fa8993b))


### Documentation

* Add claude.MD guide for AI assistants ([43fd0f7](https://github.com/kuon-bui/manga-go-fe/commit/43fd0f727cc9a2fa1b773dc11688f1e3a30e2c64))
* Add claude.MD guide for AI assistants ([0d5e702](https://github.com/kuon-bui/manga-go-fe/commit/0d5e702210bca5c823f6c5038dfc703991e3c415))
* add prd and tech design ([#5](https://github.com/kuon-bui/manga-go-fe/issues/5)) ([f33ab3f](https://github.com/kuon-bui/manga-go-fe/commit/f33ab3fd8f72b688f5a9553efd863e37e5c396d8))
* Create comprehensive documentation for coding conventions ([21f09cf](https://github.com/kuon-bui/manga-go-fe/commit/21f09cfb018b97363b19ad003e26bdb7087a201e))
