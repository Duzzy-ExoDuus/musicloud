<?php

use app\core\view\JsonResponse;
use app\core\view\TinyView;
use app\lang\Arrays;

require_once "constants.php";
require_once "core/shortcuts.php";

// Registering base class loader
spl_autoload_register(function ($class_name) {
    $filename = str_replace("\\", "/", $class_name) . '.php';
    if (file_exists($filename)) {
        require_once $filename;
    }
});

// Registering additional class loader for libraries
spl_autoload_register(function ($class_name) {
    $filename = LIBRARIES_PATH . str_replace("\\", "/", $class_name) . '.php';
    if (file_exists($filename)) {
        require_once $filename;
    }
});

// Set global exception handler
set_exception_handler(function (Exception $exception) {
    http_response_code(400);
    if (JsonResponse::hasInstance()) {
        JsonResponse::getInstance()->write(array(
            "error"         => Arrays::last(explode("\\", get_class($exception))),
            "message"       => $exception->getMessage(),
            "description"   => $exception->getTraceAsString()
        ));
    } else {
        TinyView::show("error.tmpl", array(
            "title"         => Arrays::last(explode("\\", get_class($exception))),
            "message"       => $exception->getMessage(),
            "description"   => $exception->getTraceAsString()
        ));
    }
});

// Scan autorun directory for executable scripts
foreach (scandir(AUTORUN_SCRIPTS_PATH) as $file) {
    if ($file == "." || $file == "..")
        continue;
    require_once AUTORUN_SCRIPTS_PATH . $file;
}

