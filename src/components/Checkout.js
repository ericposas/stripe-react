import React from 'react'
import { isEqual } from 'lodash'
import { loadStripe } from '@stripe/stripe-js'
import StyledButton from './StyledButton'
import ProductBox from './ProductBox'
import { useAuth0 } from '@auth0/auth0-react'
import useFetchedUserData from '../hooks/useFetchedUserData'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_PUB_KEY)

export default function Checkout () {

    const [products, setProducts] = React.useState(null)
    const [itemsChecked, setItemsChecked] = React.useState({})
    const [shoppingCart, setShoppingCart] = React.useState([])
    const { isAuthenticated, isLoading } = useAuth0()
    const fetchedUser = useFetchedUserData()

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
      if (!fetchedUser) {
        console.log(
          'could not get auth0 fetched user object'
        )
      }
      if (shoppingCart.length > 0) {
        // Get Stripe.js instance
        const stripe = await stripePromise
        // Call your backend to create the Checkout Session
        const response = await fetch('/create-checkout-session', {
          method: 'POST',
          body: JSON.stringify({
            email: fetchedUser ? fetchedUser.email : null,
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

    const markup = () => (
        <>
        <br />
        <div>
          Enroll in Classes
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
          left: 0,
          right: 0,
          bottom: '40px',
          position: 'absolute',
          margin: 'auto'
        }}
        type='button' role='link'
        onClick={handleClick}>
          Checkout
        </StyledButton>
      </>
    )
    
    return (
        <>
        {
            isLoading
            ? <><br/><div>Loading...</div></>
            :
                isAuthenticated
                ? markup()
                : null
        }
        </>
    )
}
