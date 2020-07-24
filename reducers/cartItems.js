import * as actionTypes from '../actions/actionTypes';
import {AsyncStorage } from 'react-native';
import settings from '../constants/Settings.js';
const SERVER_URL = settings.url

const initialState = {
    counter: 0,
    cartItem:[],
    user:null,
    selectedAddress:null,
    store:{},
    videos:[]
}

let counter =0
const cartItems = (state = initialState, action) => {
  // console.log(state.cartItem,"cart items");
   switch(action.type) {
       case actionTypes.SET_INITIAL:
         AsyncStorage.setItem('counter', JSON.stringify(action.counter));
         AsyncStorage.setItem('cart', JSON.stringify(action.payload,));
         return {
          ...state,
          counter: action.counter,
          cartItem: action.payload,
         }
       case actionTypes.ADD_TO_CART:
         var cart = state.cartItem;
         var count = state.counter;
         var flag = true;



         for (var i = 0;i<cart.length;i++){
           if(cart[i].product === action.payload.product && cart[i].productVariant === action.payload.productVariant && cart[i].store === action.payload.store){
             count++;
             flag = false;
             // console.log(count, 'ADD_TO_CART inside ');
           }
         }
         if(flag){
           count = count + action.payload.count;
           // console.log(count, 'ADD_TO_CART out side');
         }
         console.log(action.payload,'gggggggg');
        cart.push(action.payload);
        AsyncStorage.setItem('counter', JSON.stringify(count));
        AsyncStorage.setItem('cart', JSON.stringify(cart));
         return {
              ...state,
              cartItem: cart,
              counter: count
          }

       case actionTypes.DECREASE_FROM_CART:
         var cart = state.cartItem;
         var isDelete = false
         var index = null
         for (var i = 0;i<cart.length;i++){
           if(cart[i].product === action.payload.product && cart[i].productVariant === action.payload.productVariant && cart[i].store === action.payload.store){
             cart[i].count = cart[i].count -1;
             cart[i].discountedPrice = action.payload.discountedPrice;

             if(cart[i].count == 0){
             isDelete = true
             index = i
             }
           }
         }
         if(isDelete == true){
           cart.splice(index,1)
         }
         AsyncStorage.setItem('counter', JSON.stringify(state.counter-1));
         AsyncStorage.setItem('cart', JSON.stringify(cart));
         return {
              ...state,
              cartItem:cart ,
              counter: state.counter-1
          }
       case actionTypes.INCREASE_CART:
          var cart = state.cartItem;
          console.log(action.payload.bulkChart,'hj');
          for (var i = 0;i<cart.length;i++){
            if(cart[i].product === action.payload.product && cart[i].productVariant === action.payload.productVariant && cart[i].store === action.payload.store){
              cart[i].count = cart[i].count +1;
              cart[i].discountedPrice = action.payload.discountedPrice;
            }
          }
          AsyncStorage.setItem('counter', JSON.stringify(state.counter+1));
          AsyncStorage.setItem('cart', JSON.stringify(cart));
          return {
              ...state,
              cartItem: cart,
              counter: state.counter+1
          }
       case actionTypes.EMPTY_CART:
         AsyncStorage.setItem('counter', JSON.stringify(0));
         AsyncStorage.setItem('cart', JSON.stringify([]));
         return {
             ...state,
             cartItem: [],
             counter: 0
           }
       case actionTypes.USER_PROFILE:
         return {
             user:action.payload
         }
       case actionTypes.SELECTED_ADDRESS:
         return {
             ...state,
             selectedAddress:action.payload
         }
       case actionTypes.RE_ORDER:
         var cart = state.cartItem;
         var count = state.counter;
         var flag = true;
         for (var i = 0;i<cart.length;i++){
           if(cart[i].sku === action.payload.sku){
             cart[i].count = cart[i].count + action.payload.count;
             flag = false;
           }

         }
         if(flag){
             cart.push(action.payload);
         }
         count = count + action.payload.count;
         AsyncStorage.setItem('counter', JSON.stringify(count));
         AsyncStorage.setItem('cart', JSON.stringify(cart));
          return {
               ...state,
               cartItem: cart,
               counter: count
           }

       case actionTypes.REMOVE_ITEM:
         var cart = state.cartItem;
         var count = state.counter;
         var index = null;
         var _noItems = 0;
         for (var i = 0;i<cart.length;i++){
           if(cart[i].cart === action.payload.cart){
             index = i;
             _noItems = cart[i].count;
           }
         }
         cart.splice(index,1);
         count = count - _noItems;

         AsyncStorage.setItem('counter', JSON.stringify(count));
         AsyncStorage.setItem('cart', JSON.stringify(cart));
          return {
               ...state,
               cartItem: cart,
               counter: count
           }
       case actionTypes.SET_STORE:
          return {
              ...state,
              store:action.payload
          }
       case actionTypes.ADD_VIDEO:
          var videos = state.videos
          videos.push(action.payload)
          return {
              ...state,
              videos:videos
          }

       default:
           return state
   }

   return state

};

export default cartItems;
