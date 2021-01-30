import React from 'react'
import useFetchedUserData from '../hooks/useFetchedUserData'

export default function ChoosePaymentMethod () {

    const fetchedUser = useFetchedUserData()

    React.useEffect(() => {
        if (fetchedUser) {
            console.log('fetch should work')
            fetch(`/get-payment-methods/${fetchedUser?.user_metadata?.stripe?.customer?.id}`, {
                method: 'POST',
                // body: JSON.stringify({ customer: fetchedUser?.user_metadata?.stripe?.customer?.id })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(err => console.log(err))
        }
    }, [fetchedUser])

    return <>
        {
            fetchedUser?.given_name
        }
        <div>what</div>
    </>

}