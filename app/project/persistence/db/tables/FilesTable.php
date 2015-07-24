<?php
/**
 * Created by PhpStorm.
 * User: Roman
 * Date: 16.07.2015
 * Time: 10:27
 */

namespace app\project\persistence\db\tables;


class FilesTable {

    const TABLE_NAME            = "files";

    const ID                    = "id";
    const SHA1                  = "sha1";
    const SIZE                  = "size";
    const USED                  = "used";

    const ID_FULL               = self::TABLE_NAME . "." . self::ID;
    const SHA1_FULL             = self::TABLE_NAME . "." . self::SHA1;
    const SIZE_FULL             = self::TABLE_NAME . "." . self::SIZE;
    const USED_FULL             = self::TABLE_NAME . "." . self::USED;

} 