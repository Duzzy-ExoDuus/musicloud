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

const removeContextMenu = () => {
  const $ = angular.element;
  const menu = $("body > .menu-context");

  if (menu.length > 0) {
    menu.remove();
  }
};

const showContextMenu = ($menu) => {
  const $ = angular.element;
  removeContextMenu();
  $("body").prepend($menu);
  return $menu;
};

const createMenu = (data, isSubMenu) => {
  const $ = angular.element;
  const $menu = $("<ul>");

  $menu.addClass("menu-context");

  if (isSubMenu === true) {
    $menu.addClass("menu-context-sub")
  }

  for (const item of data) {
    switch (item.type) {
      case "divider":
        $menu.append($("<li>").addClass("menu-divider"));
        break;
      case "header":
        $menu.append($("<li>").addClass("menu-header").html(item.text));
        break;
      case "sub":
        $menu.append(
          $("<li>")
            .addClass("menu-sub-menu")
            .append('<i class="fa fa-caret-right"></i>')
            .append(item.text)
            .append(createMenu(item.data, true))
        );
        break;
      case "item":
        sub = $("<li>").addClass("menu-item");
        if (typeof item.href === "string") {
          sub.append($("<a>").attr("ng-href", item.href).html(item.text));
        } else if (typeof item.action === "function") {
          sub.bind("click", item.action).html(item.text);
        } else {
          sub.html(item.text);
        }
        $menu.append(sub);
        break;
      default:
        throw "Incorrect menu item"
    }
  }

  return $menu;
};

const moduleName = 'MLContextMenu';
const module = angular.module(moduleName, []);

module.run([() => {
  const $ = angular.element;
  $(document).bind("click", function (event) {
    if ($("body > .menu-context").length > 0) {
      removeContextMenu();
    }
  });
}]);

module.directive("mlContextMenu", ["$compile", ($compile) => {
  return {
    restrict: "A",
    link: (scope, elem, attrs) => {
      elem.bind("contextmenu", function (event) {

        const data = scope.$eval(attrs.mlContextMenu);
        let $menu;

        event.preventDefault();
        event.stopPropagation();

        if (data === null) {
          return;
        }

        $menu = showContextMenu(createMenu(data, false));
        $menu.css({
          top: event.pageY,
          left: event.pageX - 13
        });

        $compile($menu)(scope);

      });

    }
  }
}]);

export default moduleName;
