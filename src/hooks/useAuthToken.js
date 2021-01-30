import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function useAuthToken () {

    const [jwt, setJwt] = React.useState(null)
    const { isAuthenticated } = useAuth0()

    React.useEffect(() => {
        console.log(
        'user auth: ', isAuthenticated
        )
        if (isAuthenticated === true) {
            if (window.localStorage && !localStorage.getItem('gym-app-jwt')) {
                fetch('/retrieve-api-token', {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    setJwt(data)
                    localStorage.setItem('gym-app-jwt', JSON.stringify(data))
                    // we will update this to send the jwt to our mongo db for better security...
                    // we will then need to blacklist or invalidate old jwt tokens as well
                    // but for now, let's make a request using the jwt! (at Success component)
                    // request will be PATCH to update user 
                })
                .catch(err => console.log(err))
            } else {
                console.log(jwt)
                setJwt(JSON.parse(localStorage.getItem('gym-app-jwt')))
            }
        }

    }, [isAuthenticated])

    return jwt

}