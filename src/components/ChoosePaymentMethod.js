import React from 'react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import visaLogo from '../images/visa.png'
import mastercardLogo from '../images/mastercard.png'

export default function ChoosePaymentMethod () {

    const fetchedUser = useFetchedUserData()
    const [paymentMethods, setPaymentMethods] = React.useState(null)
    const [chosenPmtMethod, setChosenPmtMethod] = React.useState(null)

    React.useEffect(() => {
        if (fetchedUser) {
            console.log('should fire a request')
            console.log('fetch should work')
            fetch(`/get-payment-methods/${fetchedUser?.user_metadata?.stripe?.customer?.id}`, {
                method: 'POST',
                body: JSON.stringify({
                    stripe: fetchedUser?.user_metadata?.stripe
                }),
                headers: {
                    'Content-type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setPaymentMethods(data.paymentMethods)
            })
            .catch(err => console.log(err))
        }
    }, [fetchedUser])

    React.useEffect(() => {
        console.log(paymentMethods)
    }, [paymentMethods])

    React.useEffect(() => {
        console.log(chosenPmtMethod)
    }, [chosenPmtMethod])

    return <>
        {
            paymentMethods ?
            <>
                <br />
                {
                    chosenPmtMethod ?
                    <img
                        src={
                        chosenPmtMethod.card.brand === 'visa' ? visaLogo
                        :
                            chosenPmtMethod.card.brand === 'mastercard' || chosenPmtMethod.card.brand === 'mc' ? mastercardLogo
                            :
                                null
                        }
                    />
                    : <div>no payment method selected</div>
                }
                <br />
                {
                    chosenPmtMethod ?
                    <>
                        <div>
                            Selected payment method: &nbsp;
                            <span>{ `${ chosenPmtMethod.card.brand }   *${ chosenPmtMethod.card.last4 }` }</span>
                        </div>
                        <div>{ chosenPmtMethod.id }</div>
                    </>
                    : null
                }
                <br />
                <select
                    style={{ width: '200px' }}
                    onChange={(event) => {
                        console.log(event.target.value)
                        setChosenPmtMethod(event.target.value !== 'none' ? JSON.parse(event.target.value) : null)
                    }}
                >
                    <option value={'none'}>Choose payment method</option>
                    {
                        paymentMethods.map(pmtMethod => {
                            return (
                                <option value={ JSON.stringify(pmtMethod) }>
                                    { pmtMethod.card.brand }   *{ pmtMethod.card.last4 }
                                </option>
                            )
                        })
                    }
                </select>
            </>
            : null
        }
    </>

}