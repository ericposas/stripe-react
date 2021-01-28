import React from 'react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import useCreateStripeCustomer from '../hooks/useCreateStripeCustomer'
import { useAuth0 } from '@auth0/auth0-react'

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