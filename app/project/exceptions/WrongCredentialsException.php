<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 16.07.2015
 * Time: 15:38
 */

namespace app\project\exceptions;


class WrongCredentialsException extends BackendException {
    public function __construct() {
        parent::__construct("Incorrect email or password", 403);
    }
} 