import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import UpdateUserDataForm from './components/UpdateUserDataForm'
import useAuthToken from './hooks/useAuthToken'
import useFetchedUserData from './hooks/useFetchedUserData'

function usePatchStripeSessionData (stripeSession) {

    const [res, setRes] = React.useState(null)
    const jwt = useAuthToken()
    const user = useFetchedUserData()

    React.useEffect(() => {

        if (user && jwt && stripeSession) {
            let status, statusCode
            let subscriptions =
                user.user_metadata?.subscriptions ? user.user_metadata.subscriptions.push(stripeSession.subscription)
                : [ stripeSession.subscription ]
            fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.user_id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    user_metadata: {
                        stripe: {
                            customer: user.user_metadata?.customer ? user.user_metadata.customer : stripeSession.customer,
                            subscriptions: subscriptions !== user.user_metadata.subscriptions ? subscriptions : user.user_metadata.subscriptions
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
                setRes(data)
                statusCode = data.statusCode ? data.statusCode : null
                // setTimeout(() => {
                //     history.push(`/?${queryKey}=${queryValue}`)
                // }, 250)
            })
            .catch(err => {
                console.log(err)
                if (status === 401  || statusCode === 401) {
                    if (localStorage.getItem('gym-app-jwt')) {
                        localStorage.removeItem('gym-app-jwt')
                    }
                }
            })
        }

    }, [user, jwt, stripeSession])

    return res

}

export default function SuccessPage () {

    const location = useLocation()
    const history = useHistory()
    const { isLoading, isAuthenticated, user } = useAuth0()
    const [stripeSession, setStripeSession] = React.useState(null)
    usePatchStripeSessionData(stripeSession)

    React.useEffect(() => {
        console.log(
            stripeSession
        )
    }, [stripeSession])

    React.useEffect(() => {
        // get session data to populate form fields
        let session_id
        if (location.search) {
            session_id = location.search.split('=')[1]
        }
        if (session_id) {
            if (isAuthenticated === true) {
                // get stripe customer data 
                let data = fetch('/get-checkout-session', {
                    method: 'POST',
                    body: JSON.stringify({ session_id }),
                        headers: { 'Content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    let { session } = data
                    setStripeSession(session)
                })
                .catch(err => console.log(err))
            }
        } else {
            // redirect to home
            history.push('/')
        }

    }, [ isAuthenticated ])

    const markup = () => (
        <>
            <br />
            <div>
                Payment was successful! Please finish setting up your profile
            </div>
            <br />
            <UpdateUserDataForm
            user={user}
            onCompleteParams={{
                queryKey: 'profileSetup',
                queryValue: 'complete',
            }}
            submitLabel={ 'Complete Enrollment' }
            />
        </>
    )

    return (
        <>
        {
            isLoading
            ? <><br /><div>Loading...</div></>
            :
                isAuthenticated
                ? markup()
                : null
        }
        </>
    )
}
