<?php

namespace app\core\http;


use app\lang\option\Option;
use app\lang\singleton\Singleton;
use app\lang\singleton\SingletonInterface;
use app\lang\Tools;

class HttpRoute implements SingletonInterface {

    use Singleton;

    const DEFAULT_ROUTE = "index";

    private $route, $raw;

    function __construct() {

        $uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));
        $this->raw = substr($uri, 1) ?: self::DEFAULT_ROUTE;
        $route_array = explode("/", $this->raw);

        error_log(sprintf("::: %s :::", $this->raw));

        end($route_array); $key = key($route_array);
        $route_array[$key] = "Do" . ucfirst($route_array[$key]);
        reset($route_array);

        $this->route = CONTROLLER_PREFIX . Tools::turnSlashes(implode('/', $route_array));

        $this->default_handler = Option::None();

    }

    /**
     * @return mixed
     */
    public function getRouteClass() {
        return $this->route;
    }

    /**
     * @return mixed
     */
    public function getRouteRaw() {
        return $this->raw;
    }

}