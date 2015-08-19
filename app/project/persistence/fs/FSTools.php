<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 16.07.2015
 * Time: 9:34
 */

namespace app\project\persistence\fs;


use app\core\etc\Settings;

class FSTools {
    /**
     * @param $hash
     * @return string
     */
    public static function hashToPath($hash) {
        $prefix = Settings::getInstance()->get("fs", "media");
        return sprintf("%s/%s/%s", $prefix, substr($hash, 0, 1), substr($hash, 1, 1));
    }
    public static function createPathUsingHash($hash) {
        $path = self::hashToPath($hash);
        if (!is_dir($path)) {
            mkdir($path, 0766, true);
        }
    }

    /**
     * @param $hash
     * @return string
     */
    public static function hashToFullPath($hash) {
        return self::hashToPath($hash) . "/" . $hash;
    }

    /**
     * @param $filename
     * @return string
     */
    public static function calculateHash($filename) {
        return sha1_file($filename);
    }

    /**
     * @param $hash
     */
    public static function delete($hash) {
        $path = self::hashToFullPath($hash);
        if (file_exists($path)) {
            unlink(self::hashToFullPath($hash));
        }
    }
} 