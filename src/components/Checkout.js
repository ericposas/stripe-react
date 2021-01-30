import React from 'react'
import { isEqual } from 'lodash'
import { loadStripe } from '@stripe/stripe-js'
import StyledButton from './StyledButton'
import ProductBox from './ProductBox'
import { useAuth0 } from '@auth0/auth0-react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import { useHistory } from 'react-router-dom'
import ChoosePaymentMethod from './ChoosePaymentMethod'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_PUB_KEY)

export default function Checkout () {

    const [products, setProducts] = React.useState(null)
    const [itemsChecked, setItemsChecked] = React.useState({})
    const [shoppingCart, setShoppingCart] = React.useState([])
    const { isAuthenticated, isLoading } = useAuth0()
    const fetchedUser = useFetchedUserData()
    const history = useHistory()

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
        return
      }
      if (fetchedUser && shoppingCart.length > 0) {
        // next step, choose existing customer payment method
        history.push('/checkout-confirm')

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

    const [paymentMethodChosen, setPaymentMethodChosen] = React.useState(null)
    
    return (
        <>
        {
            isLoading
            ? <><br/><div>Loading...</div></>
            :
                fetchedUser && isAuthenticated ?
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
                : null
        }
        </>
    )
}
