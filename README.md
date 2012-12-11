timesheet-nodejs-mongo
======================

INIT (populateDB)

http://localhost:[PORT]/init

URLs :

get('/ts') => GET ALL);<br/>
get('/ts/:id') => GET BY OBJECTID);<br/>
get('/ts/user/:user?year=[&month=]') > GET BY USER (login)  <br/>
get('/ts/project/:project?year=[&month=]') => GET BY TASKS (project) <br/>
post('/ts') => CREATE NEW timesheet <br/>
put('/ts/:id') => UPDATE timesheet <br/>
delete('/ts/:id') => DELETE timesheet


Pour info : http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
