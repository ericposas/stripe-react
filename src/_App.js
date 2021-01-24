import React from 'react'
import './App.css'
import { loadStripe } from '@stripe/stripe-js'
import {
  CardElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
// import Stripe from 'stripe'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_PUB_KEY)

function _App() {

  const [checkout, setCheckout] = React.useState(false)

  return (
      <>
      <div>
        Stripe API Checkout Example
      </div><br />
      {
        !checkout
        ?
          <button
          onClick={() => setCheckout(true)}
          type='button' role='link'>
            Checkout
          </button>
        :
        <Elements
        stripe={stripePromise}
        className="App">
          <CheckoutForm />
        </Elements>
      }
      </>
  )
}

const CheckoutForm = () => {

  const [error, setError] = React.useState(null)
  const stripe = useStripe()
  const elements = useElements()

  // Handle real-time change from  the card Element
  const handleChange = (event) => {
    if (event.error) {
      setError(event.error.message)
    } else {
      setError(null)
    }
  }

  const stripeTokenHandler = async token => {
    try {
      const response = await fetch('/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token.id })
      })
      return response.json()
    } catch (err) {
      console.log(err)
    }
  }

  // Handle form submission.
  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const card = elements.getElement(CardElement)
      const result = await stripe.createToken(card)
      if (result.error) {
        // Inform the user if there was an error.
        setError(result.error.message)
      } else {
        setError(null)
        // Send the token to your server
        stripeTokenHandler(result.token)
        .then(response => console.log(response))
      }
    } catch (err) {
      console.log(err)
    }

  }

  // Custom styling can be passed to options when creating an Element.
  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className='form-row'>
          <label htmlFor='card-element'>
            Credit or debit card
          </label>
          <CardElement
          id='card-element'
          options={CARD_ELEMENT_OPTIONS}
          onChange={handleChange}
          />
          <div className='card-errors' role='alert'></div>
        </div>
        <button type='submit'>
          Submit Payment
        </button>
        {
          error ? <div>Error occurred</div> : null
        }
      </form>
    </>
  )
}

export default _App
