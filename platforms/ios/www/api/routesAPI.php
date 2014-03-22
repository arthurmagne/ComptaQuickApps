
<?php
require_once 'vendor/autoload.php';
#require 'vendor/slim/slim/Slim/Middleware/HttpBasicAuth.php';
require_once 'php/functions.php';
require_once 'php/config.php';

\Slim\Slim::registerAutoloader();

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');


$app = new \Slim\Slim();

$app->get('/hello/:name', 'authenticate', function ($name) {
    echo "Hello, $name";
});

$app->get('/logout', function () {
    global $app;
	$app->deleteCookie('uid');
    $app->deleteCookie('key');
    $app->deleteCookie('uma');
});

$app->get('/loginAuto', 'authenticate', function () {
	#echo "Connexion automatique réussie";
	global $app;
	$uid = $app->getEncryptedCookie('uid');
    $key = $app->getEncryptedCookie('key');
    $user = Doctrine_Core::getTable('User')->findOneByIdAndPassword($uid, $key);
	$response = $app->response();
    $response['Content-Type'] = 'application/json';  
    $response->header('Access-Control-Allow-Origin', '*'); 
    $response->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-authentication, X-client');
    $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

	$user_object = json_encode($user->toArray());

	$response->body($user_object);
});

$app->get('/accounts', function () {
	#echo "Connexion automatique réussie";
	global $app;
	$uid = $app->getEncryptedCookie('uid');
    $accounts = Doctrine_Core::getTable('Account')->findByUser_id($uid);

	$response = $app->response();
    $response['Content-Type'] = 'application/json';
    $json = json_encode($accounts->toArray());

	$response->body($json);
});

$app->post('/editOperation', 'authenticate', function () {
	global $app;
	$body = $app->request()->getBody();

    // on récupère les données du formulaire
    $body = json_decode($body, true);
	$account_id = $body['account_id'];
	$type_id = $body['type_id'];
	$operation_date = $body['operation_date'] ;
	$operation_desc = $body['operation_desc'];
	$operation_name = $body['operation_name'];
	$is_credit = $body['is_credit'];
	$value = $body['value'];

	// create new operation
	$operation = operation($is_credit, $account_id, $value, $type_id, $operation_name, $operation_desc, $operation_date);
	
	$response = $app->response();
	try{
		$response['Content-Type'] = 'application/json';
		$operation_object = json_encode($operation->toArray());
		$response->body($operation_object);
	} catch (Exception $e) {
		$app->response()->status(400);
		$app->response()->header('X-Status-Reason', $e->getMessage());
	}
	
	
});

