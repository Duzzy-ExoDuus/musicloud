<?php
/**
 * Created by PhpStorm
 * User: Roman
 * Date: 16.07.2015
 * Time: 9:38
 */

namespace app\project\handlers\fixed;


use app\core\http\HttpSession;
use app\core\router\RouteHandler;
use app\project\models\single\LoggedInUserModel;

class DoIndex implements RouteHandler {
    public function doGet(LoggedInUserModel $userModel) {
        echo $userModel;
    }
}