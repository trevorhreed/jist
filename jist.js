angular.module('jist.ext', []).provider('jist', function($provide){
  var _provide = $provide,
    _injector = null,
    _config = false,
    _publish = false,
    _defs = {},
    _instanceFuncs = {},
    _modelFuncs = {},
    _jistFuncs = {};
  
  window.defs = _defs;
  function instanceOf(model){ return (this.$ancestry.indexOf('|' + model + '|') != -1) }
  function create(name, data){
    var obj = angular.copy(_defs[name]);
    for(var p in data){
      obj[p] = angular.copy(data[p]);
    }
    delete obj['$ancestry'];
    delete obj['$extends'];
    obj.$model = name;                
    typeof _onCreate === 'function' && _onCreate(obj);
    return obj;
  }
  function createList(name, dataList){
    var result = [];
    for(var i in dataList){
      result.push(create(name, dataList[i]));
    }
    return result;
  }
  function renew(obj){
    angular.forEach(_defs[obj.$model], function(value, key){
      if(typeof value !== 'function') return;
      obj[key] = value;
    });
    return obj;
  }
  function renewList(objs){
    for(var i in objs) renew(objs[i]);
    return objs;
  }
  function getFromInvokable(invokable){
    if(angular.isObject(invokable)){
      return invokable;
    }
    if(angular.isArray(invokable) || angular.isFunction(invokable)){
      return _injector.invoke(invokable);
    }
    return {};
  }
  function inherit(child, parent){
    if(child !== parent){
      if(angular.isString(parent.$extends)){
        parent.$extends = [parent.$extends];
      }
      angular.forEach(parent.$extends, function(value, key){
        child.$ancestry += value + '|';
        child = inherit(child, _defs[value]);
      });
      angular.forEach(parent, function(value, key){
        if(key == "$ancestry") return;
        child[key] = value;
      });
    }
    return child;
  }
  function define(fn){
    if(_config){
      _config = getFromInvokable(_config);
      _publish = _config.publish || false;
      var funcs = _config.funcs || {};
      _instanceFuncs = funcs.instance || {};
      _modelFuncs = funcs.model || {};
      _jistFuncs = funcs.jist || {};
      _config = false;
      for(var p in _jistFuncs){
        this[p] = _jistFuncs[p];
      }
    }
    var definitions = getFromInvokable(fn);
    angular.forEach(definitions, function(value, key){
      var static = value['$static'];
      delete value['$static'];
      template = {$ancestry:'|' + key + '|'};
      for(var p in _instanceFuncs){
        template[p] = _instanceFuncs[p];
      }
      template.$instanceOf = function(){
        return function(m){
          return (template.$ancestry.indexOf('|' + m + '|') != -1);
        }
      }
      value = inherit(template, value);
      _defs[key] = value;
      if(_publish){
        var model = function(data){
          return create(key, data);
        }
        model.$renew = renew;
        model.$name = key;
        model.$definition = value;
        for(var f in static) model[f] = static[f];
        for(var f in _modelFuncs) model[f] = _modelFuncs[f];
        $provide.constant(key, model);
      }
    });
  }
  this.setup = function(config){
    _config = config;
  }
  this.$get = function jistProvider_$get($injector){
    _injector = $injector;
    return {
      $new: create,
      $new_multi: createList,
      $renew: renew,
      $renew_multi: renewList,
      $define: define
    }
  }
});
