<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 09.08.15
 * Time: 20:24
 */

namespace app\project\handlers\fixed\api\catalog;


use app\core\db\builder\SelectQuery;
use app\core\etc\Context;
use app\core\router\RouteHandler;
use app\core\view\JsonResponse;
use app\lang\option\Option;
use app\project\models\single\LoggedIn;
use app\project\persistence\db\tables\TSongs;

class DoCompilations implements RouteHandler {
    public function doGet(Option $q, LoggedIn $me) {

        $filter = $q->map("trim")->reject("");

        $query = (new SelectQuery(TSongs::_NAME))
            ->where(TSongs::USER_ID, $me->getId())
            ->where(TSongs::IS_COMP, "1")
            ->select(TSongs::T_ALBUM)
            ->select(TSongs::A_ARTIST)
            ->selectAlias("MIN(".TSongs::C_BIG_ID.")", TSongs::C_BIG_ID)
            ->selectAlias("MIN(".TSongs::C_MID_ID.")", TSongs::C_MID_ID)
            ->selectAlias("MIN(".TSongs::C_SMALL_ID.")", TSongs::C_SMALL_ID);

        Context::contextify($query);

        if ($filter->nonEmpty()) {
            $query->where(TSongs::FTS_ALBUM . " @@ plainto_tsquery(?)", [$filter->get()]);
        }

        $query->addGroupBy(TSongs::A_ARTIST);
        $query->addGroupBy(TSongs::T_ALBUM);

        $query->orderBy(TSongs::T_ALBUM);

        ob_start("ob_gzhandler");

        header("Content-Type: application/json; charset=utf8");

        echo '{"albums":[';

        $query->eachRow(function ($row, $id) {
            if ($id != 0) {
                echo ",";
            }
            echo json_encode($row, JSON_UNESCAPED_UNICODE);
        });

        echo ']}';

    }
}