<?php

require_once 'routesAPI.php';



/*public function authenticate(\Slim\Route $route) {
        if(!ctype_alnum($username))
            return false;
         
        if(isset($username) && isset($password)) {
            echo 'login in !';
            //$password = crypt($password);
            if ($username == 'root' && $password == 'root'){
            // Check database here with $username and $password
                echo 'connexion réussie';
                return true;
            }else{
                echo 'connexion échouée';
                $this->deny_access();
                return false;
            }
        }
        else
            return false;
}*/

// route middleware for simple API authentication
function authenticate(\Slim\Route $route) {
    $app = \Slim\Slim::getInstance();
    $uid = $app->getEncryptedCookie('uid');
    $key = $app->getEncryptedCookie('key');
    if (validateUserKey($uid, $key) === false) {
       $app->halt(401);
    }
}

function validateUserKey($uid, $key) {
	if ($uid == '' || $key == ''){
        return false;
    }

    $user = Doctrine_Core::getTable('User')->findOneByIdAndPassword($uid, $key);

	if ($user) {
		return true;
	} else {
		return false;
	}
}


function subscribes(\Slim\Route $route) {

}





?>