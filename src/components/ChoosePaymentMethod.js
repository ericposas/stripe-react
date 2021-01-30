import React from 'react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import visaLogo from '../images/visa.png'
import mastercardLogo from '../images/mastercard.png'

export default function ChoosePaymentMethod ({ onPaymentMethodChosen }) {

    const fetchedUser = useFetchedUserData()
    const [paymentMethods, setPaymentMethods] = React.useState(null)
    const [chosenPmtMethod, setChosenPmtMethod] = React.useState(null)

    React.useEffect(() => {
        if (fetchedUser && fetchedUser?.user_metadata?.stripe?.paymentMethods) {
            let { user_metadata: { stripe: { paymentMethods: pmts } } } = fetchedUser
            setPaymentMethods(
                Object.keys(pmts).map(key => pmts[key])
            )
        }
    }, [fetchedUser])

    React.useEffect(() => {
        console.log(paymentMethods)
    }, [paymentMethods])

    React.useEffect(() => {
        console.log(chosenPmtMethod)
        if (onPaymentMethodChosen) {
            onPaymentMethodChosen( chosenPmtMethod )
        }
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
                    : null
                }
                <br />
                {
                    chosenPmtMethod ?
                    <>
                        <div>
                            Selected Payment Method: &nbsp;
                            <span>{ `${ chosenPmtMethod.card.brand }   *${ chosenPmtMethod.card.last4 }` }</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#ccc' }}>
                            Payment Method ID: { chosenPmtMethod.id }
                        </div>
                    </>
                    : <div>no payment method selected</div>
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
            :
            <>
                <br />
                <div>No payment methods have been set up</div>
            </>
        }
    </>

}