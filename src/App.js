import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation
} from 'react-router-dom'
import itemsList from './itemsList'
import { forEach, isEqual } from 'lodash'
import './App.css'
import productsList from './productsList'
import validator from 'validator'
import SuccessPage from './Success'
import StyledButton from './components/StyledButton'
import ProductBox from './components/ProductBox'

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

export function Checkout () {

  const [products, setProducts] = React.useState(null)

  React.useEffect(() => {

    let response = fetch('/get-list-of-products', {
      method: 'GET'
    })
    .then(response => response.json())
    .catch(err => console.log(err))
    
    response
    .then(data => {
      setProducts(data.products)
    })
    .catch(err => console.log(err))

  }, [])

  const handleClick = async event => {

    if (shoppingCart.length > 0) {

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

    } else {
      console.log(
        'there is nothing in your shopping cart'
      )
    }

  }

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

  }

  return (
    <>
      <br />
      <div>
        Enrollment
      </div>
      <br />
      <div>
        {
          products ?
          products
          .map(product => (
            <ProductBox
            itemsChecked={itemsChecked}
            updateCart={updateCart}
            product={product}
            />
          ))
          : null
        }
      </div>
      <br />
      <StyledButton
      style={{
        'left': 0,
        'right': 0,
        'bottom': '40px',
        'position': 'absolute',
        'margin': 'auto'
      }}
      type='button' role='link'
      onClick={handleClick}>
        Checkout
      </StyledButton>
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
