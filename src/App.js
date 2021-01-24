import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import itemsList from './itemsList'
import { forEach, isEqual } from 'lodash'
import './App.css'
import productsList from './productsList'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_PUB_KEY)

function App() {

  return (
    <div className='App'>
      <Router>
        <div>
          {/* <nav>
            <ul>
              <li>
                <Link to='/'>Home</Link>
              </li>
              <li>
                <Link to='/success'>Success</Link>
              </li>
            </ul>
          </nav> */}

          <Switch>
            <Route path='/success'>
              <SuccessPage />
            </Route>
            <Route path='/'>
              <Checkout />
            </Route>
          </Switch>

        </div>
      </Router>
    </div>
  )

}

export default App

export const convertToDollar = priceNum => {
  let amt = priceNum.toString()
  let dollarAmt = amt.split('')
  dollarAmt.pop()
  dollarAmt.pop()
  dollarAmt.push('.00')
  dollarAmt = dollarAmt.join('')
  return dollarAmt
}

function SuccessPage () {
  return (
    <>
      <br />
      <div>
        Payment was successful!
      </div>
    </>
  )
}

// function Item () {
//   return (
//     <>
//       <div>

//       </div>
//     </>
//   )
// }



export function Checkout () {

  // shape of line_item
  // {
  //   price_data: {
  //       currency: 'usd',
  //       product_data: {
  //           name: 'Camisa',
  //       },
  //       unit_amount: 2500
  //   },
  //   quantity: 2,
  // }

  // const [cart, setCart] = React.useState([])
  // const [itemTypesInCart, setItemTypesInCart] = React.useState({})

  // const incrementItem = item => {

  //   let { price_data: { product_data : { name } } } = item
  //   let itemInCart = false
  //   cart.forEach(_item => {
  //     if (isEqual(item, _item))
  //     itemInCart = true
  //   })
  //   if (itemInCart) {
  //     let itemCp = {}
  //     itemCp = Object.assign(itemCp, item)
  //     itemCp.quantity += itemTypesInCart[name]
  //     console.log(
  //       itemCp
  //     )
  //     setCart(cart => [...cart, item])
  //   } else {
  //     setCart(cart => [...cart, item])
  //   }

  //   setItemTypesInCart({
  //     ...itemTypesInCart,
  //     [name]: itemTypesInCart[name] ? itemTypesInCart[name] + 1 : 1
  //   })

  //   console.log(
  //     itemTypesInCart,
  //     cart
  //   )

  // }

  const [products, setProducts] = React.useState(null)

  React.useEffect(async () => {

    // let response = await fetch('/get-list-of-products', {
    //   method: 'GET'
    // })
    // let _products = await response.json()

    fetch('/get-list-of-products', {
      method: 'GET'
    })
    .then(response => {
      response.json()
      .then(data => {
        console.log(data.products[0])
        setProducts(data.products)
      })
    })
    .catch(err => console.log(err))
    
    
    // setProducts(
    //   _products.products
    // )
    
    // console.log(
    //   _products
    // )

  }, [])

  // React.useEffect(async () => {

  //   let list = productsList()
  //   console.log(list)

  //   for (let prod_id of list) {
  //     let response = await fetch('/get-products', {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         prod_id: prod_id
  //       }),
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     })
  
  //     let details = await response.json()
  //     console.log(
  //       details
  //     )
  //   }
    
  // }, [])

  const decrementItem = item => {
    console.log(
      item
    )
  }

  const handleClick = async event => {
    // Get Stripe.js instance
    const stripe = await stripePromise
    // Call your backend to create the Checkout Session
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        line_items: shoppingCart
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const session = await response.json()
    // When the customer clicks on the button, redirect them to the Checkout 
    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    })

    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      // using `result.error.message`.

    }

  }

  // const getProducts = async () => {
  //   let response = await fetch('/get-products', {
  //     method: 'GET'
  //   })
  //   .json()
  //   return response
  // }

  // const convertToDollar = priceNum => {
  //   let amt = priceNum.toString()
  //   let dollarAmt = amt.split('')
  //   dollarAmt.pop()
  //   dollarAmt.pop()
  //   dollarAmt.push('.00')
  //   dollarAmt.join('')
  //   return dollarAmt
  // }

  // const [checked, setChecked] = React.useState(false)
  const [itemsChecked, setItemsChecked] = React.useState({})
  const [shoppingCart, setShoppingCart] = React.useState([])

  const updateCart = product => {
    setItemsChecked({
      [product.id]: !itemsChecked[product.id]
    })

    let inCart = false
    let itemToAdd = { price: product.metadata.price_id, quantity: 1 }
    shoppingCart.forEach(item => {
      if (isEqual(item, itemToAdd)) {
        inCart = true
      }
    })

    if (!inCart) {
      setShoppingCart(() => ([
        ...shoppingCart,
        itemToAdd
      ]))
    } else {
      setShoppingCart(() => (
        shoppingCart.filter(item => {
          if (!isEqual(item, itemToAdd)) {
            return item
          }
        })
      ))
    }

    console.log(
      shoppingCart
    )

  }

  return (
    <>
      <br />
      <div>
        Stripe Testing Checkout
      </div>
      <br />
      <div>
        {
          products ?
          products
          .map(product => (
            <>
              <div
              style={{
                // 'display': 'flex',
                // 'text-align': 'center',
                'alignItems': 'center',
                'border': '1px solid #ccc',
                'borderRadius': '3px',
                'padding': '20px',
                'width': '300px',
                'position': 'absolute',
                'margin': 'auto',
                'left': 0,
                'right': 0
              }}
              >
                <span>
                  <div key={product.id}>
                    { product.name }
                  </div>
                  <div>
                    { product.statement_descriptor }
                  </div>
                  <div>
                    ${ convertToDollar( product.metadata.price ) }
                  </div>
                  <input
                  type='checkbox'
                  checked={itemsChecked[product.id]}
                  onChange={() => { updateCart(product) }}
                  />
                </span>
                <img
                style={{
                  'width': '100px'
                }}
                src={ product.images[0] }
                />                
              </div>
            </>
          ))
          : null
        }
      </div>
      <br />
      <button
      style={{
        'padding': '20px',
        'border': 'none',
        'borderRadius': '2px',
        'bottom': '40px',
        'position': 'absolute',
        'left': 0,
        'right': 0,
        'width': '120px',
        'margin': 'auto'
      }}
      type='button' role='link'
      onClick={handleClick}>
        Checkout
      </button>
    </>
  )
}

// -- line items: format -- 
//
// {
//   price_data: {
//       currency: 'usd',
//       product_data: {
//           name: 'Monthly subscription',
//       },
//       unit_amount: 2500,
//       recurring: {
//          interval: 'month',
//          interval_count: 1
//       }
//   },
//   quantity: 1,
// }
