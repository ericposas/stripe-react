import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useAuthToken from './useAuthToken'

export default function useFetchedUserData () {

  const [fetchedUserData, setFetchedUserData] = React.useState(null)
  const { user } = useAuth0()
  const jwt = useAuthToken()

  React.useEffect(() => {
    
    if (user && jwt) {
      let status, statusCode
      fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.user_id ? user.user_id : user.sub}`, {
          method: 'GET',
          headers: { 'authorization': `Bearer ${jwt.access_token}` }
      })
      .then(response => {
        status = response.status
        return response.json()
      })
      .then(data => {
          statusCode = data.statusCode ? data.statusCode : null
          console.log('fetched data', data)
          setFetchedUserData(data)
      })
      .catch(err => {
        console.log(err)
        if (status === 401 || statusCode === 401) {
          if (localStorage.getItem('gym-app-jwt')) {
            localStorage.removeItem('gym-app-jwt')
          }
        }
      })
    } else {
      console.log('not fetching')
    }
    
  }, [jwt, user])

  return fetchedUserData

}