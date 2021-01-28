import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useFetchedUserData from '../hooks/useFetchedUserData'

function useCreateStripeCustomer () {
  
  const { user } = useAuth0()

  React.useEffect(() => {

    if (user) {
      console.log(user)
      fetch('/create-stripe-customer', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email ? user.email : user.name
        }),
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.value === true) { // if we created a new Stripe customer
          console.log(data)
        }
      })
      .catch(err => console.log(err))
    }

  }, [user])

}

export default function ProfileDataPage () {

    const fetchedUserData = useFetchedUserData()
    const { isLoading, isAuthenticated, user } = useAuth0()
    useCreateStripeCustomer()

    return (
        <>
        <br />
        {
          isLoading ? <div>Loading...</div>
          :
            isAuthenticated ?
              <>
                {
                  user ?
                  <>
                    {
                      fetchedUserData ?
                      <>
                        <h3>
                          Welcome { fetchedUserData.given_name && fetchedUserData.family_name ? `${fetchedUserData.given_name} ${fetchedUserData.family_name}` : user.name }
                        </h3>
                        {
                          fetchedUserData.email && (
                            <h4>
                              Email: { fetchedUserData.email }
                            </h4>
                          )
                        }
                        {
                          fetchedUserData.user_metadata && (
                            <h4>
                              Phone number: { fetchedUserData.user_metadata.mobile ? fetchedUserData.user_metadata.mobile : null }
                            </h4>
                          )
                        }
                      </>
                      : null
                    }
                  </>
                  : null
                }
                <br />
                <br />
              </>
            :
              <>
                <div>Sign Up or Sign In</div><br />
              </>
        }
      </>

    )

}