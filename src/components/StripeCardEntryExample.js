import React, {useState} from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import './2-Card-Detailed.css'
import useFetchedUserData from '../hooks/useFetchedUserData'
import { useAuth0 } from '@auth0/auth0-react'
import { useHistory } from 'react-router-dom'
import { gymApiUrl } from '../utils/utils'
import useAuthToken from '../hooks/useAuthToken'
import { RingLoader } from 'react-spinners'

const CARD_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      iconColor: '#c4f0ff',
      color: '#000',
      fontWeight: 500,
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': {
        color: '#fce883',
      },
      '::placeholder': {
        color: 'rgba(0, 0, 0, 0.25)',
      },
    },
    invalid: {
      iconColor: '#666',
      color: '#666',
    },
  },
}

const CardField = ({onChange}) => (
  <div className="FormRow">
    <CardElement options={CARD_OPTIONS} onChange={onChange} />
  </div>
);

const Field = ({
  label,
  id,
  type,
  placeholder,
  required,
  autoComplete,
  value,
  onChange,
}) => (
  <div className="FormRow">
    <label htmlFor={id} className="FormRowLabel">
      {label}
    </label>
    <input
      className="FormRowInput"
      id={id}
      type={type}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
    />
  </div>
)

const SubmitButton = ({processing, error, children, disabled}) => (
  <button
    className={`SubmitButton ${error ? 'SubmitButton--error' : ''}`}
    type="submit"
    disabled={processing || disabled}
  >
    {processing ? 'Processing...' : children}
  </button>
)

const ErrorMessage = ({children}) => (
  <div className="ErrorMessage" role="alert">
    <svg width="16" height="16" viewBox="0 0 17 17">
      <path
        fill="#FFF"
        d="M8.5,17 C3.80557963,17 0,13.1944204 0,8.5 C0,3.80557963 3.80557963,0 8.5,0 C13.1944204,0 17,3.80557963 17,8.5 C17,13.1944204 13.1944204,17 8.5,17 Z"
      />
      <path
        fill="#6772e5"
        d="M8.5,7.29791847 L6.12604076,4.92395924 C5.79409512,4.59201359 5.25590488,4.59201359 4.92395924,4.92395924 C4.59201359,5.25590488 4.59201359,5.79409512 4.92395924,6.12604076 L7.29791847,8.5 L4.92395924,10.8739592 C4.59201359,11.2059049 4.59201359,11.7440951 4.92395924,12.0760408 C5.25590488,12.4079864 5.79409512,12.4079864 6.12604076,12.0760408 L8.5,9.70208153 L10.8739592,12.0760408 C11.2059049,12.4079864 11.7440951,12.4079864 12.0760408,12.0760408 C12.4079864,11.7440951 12.4079864,11.2059049 12.0760408,10.8739592 L9.70208153,8.5 L12.0760408,6.12604076 C12.4079864,5.79409512 12.4079864,5.25590488 12.0760408,4.92395924 C11.7440951,4.59201359 11.2059049,4.59201359 10.8739592,4.92395924 L8.5,7.29791847 L8.5,7.29791847 Z"
      />
    </svg>
    {children}
  </div>
)

