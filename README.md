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

## Defining Models


## Using Models
