/*
 * Copyright (c) 2017 Roman Lakhtadyr
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import angular from 'angular';
import ngRoute from 'angular-route';
import ngCookies from 'angular-cookies';
import infiniteScroll from 'ng-infinite-scroll';

import httpPostFix from '../libs/angular-post-fix';
import contextMenu from '../libs/context-menu';

import filters from './filters';

const app = angular.module("musicloud", [
  ngRoute,
  ngCookies,
  httpPostFix,
  infiniteScroll,
  contextMenu,
]);

app.run(["AccountService", "$rootScope", (AccountService, $rootScope) => {
  $rootScope.account = { authorized: false };

  $rootScope.$on("$routeChangeSuccess", (e, $route) => {
    document.title = $route.title
      ? `${route.title} - MusicLoud`
      : 'MusicLoud';
  });

  AccountService.init().then(
    user => $rootScope.account = { authorized: true, user },
    () => window.location.href = '/'
  );
}]);

filters(app);

export default app;
