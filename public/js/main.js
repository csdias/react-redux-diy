import React from 'react';
import ReactDOM from 'react-dom';

var defaultAppleStore = 0;

//reducer
function apple(state = defaultAppleStore, action){

  if (action.type === 'INCREMENT')
    return state + 1;

  return state;
}

var defaultOrangeStore = 0;

function orange(state = defaultOrangeStore, action){
  if (action.type === 'EAT_ORANGE')
    return state - 1;

  return state;
}

//var store = combineReducers({apple: apple, orange: orange})
function combineReducers(stateTree){

  var keys = Object.keys(stateTree);

  return function rootReducer(state = {}, action){

    for(var i = 0; i < keys.length; i++){
      var key = keys[i];

      var reducer = stateTree[key];

      var subState = state[key];

      state[key] = reducer(subState, action);
    }

    return state;
  }

}

var rootReducer = combineReducers({apple: apple, orange: orange})

var store = createStore(rootReducer, applyMiddleware(logger));

var unsub = store.subscribe(function(){ console.log('STATUS UPDATE', store.getState()); } );

console.log('before dispatch', store.getState());
store.dispatch({type: 'INCREMENT'});
console.log('after dispatch', store.getState());

unsub();

store.dispatch({type: 'INCREMENT'});

//create Store
function createStore(reducer, enhancer){

  if (typeof enhancer === 'function'){
    return enhancer(createStore)(reducer);
  }

  var state;
  var subscriptions = [];

  var obj = {
    getState: function(){
      return state;
    },

    dispatch : function(action){
      //call the reducer
      state = reducer(state, action);

      //call all the functions in the subscription
      subscriptions.forEach(fn => fn());
    },

    subscribe : function(fn){
      //add to the subscribe array
      subscriptions.push(fn);

      //return an unsubscribe function through wich its possible to remove the function 
      //from the subscription array
      return function unsubscribe(){
        var index = subscriptions.indexOf(fn);
        subscriptions.splice(index,1);
      }

    }
  }

  obj.dispatch({type: 'REDUX-INIT'});

  return obj;
}

function logger(store){
  var getState = store.getState;

  return function(next){

    return function(action){

      console.log('will dispatch', action);

      var returnValue = next(action);

      console.log('after dispatch', getState());

      return returnValue;
    }
  }
}

function applyMiddleware(...fns){

  return function(createStore){

    return function(reducer){
      var store = createStore(reducer);
      var oldDispatch = store.dispatch;
        
      //modify dispatch
      store.dispatch = fns.reduceRight(function(prev, curr){
        return curr(store)(prev); //ie:  dispatch = logger(store, oldDispatch)
      }, oldDispatch);

      return store;

    }

  }

}



var MainComponent = React.createClass({
  render() {
    return (
      <div>
        <label>teste</label>
      </div>
    )
  }
});


ReactDOM.render(<MainComponent />, document.getElementById('container'));
