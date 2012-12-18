timesheet-nodejs-mongo
======================

__INIT (populateDB)__

```http://localhost:[PORT]/init```<br />
* Creates collections:<br />
    - timesheet<br />
    - project<br />
    - user<br />
    - categories
    - activities

__LAUNCH LOCALLY__

* dev:

    ```node server.js dev```

* minified js & compiled less

    ```node server.js```


__URLs__

* ts => timesheet (document) [CRUD]<br />
	- ```GET /ts``` => GET ALL<br />
	- ```GET /ts/:id``` => GET BY OBJECTID<br />
	- ```POST /ts``` => CREATE NEW timesheet<br />
	- ```PUT /ts/:id``` => UPDATE timesheet<br />
	- ```DELETE /ts/:id``` => DELETE timesheet<br />
* user => utilisateur.login<br />
    - ```GET /user``` => GET ALL<br />
    - ```GET /user/:id``` => GET A user<br />
    - ```DELETE /user/:id``` => DELETE user<br />
	- ```GET /ts/user/:user?year=[&month=]``` > GET timesheet BY USER (login) <br />
* project => tasks.project<br />
    - ```GET /project``` => GET ALL<br />
    - ```GET /project/:id``` => GET A project<br />
    - ```DELETE /project/:id``` => DELETE project<br />
	- ```GET /ts/project/:project?year=[&month=]``` => GET timesheet BY TASKS (project)<br />
* Categories
    - ```GET /categories``` => Get all categories with all their projects
    - ```GET /categories/:cid``` => Get a single category with all its projects
    - ```GET /categories/:cid/projects``` => Get all projects of a category
    - ```GET /categories/:cid/projects/:pid``` => Get a single project of a category
* Activities
    - ```GET /activities?[user=][&year=][&month=]``` => Get all activities by user, year and/or month
    - ```GET /activities-:year-:month.csv``` => Export all activities of the specified month formatted in CSV


___Pour info :___

* Tutorial: http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
* Zepto: http://zeptojs.com/
* Require: http://requirejs.org/
* Angular: http://angularjs.org/
* Underscore: http://underscorejs.org/
* Less: http://lesscss.org/
* Fundation 3: http://foundation.zurb.com/
* Batch (icon): http://adamwhitcroft.com/batch/
* Login system: https://github.com/braitsch/node-login
