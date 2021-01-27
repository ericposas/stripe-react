import { useAuth0 } from '@auth0/auth0-react'
import React from 'react'
import { useAuthToken } from '../App'

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

    // if (user) {
    //   if (jwt) {
    //   // if (localStorage.getItem('gym-app-jwt')) {
    //     // let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
    //     // let's get Auth0 user instead data
    //   }
    // }

  }, [jwt, user])

  return fetchedUserData

}