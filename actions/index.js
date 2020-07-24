import * as actionTypes from '../actions/actionTypes'



export const addVideo = (video)=>({
  type: actionTypes.ADD_VIDEO,
  payload:video
})
export const addToCart = (product)=>({
  type: actionTypes.ADD_TO_CART,
  payload:product
})

export const decreaseFromCart = (product)=>({
  type: actionTypes.DECREASE_FROM_CART,
  payload:product
})

export const increaseCart = (product)=>({
  type: actionTypes.INCREASE_CART,
  payload:product
})

export const emptyCart = ()=>({
  type: actionTypes.EMPTY_CART,
})

export const userProfile = (user)=>({
  type: actionTypes.USER_PROFILE,
  payload: user
})

export const setInitial = (cart,counter)=>({
  type: actionTypes.SET_INITIAL,
  payload: cart,
  counter:counter
})

export const selectedAddress = (address)=>({
  type: actionTypes.SELECTED_ADDRESS,
  payload: address,
})
export const reOrderAction = (product)=>({
  type: actionTypes.RE_ORDER,
  payload: product,
})

export const removeItem = (product)=>({
  type: actionTypes.REMOVE_ITEM,
  payload: product,
})

export const setStore = (store)=>({
  type: actionTypes.SET_STORE,
  payload: store,
})
