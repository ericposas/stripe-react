import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useAuthToken from './useAuthToken'

export default function useFetchedUserData () {

  const [fetchedUserData, setFetchedUserData] = React.useState(null)
  const { user } = useAuth0()
  const jwt = useAuthToken()

  React.useEffect(() => {
    
    if (user && jwt) {
      fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.sub}`, {
          method: 'GET',
          headers: { 'authorization': `Bearer ${jwt.access_token}` }
      })
      .then(response => response.json())
      .then(data => {
          setFetchedUserData(data)
      })
      .catch(err => console.log(err))
    } else {
      console.log('not fetching', user, jwt)
    }
    
  }, [jwt, user])

  return fetchedUserData

}