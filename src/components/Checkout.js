import React from 'react'
import { isEqual } from 'lodash'
import { loadStripe } from '@stripe/stripe-js'
import StyledButton from './StyledButton'
import ProductBox, { convertToDollar } from './ProductBox'
import { useAuth0 } from '@auth0/auth0-react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import { useHistory } from 'react-router-dom'
import ChoosePaymentMethod from './ChoosePaymentMethod'
import { useStripe } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_PUB_KEY)

export default function Checkout () {

    const [products, setProducts] = React.useState(null)
    const [itemsChecked, setItemsChecked] = React.useState({})
    const [shoppingCart, setShoppingCart] = React.useState([])
    const { isAuthenticated, isLoading } = useAuth0()
    const fetchedUser = useFetchedUserData()
    const history = useHistory()
    const stripe = useStripe()

    React.useEffect(() => {
  
      fetch('/get-list-of-products', {
        method: 'GET'
      })
      .then(response => response.json())
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
        return
      }
      if (fetchedUser && shoppingCart.length > 0) {
        // next step, choose existing customer payment method
        // history.push('/checkout-confirm')
        fetch('/process-payment-for-classes', {
          method: 'POST',
          body: JSON.stringify({
            shoppingCart,
            paymentMethodChosen,
            stripe: fetchedUser?.user_metadata?.stripe ? fetchedUser.user_metadata.stripe : null
          }),
          headers: {
            'Content-type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          setPaymentIntentCreated( data )
          // history.push('/checkout-confirm')
        })
        .catch(err => console.log(err))

      } else {
        console.log(
          'there is nothing in your shopping cart'
        )
      }
  
    }
  
    const updateCart = product => {
      setItemsChecked({
        ...itemsChecked,
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

    const [paymentMethodChosen, setPaymentMethodChosen] = React.useState(null)
    const [paymentIntentCreated, setPaymentIntentCreated] = React.useState(null)
    const [errorMsg, setErrorMsg] = React.useState(null)
    const [successMsg, setSuccessMsg] = React.useState(null)
    
    const shoppingCartMappedToProducts = () => {
      let matches = []
      shoppingCart.forEach(item => {
        products.forEach(product => {
          if (product?.metadata?.price_id === item.price) {
            matches.push(product)
          }
        })
      })
      return matches
    }

    const cartItemsDescriptions = () => (
      shoppingCartMappedToProducts().map(item => {
        if (item.name && item?.metadata?.price) {
          return `${item.name}:  $${convertToDollar(item.metadata.price)}`
        }
      })
      .join(', ')
    )

    const cartItemsCost = () => (
      '$'
      .concat(
        convertToDollar(
          shoppingCartMappedToProducts()
          .map(item => item?.metadata?.price.slice(0, -2))
          .map(amt => parseInt(amt))
          .reduce((a, b) => a + b)      
          .toString()
          .concat('00')
        )
      )
    )
    
    return (
        <>
        {
            isLoading
            ? <><br/><div>Loading...</div></>
            :
                fetchedUser && isAuthenticated && !paymentIntentCreated ?
                <>
                  <br />
                  <h3>
                    Enroll in Classes
                  </h3>
                  <br />
                  <div>
                    {
                      products ?
                      products
                      .map(product => (
                        <>
                          <ProductBox
                          itemsChecked={itemsChecked}
                          updateCart={updateCart}
                          product={product}
                          />
                          <br />
                        </>
                      ))
                      : null
                    }
                  </div>
                  <br />
                  {
                    shoppingCart.length > 0 ?
                    <ChoosePaymentMethod
                      onPaymentMethodChosen={(pmt) => { setPaymentMethodChosen(pmt) }}
                    /> : null
                  }
                  <br />
                  <div style={{ marginTop: '50px' }}></div>
                  {
                    shoppingCart.length > 0 && paymentMethodChosen ?
                    <StyledButton
                      style={{
                        left: 0,
                        right: 0,
                        position: 'relative',
                        margin: 'auto'
                      }}
                      type='button' role='link'
                      onClick={handleClick}
                    >
                      Next
                    </StyledButton>
                    : null
                  }
                </>
                :
                // if payment intent created, confirm the payment details
                <>
                  {
                    shoppingCart.length > 0 ?
                    <>
                      <h2>Confirm Payment Details</h2>
                      <h4>Please confirm your details below and click "Confirm Payment" to complete your order</h4>
                      <br />
                      <div>
                        <div>
                          Products: { cartItemsDescriptions() }
                        </div>
                        <br />
                        <div>
                          Total: { cartItemsCost() }
                        </div>
                        <br />
                        {
                          successMsg ?
                          <div>{ successMsg }</div>
                          :
                          <StyledButton
                          onClick={() => {
                            stripe.confirmCardPayment(paymentIntentCreated.client_secret)
                            .then(response => {
                              setSuccessMsg( 'Payment Succeeded!' )
                              history.push('/checkout/?paymentSucceeded=complete')
                            })
                            .catch(err => {
                              console.log(err)
                              setErrorMsg( err.message ? err.message : 'an error occurred processing your card' )
                            })
                          }}
                          >
                            Confirm Payment
                          </StyledButton>
                        }
                        {
                          errorMsg ?
                          <div>{ errorMsg }</div>
                          : null
                        }
                      </div>
                    </>
                    : null
                  }
                </>
        }
        </>
    )
}