$app->put('/account/operation/:id', 'authenticate', function ($id) {
	global $app;

	$body = $app->request()->getBody();

    // on récupère les données du formulaire
    $body = json_decode($body, true);

    $account_id = $body['account_id'];
	$type_id = $body['type_id'];
	$operation_date = $body['operation_date'] ;
	$operation_desc = $body['operation_desc'];
	$operation_name = $body['operation_name'];
	$is_credit = $body['is_credit'];
	$value = $body['value'];

    $operation = Doctrine_Core::getTable('Operation')->findOneById($id);

    if (!$operation) {
    	// create new operation
		$operation = operation($is_credit, $account_id, $value, $type_id, $operation_name, $operation_desc, $operation_date);
		$operation->id = $id;
		$response = $app->response();
		
		if($operation->trySave()){
			try{
				$response['Content-Type'] = 'application/json';
				$operation_object = json_encode($operation->toArray());
				$response->body($operation_object);
			} catch (Exception $e) {
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
		}
		else{
			$app->halt(400);
		}
    }else{

	    $operation->operation_name = $operation_name;

		$response = $app->response();

		if($operation->trySave()){
			try{
				$response['Content-Type'] = 'application/json';
				// on crée notre objet
				$operation_object = json_encode($operation->toArray());
				$response->body($operation_object);
	 		} catch (Exception $e) {
				$app->response()->status(400);
				$app->response()->header('X-Status-Reason', $e->getMessage());
			}
		}
		else{
			$app->halt(400);
		}
	}
});

$app->post('/editAccount', 'authenticate', function () {
	global $app;
	$uid = $app->getEncryptedCookie('uid');

	$body = $app->request()->getBody();

    // on récupère les données du formulaire
    $body = json_decode($body, true);

    $account_number 		= $body['account_number'];
    $name 	    = $body['account_name'];
    $balance 	= $body['balance'];

	$account = new Account();

	$account->account_number = $account_number;
	$account->account_name = $name;
	if ($balance != ""){
		$account->balance = $balance;
	}else{	
		$account->balance = 0;
	}
	$account->user_id = $uid;

	$response = $app->response();

	if($account->trySave()){
		try{
			$response['Content-Type'] = 'application/json';
			// on crée notre objet
			$account_object = json_encode($account->toArray());
			$response->body($account_object);
 		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	}
	else{
		$app->halt(400);
	}
});


$app->put('/account/:id', 'authenticate', function ($id) {
	global $app;
	$uid = $app->getEncryptedCookie('uid');

	$body = $app->request()->getBody();

    // on récupère les données du formulaire
    $body = json_decode($body, true);

    $name 	    = $body['account_name'];
    if (isset($body['account_number']))
    	$account_number = $body['account_number'];
    if (isset($body['balance']))
    	$balance 	= $body['balance'];

    $account = Doctrine_Core::getTable('Account')->findOneById($id);
    
    if (!$account) {
    	// Ce compte a été créé hors ligne
    	$account = new Account();

		$account->account_number = $account_number;
		if ($balance != ""){
			$account->balance = $balance;
		}else{	
			$account->balance = 0;
		}
		$account->user_id = $uid;
		$account->id = $id;
    }

    $account->account_name = $name;

	$response = $app->response();

	if($account->trySave()){
		try{
			$response['Content-Type'] = 'application/json';
			// on crée notre objet
			$account_object = json_encode($account->toArray());
			$response->body($account_object);
 		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	}
	else{
		$app->halt(400);
	}
});

$app->get('/paymentTypes', 'authenticate', function () {
	global $app;
    $paymentTypes = Doctrine_Core::getTable('PaymentType')->findAll();
	$response = $app->response();
    $response['Content-Type'] = 'application/json';
    $json = json_encode($paymentTypes->toArray());
	$response->body($json);

});
	
$app->get('/operations/:select/:id/:limit/:type/:begin/:end/:payementType/:tag', 'authenticate', function ($select, $id, $limit, $type, $begin, $end, $payementType, $tag) {
	global $app;
	$uid = $app->getEncryptedCookie('uid');

	if ($select == 'byAccount'){
		$operations = getOperations($id, $begin, $end, $type, $limit, $payementType, $tag);
	}else if ($select == 'byUser'){
		$operations = getOperations(getAccounts($uid), $begin, $end, $type, $limit, $payementType, $tag);
	}else{
		$app->halt(400);
	}
	       		

	$response = $app->response();
    $response['Content-Type'] = 'application/json';
    $json = json_encode($operations->toArray());

	$response->body($json);
});

$app->delete('/account/operation/:id', 'authenticate', function($id){
	global $app;

    deleteOperation($id);

     $response = $app->response();
     $response['Content-Type'] = 'application/json';
     $json = json_encode("delete operation succeed");

	 $response->body($json);
 });

$app->get('/ping', function(){
    global $app;
    $response = $app->response();
    $response['Content-Type'] = 'application/json';
    $json = json_encode("pong");
	$response->body($json);
 });


$app->delete('/account/:id', 'authenticate', function ($id) {
	global $app;
    
    $account = Doctrine_Core::getTable('Account')->findOneById($id);

    $response = $app->response();
    $response['Content-Type'] = 'application/json';
    $json = json_encode($account->toArray());

    $account->delete();

	$response->body($json);
});

$app->get('/account/:id', 'authenticate', function ($id) {
	global $app;
    $account = Doctrine_Core::getTable('Account')->findOneById($id);
    $response = $app->response();
    $response['Content-Type'] = 'application/json';
    $json = json_encode($account->toArray());
	$response->body($json);
});

$app->post('/login', function () {
	global $app, $basicAuth;
    #echo "Tentative de connexion";

	$body = $app->request()->getBody();

    $body = json_decode($body, true);

    $email 		= $body['email'];
    $password 	= crypt($body['password'], $email);


    #echo " les champs sonts : $email, $password";
	$user = Doctrine_Core::getTable('User')->findOneByEmailAndPassword($email, $password);
	$response = $app->response();
	
    // On vérifie ici si l'user existe
    if ($user) {    	
	    try {
			$id = $user->id;
			$firstname = $user->firstname;
			$lastname = $user->lastname;
			$email = $user->email;
			$app->setEncryptedCookie('uid', $id, '120 minutes');
			$app->setEncryptedCookie('key', $password, '120 minutes');
			$app->setEncryptedCookie('uma', $email, '120 minutes');
			$uid = $app->getEncryptedCookie('uid');
    		$key = $app->getEncryptedCookie('key');
    		$uma = $app->getEncryptedCookie('uma');
			#echo "  Les cookies sont : $uid, $key, $uma";
			$response['Content-Type'] = 'application/json';
			// on crée notre objet
			$user_object = json_encode($user->toArray());

			$response->body($user_object);

		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	}else{
		// l'user n'existe pas
		$app->halt(401);
	}
	#$basicAuth->authenticate($email, $password);
    
});

$app->post('/subscribe', function () {
	global $app;
    #echo "inscription";
    $body = $app->request()->getBody();

    // on récupère les données du formulaire
    $body = json_decode($body, true);

    $email 		= $body['email'];
    $firstname 	= $body['firstname'];
    $lastname 	= $body['lastname'];
    $password 	= crypt($body['password'], $email);

    // On vérifie si un utilisateur avec cet email et ce mot de passe existe déjà
    $userAlreadyExist = Doctrine_Core::getTable('User')->findOneByEmail($email);
    if ($userAlreadyExist){
    	$app->halt(401);
    }

    #echo " les champs sonts : $email";
	$user = new User();
	$user->email 		= $email;
	$user->firstname 	= $firstname;
	$user->lastname 	= $lastname;
	$user->password 	= $password;

	$response = $app->response();

	if($user->trySave()){
	    try {
	    	$id = $user->id;
			$app->setEncryptedCookie('uid', $id, '120 minutes');
			$app->setEncryptedCookie('uma', $email, '120 minutes');
			$app->setEncryptedCookie('key', $password, '120 minutes');
			$uid = $app->getEncryptedCookie('uid');
			$key = $app->getEncryptedCookie('key');
    		$uma = $app->getEncryptedCookie('uma');
			#echo "les cookies sont : $uid, $key, $uma";
			$response['Content-Type'] = 'application/json';
			// on crée notre objet
			$user_object = json_encode($user->toArray());

			$response->body($user_object);
		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	}
	else{
		$app->halt(400);
	}

    
});


$app->run();
?>