import React from 'react'
import { includes, isEqual, reject } from 'lodash'
import { loadStripe } from '@stripe/stripe-js'
import StyledButton from './StyledButton'
import ProductBox, { convertToDollar } from './ProductBox'
import { useAuth0 } from '@auth0/auth0-react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import { useHistory } from 'react-router-dom'
import ChoosePaymentMethod from './ChoosePaymentMethod'
import { useStripe } from '@stripe/react-stripe-js'
import { gymApiUrl } from '../utils/utils'
import useAuthToken from '../hooks/useAuthToken'
import { PacmanLoader, ClimbingBoxLoader, RingLoader } from 'react-spinners'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_PUB_KEY)

export default function Checkout () {

    const [products, setProducts] = React.useState(null)
    const [itemsChecked, setItemsChecked] = React.useState({})
    const [shoppingCart, setShoppingCart] = React.useState([])
    const { isAuthenticated, isLoading } = useAuth0()
    const fetchedUser = useFetchedUserData()
    const history = useHistory()
    const stripe = useStripe()
    const jwt = useAuthToken()

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
    const [processingPayment, setProcessingPayment] = React.useState(null)
    
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

    const processPayment = () => {
      return new Promise((resolve, reject) => {
        stripe.confirmCardPayment(paymentIntentCreated.client_secret)
        .then(response => {
          resolve( response )
        })
        .catch(err => {
          reject( err )
        })
      })
    }

    const getPTSessions = () => {
      let ptCount = shoppingCartMappedToProducts()
      .map(product => {
        let matches = product.name.match(/personal training/gi)
        if (matches) {
          console.log(
            product.metadata.count
          )
          return parseInt(product?.metadata?.count)
        } else {
          return 0
        }
      })
      console.log(
        ptCount
      )
      if (ptCount.length > 0) {
        let addedUp = ptCount.reduce((a, b) => a + b)
        return addedUp
      } else {
        return ptCount[0]
      }
    }

    const getClassList = () => {
      let classes = shoppingCartMappedToProducts()
      .map(_class => {
        let matches = _class.name.match(/subscription/gi)
        if (matches) {
          return _class.name
        }
      })
      
      if (classes.length > 0) {
        return classes
      } else {
        return []
      }
    }
    
    const postToAuth0User = () => {
      let { user_metadata } = fetchedUser
      let gym_purchases = user_metadata?.gym_purchases ? user_metadata.gym_purchases : []
      let pt_sessions = user_metadata?.pt_sessions ? user_metadata.pt_sessions : 0
      let classes = user_metadata?.classes ? user_metadata.classes : []
      console.log(
        pt_sessions,
        getPTSessions()
      )
      return new Promise((resolve, reject) => {
        fetch(`${gymApiUrl}${fetchedUser.user_id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            user_metadata: {
              ...user_metadata,
              gym_purchases: [
                ...gym_purchases,
                ...shoppingCartMappedToProducts()
              ],
              pt_sessions: (
                getPTSessions() > 0 ? getPTSessions() + pt_sessions : pt_sessions
              ),
              classes: [ ...classes, ...getClassList() ]
            }
          }),
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${jwt.access_token}`
          }
        })
        .then(response => response.json())
        .then(res => { resolve( res ) })
        .catch(err => { reject( err ) })
      })
    }
    
    return (
        <>
        {
          fetchedUser ? null
          :
            <>
              <br />
              <RingLoader
              css={{
                position: 'absolute',
                left: 0, right: 0,
                margin: 'auto',
              }}
              size={ 50 }
              color={ 'slateblue' }
              loading={ true }
              />
            </>
        }
        {
          isLoading ? <></>
          :
              fetchedUser && jwt && isAuthenticated && !paymentIntentCreated ?
              <>
                <h2>
                  Enroll in Classes
                </h2>
                <br />
                <div>
                  {
                    products ?
                    products
                    .map(product => {
                      if (fetchedUser?.user_metadata?.classes) {
                        let { user_metadata: { classes } } = fetchedUser
                        if (includes(classes, product.name)) {
                          return <></>
                        }
                      }
                      const getAltPTTag = () => {
                        if (fetchedUser?.user_metadata?.pt_sessions &&
                          product.name.match(/personal training/gi)) {
                          let { user_metadata: { pt_sessions } } = fetchedUser
                          return 'Add More Personal Training Sessions'
                        } else {
                          return null
                        }
                      }
                      return (
                        <>
                          <ProductBox
                          itemsChecked={itemsChecked}
                          updateCart={updateCart}
                          product={product}
                          altTag={ getAltPTTag()}
                          />
                          <br />
                        </>
                      )
                    })
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
                    <h2 style={{ color: processingPayment ? '#ccc' : '#000' }}>Confirm Payment Details</h2>
                    <h4 style={{ color: processingPayment ? '#ccc' : '#000' }}>Please confirm your details below and click "Confirm Payment" to complete your order</h4>
                    <br />
                    <div>
                      <div style={{ color: processingPayment ? '#ccc' : '#000' }}>
                        Products: { cartItemsDescriptions() }
                      </div>
                      <br />
                      <div style={{ color: processingPayment ? '#ccc' : '#000' }}>
                        Total: { cartItemsCost() }
                      </div>
                      <br />
                      {
                        successMsg ?
                        <div>{ successMsg }</div>
                        : null
                      }
                      {
                        processingPayment ?
                        <>
                          <br />
                          <RingLoader
                          css={{
                            position: 'absolute',
                            left: 0, right: 0,
                            margin: 'auto',
                          }}
                          size={ 50 }
                          color={ 'slateblue' }
                          loading={ true }
                          />
                          <br />
                          <br />
                          <br />
                          <br />
                          <div style={{ fontSize: '13px' }}>Processing your payment, please do not close your browser until it completes!</div>
                        </>
                        :
                        <StyledButton
                        onClick={async () => {
                          setProcessingPayment( true )
                          try {
                            let result = await processPayment()
                            console.log(
                              result
                            )
                            if (result.paymentIntent.status === 'succeeded') {
                              let postResult = await postToAuth0User()
                              if (postResult) {
                                setSuccessMsg( 'Payment Succeeded!' )
                                history.push('/checkout/?paymentSucceeded=complete')
                              }
                            }
                          } catch (err) {
                            console.log(err)
                            setErrorMsg( err.message ? err.message : 'an error occurred processing your card' )
                            history.push('/checkout/?paymentFailed=error')
                          }
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
