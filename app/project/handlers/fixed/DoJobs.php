<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 06.08.2015
 * Time: 10:19
 */

namespace app\project\handlers\fixed;


use app\core\db\builder\SelectQuery;
use app\core\logging\Logger;
use app\core\router\RouteHandler;
use app\libs\WaveformGenerator;
use app\project\models\single\LoggedIn;
use app\project\persistence\db\dao\SongDao;
use app\project\persistence\db\tables\TSongs;
use app\project\persistence\fs\FileServer;

class DoJobs implements RouteHandler {
    public function doGet(LoggedIn $me) {
        if ($me->getId() === 0) {
            $jobs = (new SelectQuery(TSongs::_NAME))
                ->where(TSongs::PEAKS . " IS NULL")
                ->where(TSongs::FILE_ID . " IS NOT NULL")
                ->limit(50);
            $jobs->eachRow(function ($row) {
                set_time_limit(30);
                Logger::printf("Creating peaks for file: %s", $row[TSongs::FILE_NAME]);
                $peaks = WaveformGenerator::generate(FileServer::getFileUsingId($row[TSongs::FILE_ID]));
                Logger::printf("Peaks count: %d", count($peaks));
                SongDao::updateSongUsingId($row[TSongs::ID], [
                    "peaks" => "{" . implode(",", $peaks) . "}"
                ]);
            });
        }
    }
} 