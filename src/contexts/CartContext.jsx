import { createContext, useContext, useReducer, useCallback } from 'react'

const CartContext = createContext()

const initialState = {
  items: [],
  saleType: 'bottle', // 'bottle' | 'shot'
  paymentMethod: 'cash',
  note: ''
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, saleType } = action.payload
      const unitPrice = saleType === 'shot' ? (product.shotPrice || product.price / 8) : product.price
      const existing = state.items.find(
        i => i.productId === product.id && i.saleType === saleType
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === product.id && i.saleType === saleType
              ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
              : i
          )
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            productId: product.id,
            productName: product.name,
            category: product.category,
            saleType,
            unitPrice,
            quantity: 1,
            total: unitPrice,
            stock: product.stock
          }
        ]
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.productId !== action.payload.productId || i.saleType !== action.payload.saleType)
      }
    case 'UPDATE_QTY': {
      const { productId, saleType, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i.productId !== productId || i.saleType !== saleType)
        }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === productId && i.saleType === saleType
            ? { ...i, quantity, total: quantity * i.unitPrice }
            : i
        )
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [], note: '' }
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload }
    case 'SET_NOTE':
      return { ...state, note: action.payload }
    case 'SET_SALE_TYPE':
      return { ...state, saleType: action.payload }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = useCallback((product, saleType) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, saleType } })
  }, [])

  const removeItem = useCallback((productId, saleType) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, saleType } })
  }, [])

  const updateQuantity = useCallback((productId, saleType, quantity) => {
    dispatch({ type: 'UPDATE_QTY', payload: { productId, saleType, quantity } })
  }, [])

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])
  const setPaymentMethod = useCallback((method) => dispatch({ type: 'SET_PAYMENT', payload: method }), [])
  const setNote = useCallback((note) => dispatch({ type: 'SET_NOTE', payload: note }), [])
  const setSaleType = useCallback((type) => dispatch({ type: 'SET_SALE_TYPE', payload: type }), [])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce((sum, i) => sum + i.total, 0)
  const tax = 0 // No tax for liquor? Configurable later
  const grandTotal = subtotal + tax

  return (
    <CartContext.Provider value={{
      items: state.items,
      saleType: state.saleType,
      paymentMethod: state.paymentMethod,
      note: state.note,
      itemCount,
      subtotal,
      tax,
      grandTotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      setPaymentMethod,
      setNote,
      setSaleType
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
