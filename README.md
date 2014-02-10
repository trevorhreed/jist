jist
====

Models done right


jist a a lightweight module for managing models in AngularJS.  It can be configured to use any storage medium and comes with a localStorage configuration built in (which means you can start using it right away, without setting up a backend service--great for prototyping!).


## Overview
This module is used in three steps:
 1. Configuring
 2. Defining
 3. Using

During the Angular configuration phase, you can run the `jistProvider.setup` method to configure how jist interacts with your chosen storage medium.  During the Angular run phase, you can define application's models, further extending how each model interacts with the storage medium.  After your models are defined, you can inject them into your Angular controllers, services, etc., and use them however you want.

## Configuration
The `jistProvider.setup` method takes a single argument.  The argument can be either a JavaScript object, a function that returns a JavaScript object, or an array of dependencies and a function returning a JavaScript object.  The JavaScript object can contain any of the following properties

```javascript

{
  publish: true, // if true, model classes will be available through Angular as injectable dependencies
  funcs: {
    instance: {
      // functions to be attached to instances of every model created via jist
    },
    model: {
      // functions to be attached to the model class (static methods, so to speak)
    },
    jist: {
      // functions to be attached to the jist object (e.g. clear all models from storage medium)
    }
  }
}

```

The configuration object is not processed until the models begin to be defined in the Angular run phase, so if you pass a function into `jistProvider.setup` instead of regular JavaScript object, you can take advantage of Angular services, such as `$http`.  Here's an example:

```javascript
angular.module('myApp', ['jist']).config(['jistProvider', function(jistProvider){
  jistProvider.setup(['$http', function($http){
    {
      publish: true,
      funcs: {
        instance: {
          put: function(){
            var that = this;
            if(!that.$key){
              $http.post('/api/models/' + that.$model, JSON.stringify(that)).success(function(response){
                that.$key = response.data.key;
              });
            }else{
              $http.put('/api/models/' + that.$model + '/' + that.$key, JSON.stringify(that));
            }
          }
        }
        model: {
          query: function(criteria){
            return $http.get('/api/models/' + this.$name + '?criteria=' + criteria);
          }
        },
        jist: {
          clear: function(){
            return $http.delete('/api/models');
          }
        }
      }
    }
  }]);
});
```

#### A few caveats

Serialization often presents a few challenges for models that have methods.  jist provides a couple of convenience methods for restoring methods to a model after it has been deserialized.  You can call `$renew` or `$renew_multi` on either the jist object itself, or the model object (e.g. `MyModel.$renew(obj)`); in both cases, you pass in the deserialized object.  Since all instances of a jist model contain a $model property, the jist object always knows which methods to reattach.

## Defining Models
Once the configuration is written, the rest is cake.  Defining a model is as simple passing a dictionary of regular JavaScript objects to `jist.$define`:

```javascript
angular.module('myapp').run(['jist', function(jist){
  jist.$define({
    Person: {
      name: '[DEFAULT NAME]',
      ssn: '333-22-4444',
      sayMyName: function(){
        console.log(this.name); // regular methods are ok too!
      }
    },
    Employee: {
      $extends: ['Person'],
      salary: 0
    },
    Manager: {
      $extends: 'Employee',
      budget: 0
    }
  });
}]);
```

This code will define the `Person`, `Employee`, and `Manager` models with default values.  You may have noticed the `$extends` property on the `Employee` and `Manager` models; as you would expect this causes the `Employee` model to inherit all properties and methods from the `Person` model, while the `Manager` model inherits all properties methods from the `Employee` model (directly) *and* the `Person` model (indirectly). Also notice, that the `$extends` property can be an array of model names, or just a string containing a single model name.

## Using Models
Using models is the easiest of all!  Simply inject the model name in your Angular controller or service and use it as a function to get a new instance of your model:

```javascript
angular.module('myapp').controller(['Manager', function(Manager){

  $scope.bosses = Manager.query(); // this method is specified in the configuration (funcs.model.query)
  $scope.newBoss = Manager();
  /* Alternatively, you can specify the property values like so:
  $scope.theBigBoss = Manager({
    name: 'The Boss',
    ssn: '123-45-6789',
    salary: 80000,
    budget: 10000
  });
  */
  
  $scope.onSaveNewBoss = function(){
    // save the new boss
    $scope.newBoss.put();
    // push the new boss to our list of bosses
    $scope.bosses.push($scope.newBoss);
    // reset the form
    $scope.newBoss = Manager();
  };

}]);
```


## Built-in, HTML5 localStorage configuration
To use the built-in, HTML5 localStorage configuration, simply use the following code

```javascript
angular.module('myapp').config(['jistProvider', 'jistLocalStorageConfig', function(jistProvider, jistLocalStorageConfig){
  jistProvider.setup(jistLocalStorageConfig);
});
```
