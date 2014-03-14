<?php

require_once(dirname(__FILE__).'/../libs/Doctrine-1.2.4/Doctrine.php');

define('CFG_DB_DSN', 'mysql://root:badboy@localhost/test');

spl_autoload_register(array('Doctrine_Core', 'autoload'));
spl_autoload_register(array('Doctrine_Core', 'modelsAutoload'));


$database = Doctrine_Manager::connection(CFG_DB_DSN);



$manager = Doctrine_Manager::getInstance();

$manager->setAttribute(Doctrine_Core::ATTR_VALIDATE,               Doctrine_Core::VALIDATE_ALL);
$manager->setAttribute(Doctrine_Core::ATTR_AUTO_ACCESSOR_OVERRIDE, true);
$manager->setAttribute(Doctrine_Core::ATTR_AUTOLOAD_TABLE_CLASSES, true);
$manager->setAttribute(Doctrine_Core::ATTR_MODEL_LOADING,          Doctrine_Core::MODEL_LOADING_CONSERVATIVE);
Doctrine_Core::loadModels(dirname(__FILE__).'/models');





?>