export default function StripeCardEntryExample () {

  const stripe = useStripe()
  const elements = useElements()
  const fetchedUser = useFetchedUserData() // my hook 
  const { isLoading, isAuthenticated } = useAuth0()
  const [error, setError] = useState(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [billingDetails, setBillingDetails] = useState({
    email: '',
    phone: '',
    name: '',
  })
  const [keepBillingDetails, setKeepBillingDetails] = useState(true)
  const history = useHistory()
  const jwt = useAuthToken()

  const patchPaymentMethodData = (data) => {
    let { user_metadata: { stripe } } = fetchedUser
    let paymentMethods
    if (stripe.paymentMethods) {
      paymentMethods = stripe.paymentMethods
    } else {
      paymentMethods = {}
    }
    let new_metadata = {
      stripe: {
        ...stripe,
        paymentMethods: {
          ...paymentMethods,
          [data.id]: data
        }
      }
    }
    fetch(`${gymApiUrl}${fetchedUser.user_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        user_metadata: new_metadata
      }),
      headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${jwt.access_token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('saved payment data to auth0 user', data)
    })
    .catch(err => console.log(err))
  }

  React.useEffect(() => {
    if (paymentMethod) {
      history.push('/?paymentMethodSetup=complete')
    }
  }, [paymentMethod])

  React.useEffect(() => {
    if (fetchedUser) {
        setBillingDetails({
            email: fetchedUser.email,
            phone: fetchedUser.user_metadata?.mobile ? fetchedUser.user_metadata.mobile : '',
            name: fetchedUser?.given_name && fetchedUser?.family_name ? fetchedUser.given_name + ' ' + fetchedUser.family_name : 'user'
        })
    }
  }, [fetchedUser])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (fetchedUser?.user_metadata?.stripe?.customer) {
        // console.log( fetchedUser.user_metadata.stripe.customer.id )
        
        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return
        }
    
        if (error) {
            elements.getElement('card').focus()
            return
        }
    
        if (cardComplete) {
            setProcessing(true)
        }
    
        const payload = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
            billing_details: billingDetails,
        })
    
        setProcessing(false)
    
        if (payload.error) {
            setError(payload.error)
        } else {
            setPaymentMethod(payload.paymentMethod)
        }

        // my backend route 
        if (!error) {
            console.log(payload.paymentMethod)
            fetch('/attach-payment-method', {
                method: 'POST',
                body: JSON.stringify({
                    paymentMethod: payload.paymentMethod,
                    customer: fetchedUser.user_metadata.stripe.customer
                }),
                headers: { 'Content-type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                let { paymentMethodAttachResult } = data
                // setPmtMethodResult(
                //   paymentMethodAttachResult
                // )
                patchPaymentMethodData( paymentMethodAttachResult )
            })
            .catch(err => {
                console.log(err)
            })

        } else {
            console.log(error)
        }

    } else {
        console.log('stripe customer id data not found in auth0 user object')
    }
  }

  return (
    <>
      <h2>Enter a Payment Method</h2>
        <>
            {
                fetchedUser && fetchedUser.family_name && fetchedUser.given_name && fetchedUser?.user_metadata?.mobile ?
                <>
                    <>
                        <br />
                        {
                            keepBillingDetails === true ?
                            <>
                                <div style={{ display: 'inline-block' }}>Keeping current user billing info:</div>
                                <button
                                style={{ display: 'inline-block', marginLeft: '10px' }}
                                onClick={() => setKeepBillingDetails(false)}
                                >
                                    Change Billing Info
                                </button>
                                <br />
                                <br />
                                {
                                    fetchedUser ?
                                    <>
                                        <div>{fetchedUser?.given_name && fetchedUser?.family_name ? fetchedUser.given_name + ' ' + fetchedUser.family_name : 'no name set in profile'}</div>
                                        <div>{fetchedUser?.email ? fetchedUser.email : ''}</div>
                                        <div>{fetchedUser?.user_metadata?.mobile ? fetchedUser.user_metadata.mobile : 'no mobile number set in profile'}</div>
                                    </>
                                    : <></>
                                }
                            </>
                            :
                            <>
                                <div></div>
                                <button
                                onClick={() => {
                                    if (fetchedUser) {
                                        setBillingDetails({
                                            email: fetchedUser.email,
                                            phone: fetchedUser.user_metadata?.mobile ? fetchedUser.user_metadata.mobile : '',
                                            name: fetchedUser?.given_name && fetchedUser?.family_name ? fetchedUser.given_name + ' ' + fetchedUser.family_name : 'user'
                                        })
                                        setKeepBillingDetails(true)
                                    }
                                }}
                                >
                                    Cancel
                                </button>
                            </>
                        }
                    </>
                    <div id='form-container'>
                        <form className="Form" onSubmit={handleSubmit}>
                            {
                                keepBillingDetails === false ?
                                <fieldset className="FormGroup">
                                    <Field
                                    label="Name"
                                    id="name"
                                    type="text"
                                    placeholder="Jane Doe"
                                    required
                                    autoComplete="name"
                                    value={billingDetails.name}
                                    onChange={(e) => {
                                        setBillingDetails({...billingDetails, name: e.target.value});
                                    }}
                                    />
                                    <Field
                                    label="Email"
                                    id="email"
                                    type="email"
                                    placeholder="janedoe@gmail.com"
                                    required
                                    autoComplete="email"
                                    value={billingDetails.email}
                                    onChange={(e) => {
                                        setBillingDetails({...billingDetails, email: e.target.value});
                                    }}
                                    />
                                    <Field
                                    label="Phone"
                                    id="phone"
                                    type="tel"
                                    placeholder="(941) 555-0123"
                                    required
                                    autoComplete="tel"
                                    value={billingDetails.phone}
                                    onChange={(e) => {
                                        setBillingDetails({...billingDetails, phone: e.target.value});
                                    }}
                                    />
                                </fieldset>
                                : <></>
                            }
                        <fieldset className="FormGroup">
                            <CardField
                            onChange={(e) => {
                                setError(e.error);
                                setCardComplete(e.complete);
                            }}
                            />
                        </fieldset>
                        {error && <ErrorMessage>{error.message}</ErrorMessage>}
                        <div
                        style={{
                          width: '300px',
                          position: 'absolute',
                          left: 0, right: 0,
                          margin: 'auto'
                        }}
                        >
                          <SubmitButton processing={processing} error={error} disabled={!stripe}>
                              Create Payment Method
                          </SubmitButton>
                        </div>
                        </form>
                    </div>
                </>
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
                  loading={ fetchedUser ? false : true }
                  />
                  {
                      fetchedUser && isAuthenticated === true ?
                          isLoading ?
                          null
                          :
                          <>
                              <br />
                              <div>Please update your profile info with your full name and mobile phone before adding a payment method</div>
                          </>
                      : null
                  }
              </>
            }
        </>
    </>
  )
}

const ELEMENTS_OPTIONS = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
    },
  ],
};

// export default StripeCardEntryExample

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

// const App = () => {
//   return (
//     <div className="AppWrapper">
//       <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
//         <CheckoutForm />
//       </Elements>
//     </div>
//   );
// };

// export default App;