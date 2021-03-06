import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useAuthToken from './useAuthToken'

export default function useCreateStripeCustomer () {
  
  const { user, logout } = useAuth0()
  const [stripeCustomer, setStripeCustomer] = React.useState(null)
  const jwt = useAuthToken()
  
  React.useEffect(() => {

    if (stripeCustomer) { // once we have both the stripeCustomer and jwt deps.. do..
      // patch stripe customer through to auth0 user 
      
      console.log('stripe customer created')

      if (jwt) {
        
        let status, statusCode
        fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.user_id ? user.user_id : user.sub}`, {
            method: 'PATCH',
            body: JSON.stringify({
              user_metadata: {
                stripe: {
                  customer: stripeCustomer
                }
              }
            }),
            headers: {
              'content-type': 'application/json',
              'authorization': `Bearer ${jwt.access_token}`
            }
        })
        .then(response => {
          status = response.status
          return response.json()
        })
        .then(data => {
          console.log(data)
          statusCode = data.statusCode ? data.statusCode : null
        })
        .catch(err => {
            console.log(err)
            if (status === 401 || statusCode === 401) {
              if (localStorage.getItem('gym-app-jwt')) {
                localStorage.removeItem('gym-app-jwt')
                logout({ redirectTo: window.location.origin })
              }
            }
        })
      }

    }

  }, [stripeCustomer, jwt]) // on stripeCustomer or jwt state change.. do..

  React.useEffect(() => {

    if (user) {
      console.log(user)
      console.log(
        user.email
      )

      console.log('hook should create stripe customer')

      let bodyData = {
        email: user.email
      }
      if (user.given_name && user.family_name) {
        bodyData.name = `${user.given_name} ${user.family_name}`
      }

      fetch('/create-stripe-customer', {
        method: 'POST',
        body: JSON.stringify(bodyData),
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.value === true) { // if we created a new Stripe customer
          console.log(data)
          let { customer } = data
          setStripeCustomer(customer) // save the stripe api data to auth0 user
        }
      })
      .catch(err => console.log(err))
    }

  }, [user])

}