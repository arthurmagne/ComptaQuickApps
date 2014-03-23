<?php
include('config.php');



define('CREDIT', 1);
define('DEBIT', 2);


function getAccounts($idUser)
{
 $query =  Doctrine_Query::create()->select('id')
          ->from('Account')
          ->where('user_id = :userId', array(":userId" => $idUser));
 $results = $query->execute();

 $accounts = array();

 for($i = 0; $i < count($results); ++$i)
   array_push($accounts, $results[$i]->id);

 // print_r($accounts);

 return $accounts;
}




function getOperations($idAccounts, $begin=0 , $end=0, $type=0, $limit=0, $paymentId=0, $tag='')
{
  $accounts = (is_array($idAccounts)) ? $idAccounts : array($idAccounts);

  $query = Doctrine_Query::create()->select('o.*, p.type_name as type_name')
          ->from('Operation o')
          ->leftJoin('o.PaymentType p')

          ->where('o.account_id IN ?', array($accounts)); 

 
  if($begin != 'all')
  {
      
    if($begin == 0 && $end == 0)
    {
      $query->addWhere('(to_days(now()) - to_days(operation_date)) < 30');
      $query->addWhere('o.operation_date <= now()');

    }
    
    
    if($begin != 0)
      $query->addWhere('o.operation_date >= ?',  array($begin));

    if($end != 0)
      $query->addWhere('o.operation_date <= ?', array($end));
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
    $query->addWhere('o.type_id = ?', array($paymentId));
  
 

  if($tag != 'undefined')
  {
     $str = '%#'.$tag.'%';
     //echo $str;

     $query->addWhere('o.operation_desc LIKE ?', array($str));
  }
  
  $query->orderBy('operation_date', 'DESC');
  
  if($limit > 0)
    $query->limit($limit);
    
  return $query->execute();  
}


function deleteOperation($idOperation)
{
  $operation = Doctrine::getTable('Operation')->findOneById($idOperation);
  $account = Doctrine::getTable('Account')->findOneById($operation->account_id);
  
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


  $account = Doctrine_Core::getTable('Account')->findOneById($idAccount);
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
    $arr[$account->id] = balanceFromAccount($account->id);
    
  return $arr;
}


//example
/*
  $operations = getOperations(2);
 
 for($i = 0; $i < $operations->count(); ++$i)
{
  echo "account: ".$operations[$i]->account_id."\n";
  echo "\t".$operations[$i]->operation_date."\n";
  echo "\tcredit : ".$operations[$i]->is_credit."\n";
  echo "\t".$operations[$i]->value."\n";
  echo "\t".$operations[$i]->type_name."\n";
  
}
*/

?>