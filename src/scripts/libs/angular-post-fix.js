import angular from 'angular';
import { stringify } from 'querystring';

const moduleName = 'httpPostFix';

angular.module(moduleName, [], function ($httpProvider) {
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  $httpProvider.defaults.transformRequest = [
    data => angular.isObject(data) && String(data) !== '[object File]' ? stringify(data) : data
  ];
});

export default moduleName;
