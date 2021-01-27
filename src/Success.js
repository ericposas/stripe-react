import React from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import UpdateUserDataForm from './components/UpdateUserDataForm'

export default function SuccessPage () {

    const location = useLocation()
    const history = useHistory()
    const { isLoading, isAuthenticated } = useAuth0()

    React.useEffect(() => {
        // get session data to populate form fields
        let session_id
        if (location.search) {
            session_id = location.search.split('=')[1]
        }
        if (session_id) {

            if (isAuthenticated === true) {

                // get stripe customer data 
                fetch('/get-checkout-session', {
                    method: 'POST',
                    body: JSON.stringify({ session_id }),
                        headers: { 'Content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    let { customer } = data
                    console.log('stripe-customer-data:', customer)
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
            <UpdateUserDataForm submitLabel={ 'Complete Enrollment' } />
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
