timesheet-nodejs-mongo
======================

INIT (populateDB)

http://localhost:[PORT]/init <br/>
-> create collections:<br/>
    - timesheet<br/>
    - project <br/>
    -user<br />
URLs :

* ts => timesheet (document) [CRUD]<br/>
	- get('/ts') => GET ALL)<br/>
	- get('/ts/:id') => GET BY OBJECTID)<br/>
	- post('/ts') => CREATE NEW timesheet <br/>
	- put('/ts/:id') => UPDATE timesheet <br/>
	- delete('/ts/:id') => DELETE timesheet<br/>

* user => utilisateur.login<br/>
    - get('/user') => GET ALL<br/>
    - get('/user/:id') => GET A user<br/>
    - delete('/user/:id') => DELETE user<br/>
	- get('/ts/user/:user?year=[&month=]') > GET timesheet BY USER (login)  <br/>

* project => tasks.project<br/>
    - get('/project') => GET ALL<br/>
    - get('/project/:id') => GET A project<br/>
    - delete('/project/:id') => DELETE project<br/>
	- get('/ts/project/:project?year=[&month=]') => GET timesheet BY TASKS (project) <br/>


Pour info : http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
