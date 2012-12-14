timesheet-nodejs-mongo
======================

__INIT (populateDB)__

http://localhost:[PORT]/init <br/>
* create collections:<br/>
    - timesheet<br/>
    - project <br/>
    - user<br />

__LAUNCH LOCALLY__

* dev:

    node server.js dev

* minified js & compiled less

    node server.js


__URLs__

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



___Pour info :___

http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/<br />
Zepto: http://zeptojs.com/<br />
Require: http://requirejs.org/<br />
Angular: http://angularjs.org/<br />
Underscore: http://underscorejs.org/<br />
Less: http://lesscss.org/<br />
Fundation 3: http://foundation.zurb.com/<br />
Batch (icon): http://adamwhitcroft.com/batch/<br />
Login system: https://github.com/braitsch/node-login<br />
