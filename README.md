timesheet-nodejs-mongo
======================

__INIT (populateDB)__

http://localhost:[PORT]/init <br/>
* create collections:<br/>
    - timesheet<br/>
    - project <br/>
    - user<br />

__URLs__

* ts => timesheet (document) [CRUD]<br/>
	- get('/ts') => GET ALL)<br/>
	- get('/ts/:id') => GET BY OBJECTID)<br/>
	- post('/ts') => CREATE NEW timesheet <br/>
	- put('/ts/:id') => UPDATE timesheet <br/>
	- delete('/ts/:id') => DELETE timesheet<br/>

* user => utilisateur.login<br/>
    - get('/user') => GET ALL USERS<br/>
	- get('/ts/user/:user?year=[&month=]') > GET timesheet BY USER (login)  <br/>

* project => tasks.project<br/>
    - get('/project') => GET ALL PROJECTS<br/>
	- get('/ts/project/:project?year=[&month=]') => GET timesheet BY TASKS (project) <br/>


Pour info : http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
