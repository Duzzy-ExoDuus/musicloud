<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 06.05.15
 * Time: 20:21
 */

namespace app\project\libs;


use app\core\etc\Settings;
use app\lang\option\Option;
use app\lang\option\Some;

// todo: fix cp1251 charset support

class FFProbe {

    /** @var Settings */
    private static $settings;

    public static function class_init() {
        self::$settings = resource(Settings::class);
    }

    /**
     * Reads album cover from audio file if possible.
     *
     * @param $filename
     * @return Option
     */
    public static function readTempCover($filename) {

        $escaped_filename = escapeshellarg($filename);
        $temp_cover = sprintf("%s/%s.jpg",
            self::$settings->get("fs", "temp"), "cover_" . md5(rand(0, 1000000000))
        );

        $command = sprintf("%s -i %s -v quiet -an -vcodec copy %s",
            self::$settings->get("tools", "ffmpeg_cmd"), $escaped_filename, $temp_cover);

        exec($command, $result, $status);

        if (file_exists($temp_cover)) {
            delete_on_shutdown($temp_cover);
            return Option::Some($temp_cover);
        } else {
            return Option::None();
        }

    }

    /**
     * Reads audio file metadata and returns Metadata object.
     *
     * @param string $filename
     * @return Some
     */
    public static function read($filename) {

        $escaped_filename = escapeshellarg($filename);

        $command = sprintf("%s -i %s -v quiet -print_format json -show_format",
            self::$settings->get("tools", "ffprobe_cmd"), $escaped_filename);

        exec($command, $result, $status);

        if ($status != 0) {
            return Option::None();
        }

        $json = Option::Some(json_decode(implode("", $result), true));

        $o_format = $json->sel("format");
        $o_tags = $o_format->sel("tags");

        $object = new Metadata();

        $object->filename           = $o_format->sel("filename")     ->get();
        $object->format_name        = $o_format->sel("format_name")  ->get();
        $object->duration           = $o_format->sel("duration")     ->map("doubleval")->get();
        $object->size               = $o_format->sel("size")         ->toInt()->get();
        $object->bitrate            = $o_format->sel("bit_rate")     ->toInt()->get();

        $object->meta_artist        = $o_tags->sel("artist")         ->map([self::class, "cp1252dec"])->orEmpty();
        $object->meta_title         = $o_tags->sel("title")          ->map([self::class, "cp1252dec"])->orEmpty();
        $object->meta_genre         = $o_tags->sel("genre")          ->map([self::class, "cp1252dec"])->orEmpty();
        $object->meta_date          = $o_tags->sel("date")           ->map([self::class, "cp1252dec"])->orEmpty();
        $object->meta_album         = $o_tags->sel("album")          ->map([self::class, "cp1252dec"])->orEmpty();
        $object->meta_track_number  = $o_tags->sel("track")          ->map([self::class, "cp1252dec"])->orEmpty();
        $object->meta_album_artist  = $o_tags->sel("album_artist")   ->map([self::class, "cp1252dec"])->orEmpty();
        $object->is_compilation     = $o_tags->sel("compilation")    ->toInt()->getOrElse(0);

        return Option::Some($object);

    }

    /**
     * Converts text from CP1251 to UTF-8 encoding.
     *
     * @param $chars
     * @return string
     */
    static function cp1252dec($chars) {

        $test = @iconv("UTF-8", "CP1252", $chars);

        if (is_null($test)) {
            return $chars;
        } else {
            return iconv("CP1251", "UTF-8", $test);
        }

    }

}