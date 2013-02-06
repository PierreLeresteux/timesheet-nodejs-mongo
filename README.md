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

* Categories
    - ```GET /categories``` => Get all categories with all their projects
    - ```POST /categories``` => Create a new category with no projects
    - ```GET /categories/:id``` => Get a single category with all its projects
    - ```DELETE /categories/:id``` => Delete a category with all its projects
    - ```PUT /categories/:id``` => Replace a category with the data passed in the body
    - ```PATCH /categories/:id``` => Update a category with the data passed in the body
* Projects
    - ```GET /projects``` => Get all projects of a category
    - ```POST /projects?category_id=``` => Create a new project assigned to a specified category
    - ```GET /projects/:id``` => Get a single project of a category
    - ```DELETE /projects/:id``` => Remove a project from a category
    - ```PUT /projects/:id``` => Replace a project with the data passed in the body
    - ```PATCH /projects/:id``` => Update a project with the data passed in the body
* Activities
    - ```GET /activities?[user=][&year=][&month=]``` => Get all activities by user, year and/or month
    - ```POST /activities``` => Create a new activity with the data passed in the body
    - ```DELETE /activities/:id``` => Delete an activity
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
