<?php 


require_once("config.php");

Doctrine_Core::dropDatabases();


Doctrine_Core::createDatabases();


Doctrine_Core::generateModelsFromYaml(dirname(__FILE__).'/schem.yml', 'models', array('generateTableClasses' => true));

Doctrine_Core::createTablesFromModels(dirname(__FILE__).'/models');


$arrayPayment = array ("Cheque", "Carte bleue", "Liquide", "Virement", "Moneo");

foreach($arrayPayment as $current)
{
  $paymentType = new PaymentType();
  $paymentType->type_name = $current;
  $paymentType->save();
}

?>