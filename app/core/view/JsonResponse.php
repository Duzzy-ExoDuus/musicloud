<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 16.07.2015
 * Time: 15:47
 */

namespace app\core\view;


use app\core\injector\Injectable;
use app\lang\singleton\Singleton;
use app\lang\singleton\SingletonInterface;

class JsonResponse implements SingletonInterface, Injectable {

    use Singleton;

    const MIME = "application/json";
    const DEFAULT_RESULT = "OK";
    const DEFAULT_RESPONSE_CODE = 200;

    private $data;
    private $http_response_code;

    protected function __construct() {

        register_shutdown_function(function () {

            ob_start("ob_gzhandler");

            header("Content-Type: ".self::MIME."; charset=".DEFAULT_CHARSET);

            http_response_code($this->http_response_code ?: self::DEFAULT_RESPONSE_CODE);

            echo json_encode($this->data ?: self::DEFAULT_RESULT, JSON_UNESCAPED_UNICODE);

        });

    }

    public function write($object, $http_response_code = self::DEFAULT_RESPONSE_CODE) {

        $this->data = $object;
        $this->http_response_code = $http_response_code;

    }

} 