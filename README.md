timesheet-nodejs-mongo
======================

INIT (populateDB)

http://localhost:[PORT]/init

URLs :

* ts => timesheet (document) [CRUD]<br/>
	get('/ts') => GET ALL)<br/>
	get('/ts/:id') => GET BY OBJECTID)<br/>
	post('/ts') => CREATE NEW timesheet <br/>
	put('/ts/:id') => UPDATE timesheet <br/>
	delete('/ts/:id') => DELETE timesheet<br/>

* ts/user => utilisateur<br/>
	get('/ts/user/:user?year=[&month=]') > GET BY USER (login)  <br/>

* ts/project => project<br/>
	get('/ts/project/:project?year=[&month=]') => GET BY TASKS (project) <br/>


Pour info : http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
