import React from 'react'
import {
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'
import useFetchedUserData from '../hooks/useFetchedUserData'

export default function CreditCardEntry () {

    const stripe = useStripe()
    const elements = useElements()
    const fetchedUser = useFetchedUserData()

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (fetchedUser?.user_metadata?.stripe?.customer) {
            console.log(
                fetchedUser.user_metadata.stripe.customer.id
            )
            // maybe we'll try using the api directly, let call a route on our backend..
            
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                customer: fetchedUser.user_metadata.stripe.customer.id,
                card: elements.getElement(CardElement)
            })

            if (!error) {
                console.log(paymentMethod)
                fetch('/attach-payment-method', {
                    method: 'POST',
                    body: JSON.stringify({
                        paymentMethod,
                        customer: fetchedUser.user_metadata.stripe.customer
                    }),
                    headers: { 'Content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    
                })
                .catch(err => {
                    console.log(err)
                })
            } else {
                console.log(error)
            }

        } else {
            console.log('stripe customer id data not found in auth0 user object')
        }
    }

    return (
        <>
            {
                fetchedUser && (
                    <>
                        <br />
                        <div>Enter Card Details</div>
                        <br />
                        <form onSubmit={handleSubmit}>
                            <CardElement />
                            <button type={'submit'} disabled={!stripe}>
                                Pay
                            </button>
                        </form>
                    </>
                )
            }
        </>
    )

}