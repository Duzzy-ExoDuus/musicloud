<?php
/**
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

namespace app\project\handlers\fixed\cron;

use app\core\logging\Logger;
use app\libs\WaveformGenerator;
use app\project\handlers\base\BaseCronRouteHandler;
use app\project\persistence\db\dao\SongDao;
use app\project\persistence\db\tables\TSongs;
use app\project\persistence\fs\FileServer;
use malkusch\lock\mutex\FlockMutex;

class DoGeneratePeaks extends BaseCronRouteHandler
{
    public function doPost()
    {
        (new FlockMutex(fopen(__FILE__, 'r')))->synchronized(function () {
            SongDao::scopeWithoutPeaks()
                ->eachRow(function ($row) {
                    Logger::printf("Creating peaks for file: %s", $row[TSongs::FILE_NAME]);
                    $peaks = WaveformGenerator::generate(FileServer::getFileUsingId($row[TSongs::FILE_ID]));
                    $file_id = FileServer::registerByContent(json_encode($peaks), "application/json");
                    SongDao::updateSongUsingId($row[TSongs::ID], [TSongs::PEAKS_ID => $file_id]);
                });
        });
    }
}
