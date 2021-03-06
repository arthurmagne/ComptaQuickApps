<?php
 
class HttpBasicAuth extends \Slim\Middleware
{
    /**
     * @var string
     */
    protected $realm;
 
    /**
     * Constructor
     *
     * @param   string  $realm      The HTTP Authentication realm
     */
    public function __construct($realm = 'Veuillez vous connecter')
    {
        $this->realm = $realm;
    }
 
    /**
     * Deny Access
     * Possibilité de juste retourner 401 afin de capter le message avec backbone
     */   
    public function deny_access() {
        $res = $this->app->response();       
        $res->status(401);

        #$res->header('WWW-Authenticate', sprintf('Basic realm="%s"', $this->realm));        
    }
 
    /**
     * Authenticate 
     *
     * @param   string  $username   The HTTP Authentication username
     * @param   string  $password   The HTTP Authentication password     
     *
     */
    public function authenticate($username, $password) {
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
    }
 
    /**
     * Call
     *
     * This method will check the HTTP request headers for previous authentication. If
     * the request has already authenticated, the next middleware is called. Otherwise,
     * a 401 Authentication Required response is returned to the client.
     */
    public function call()
    {
        $req = $this->app->request();
        $res = $this->app->response();
        $authUser = $req->headers('PHP_AUTH_USER');
        $authPass = $req->headers('PHP_AUTH_PW');
         
        if ($this->authenticate($authUser, $authPass)) {
            $this->next->call();
        } else {
            $this->deny_access();
        }
    }
}

?>