<?php
include('config.php');



define('CREDIT', 1);
define('DEBIT', 2);

function getAccounts($idUser)
{
 $query =  Doctrine_Query::create()->select('account_id')
				  ->from('Account')
				  ->where('user_id = :userId', array(":userId" => $idUser));
 $results = $query->execute();

 $accounts = array();

 for($i = 0; $i < count($results); ++$i)
   array_push($accounts, $results[$i]->account_id);

 // print_r($accounts);

 return $accounts;
}



function getOperations($idAccounts, $begin=0 , $end=0, $type=0, $limit=0, $paymentId=0, $tag=0)
{

  $accounts = (is_array($idAccounts)) ? $idAccounts : array($idAccounts);



  $query = Doctrine_Query::create()->select('o.*, p.type_name as type_name')
				  ->from('Operation o')
				  ->leftJoin('o.PaymentType p')
				  ->where('o.account_id IN ?', array($accounts));
				//  ->where('o.account_id = :idAccount', array(":idAccount" => $accounts[0]));
 

 
  if($begin != 'all')
  {
      
    if($begin == 0 && $end == 0)
    {
      $query->addWhere('(to_days(now()) - to_days(operation_date)) < 30');

    }
    
    
    
    if($begin != 0)
      $query->addWhere('o.operation_date >= :beginDate',  array(':beginDate' => $begin));
								  
    if($end != 0)
      $query->addWhere('o.operation_date <= :endDate', array(':endDate' => $end));
   }
								
  switch($type)
  {
    case CREDIT:
      $query->addWhere('o.is_credit');
      break;
    case DEBIT:
      $query->addWhere('NOT o.is_credit');
      break;
  }
  
  if($paymentId != 0)
    $query->addWhere('p.type_id = :paymentId', array(':paymentId' => $paymentId));
  
  if($tag != 0)
    $query->addWhere('o.operation_desc LIKE %:tag%', array(':tag' => $tag));
  
  $query->orderBy('operation_date', 'DESC');
  
  if($limit > 0)
    $query->limit($limit);
    
  return $query->execute();  
}


/*
function getOperationsByUser($idUser, $limit = 0)
{

  $query = Doctrine_Query::create()->select('o.*, p.type_name as type_name')
				  ->from('Operation o')
				  ->leftJoin('User u')
				  ->where('u.user_id = :idUser', array(":idUser" => $idUser))
				  ->addWhere('to_days(now()) - to_days(operation_date)')
				  ->orderBy('operation_date', 'DESC');
  
  if($limit > 0)
    $query->limit($limit);
    
  return $query->execute();  
}

*/

function deleteOperation($idOperation)
{
  $operation = Doctrine::getTable('Operation')->findOneById($idOperation);
  $account = Doctrine::getTable('Account')->findOneByAccount_id($operation->account_id);
  
  $account->balance += ($operation->is_credit) ? -($operation->value) : $operation->value;
  $account->save();
  
  $operation->delete();
}




function operation($isCredit, $idAccount, $value, $payment_id="", $operation_name="", $operation_desc="", $date=0)
{
  //check idAccount ?
  //check payment
  
  $operation = new Operation();
  $operation->account_id = $idAccount;
  $operation->is_credit = $isCredit;
  $operation->value = $value;
  $operation->operation_name = $operation_name;
  $operation->operation_desc = $operation_desc;
  
  if($payment_id != 0)
     $operation->type_id = $payment_id;

  //if date isn't set, use today's date with format "yyyy/mm/dd"
  $operation->operation_date = ($date == 0) ? date('Y-m-d') : $date;

  
  $operation->save();


  $account = Doctrine_Core::getTable('Account')->findOneByAccount_id($idAccount);
  $account->balance += ($isCredit) ? $value : -($value);
  $account->save();

  return $operation;
}



function debit($idAccount, $value, $payment_id="", $operation_name="", $operation_desc="", $date=0)
{
  operation(FALSE, $idAccount, $value, $payment_id, $operation_name, $operation_desc, $date);
}

function credit($idAccount, $value, $payment_id="", $operation_name="", $operation_desc="", $date=0)
{
  operation(TRUE, $idAccount, $value, $payment_id, $operation_name, $operation_desc, $date);
}


//cache previous balance ??
function balanceFromAccount($idAccount)
{
  $q =  Doctrine_Query::create()->select('SUM(value) as total')->from('Operation o')
	      ->where('o.account_id = :idAccount', array(":idAccount" => $idAccount))
	      ->groupBy('is_credit')->orderBy('is_credit')->execute();

  $debit = $q[0]->total;
  $credit = $q[1]->total;
	      
	      

  return $credit - $debit;
}

function balanceFromUser($idUser)
{
  $accounts = getAccounts($idUser);
  $arr = array();
  foreach($accounts as $account)
    $arr[$account->account_id] = balanceFromAccount($account->account_id);
    
  return $arr;
}


//example
/*
  $operations = getOperations(1, 0, 0, DEBIT);
 
 for($i = 0; $i < $operations->count(); ++$i)
{
  echo "account: ".$operations[$i]->account_id."\n";
  echo "\t".$operations[$i]->operation_date."\n";
  echo "\tcredit : ".$operations[$i]->is_credit."\n";
  echo "\t".$operations[$i]->value."\n";
  echo "\t".$operations[$i]->type_name."\n";
  
}*/



?>