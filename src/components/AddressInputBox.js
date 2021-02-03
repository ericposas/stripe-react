import React from 'react'
import validator, { isEmpty, isLength, isNumeric } from 'validator'
import { includes } from 'lodash'
import './AddressInputBox.css'
import StyledButton from './StyledButton'
import useFetchedUserData from '../hooks/useFetchedUserData'
import { gymApiUrl } from '../utils/utils'
import useAuthToken from '../hooks/useAuthToken'
import { useHistory } from 'react-router-dom'

export function InputFieldErr ({ validators }) {

    const checkValidators = () => {
        if (includes(validators, false)) {
            return false
        }
        return true
    }

    return (
        <>
            {
                 checkValidators() ? <></>
                 :
                 <div
                    style={{ color: 'red' }}
                    className='address-error-msg'>Please fill input field
                </div>
            }
        </>
    )

}

export default function AddressInputBox () {

    const history = useHistory()
    const jwt = useAuthToken()
    const fetchedUser = useFetchedUserData()
    const [fetchedAddress, setFetchedAddress] = React.useState(null)
    const [streetField, setStreetField] = React.useState('')
    const [cityField, setCityField] = React.useState('')
    const [stateField, setStateField] = React.useState('')
    const [zipField, setZipField] = React.useState('')

    const streetValidators = [ !isEmpty(streetField) ]
    const cityValidators = [ !isEmpty(cityField) ]
    const stateValidators = [
        !isEmpty(stateField),
        isLength(stateField, { min: 2, max: undefined })
    ]
    const zipValidators = [
        !isEmpty(zipField),
        isNumeric(zipField),
        isLength(zipField, { min: 5, max: 5 })
    ]
    const validatorsArray = streetValidators
    .concat(cityValidators)
    .concat(stateValidators)
    .concat(zipValidators)

    const allFieldsValid = () => {
        if (includes(validatorsArray, false)) {
            return false
        }
        return true
    }
    
    React.useEffect(() => {
        if (fetchedUser) {
            let { user_metadata: { address: { city, state, street, zip } } } = fetchedUser
            setCityField( city )
            setStateField( state )
            setStreetField( street )
            setZipField( zip )
            setFetchedAddress( { city, state, street, zip } )
        }
    }, [fetchedUser])

    const submitAddressData = async () => {

        setEditAddress( false )
        if (fetchedUser && jwt) {
            try {
                // post to Auth0 /users endpoint
                let { user_id, user_metadata } = fetchedUser
                let auth0Response = await fetch(`${gymApiUrl}${user_id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        user_metadata: {
                            ...user_metadata,
                            address: {
                                street: streetField,
                                city: cityField,
                                state: stateField,
                                zip: zipField
                            }
                        }                        
                    }),
                    headers: {
                        'content-type': 'application/json',
                        'authorization': `Bearer ${jwt.access_token}`
                    }
                })
                let auth0ResResolved = await auth0Response.json()
                console.log(
                    auth0ResResolved
                )

                // post to Stripe
                let stripeResponse = await fetch('/post-user-address-data', {
                    method: 'POST',
                    body: JSON.stringify({
                        user: fetchedUser,
                        street: streetField,
                        city: cityField,
                        state: stateField,
                        zip: zipField
                    }),
                    headers: { 'content-type': 'application/json' }
                })
                let stripeResResolved = await stripeResponse.json()
                console.log(
                    stripeResResolved
                )
                let { address: { city, state, line1, postal_code } } = stripeResResolved
                setCityField( city )
                setStateField( state )
                setStreetField( line1 )
                setZipField( postal_code )
                setFetchedAddress({
                    city,
                    state,
                    street: line1,
                    zip: postal_code
                })
                
                history.push('/update-address/?updatedAddress=complete')

            } catch (err) {
                console.log(err)

            }
        }
    
    }
    
    const [editAddress, setEditAddress] = React.useState(false)
    
    return (
        fetchedAddress && editAddress === false
        ?
        <>
            <h2>
                Your address on file <button style={{ display: 'inline' }} onClick={() => setEditAddress(true)}>Edit</button>
            </h2>
            <div>
                { fetchedAddress.street }
            </div>
            <div>
                { fetchedAddress.city }, { fetchedAddress.state } { fetchedAddress.zip }

            </div>
        </>
        :
        <>
            <h2>Enter your address <button style={{ display: 'inline' }} onClick={() => setEditAddress(false)}>Cancel</button></h2>
            <div
            style={{ width: allFieldsValid() ? '300px' : '400px' }}
            className='address-form-container-div'>
                <form
                className='Address_form'
                onSubmit={(event) => {
                    event.preventDefault()
                    submitAddressData()
                }}
                >
                    <br />
                    <div className='address-input-group'>
                        <label htmlFor='street'>Street: </label>
                        <input
                        id='street'                    
                        type='text'
                        value={streetField}
                        onChange={(event) => { setStreetField( event.target.value ) }}
                        />
                    </div>
                    <InputFieldErr
                    validators={streetValidators}
                    />
                    <br />
                    <br />

                    <div className='address-input-group'>
                        <label htmlFor='city'>City: </label>
                        <input
                        id='city'
                        type='text'
                        value={cityField}
                        onChange={(event) => { setCityField( event.target.value ) }}
                        />
                    </div>
                    <InputFieldErr
                    validators={cityValidators}
                    />
                    <br />
                    <br />
                    
                    <div className='address-input-group'>
                        <label htmlFor='state'>State: </label>
                        <input
                        id='state'
                        type='text'
                        value={stateField}
                        onChange={(event) => { setStateField( event.target.value ) }}
                        />
                    </div>
                    <InputFieldErr
                    validators={stateValidators}
                    />
                    <br />
                    <br />
                    
                    <div className='address-input-group'>
                        <label htmlFor='zip'>Zip: </label>
                        <input
                        id='zip'
                        type='text'
                        value={zipField}
                        onChange={(event) => { setZipField( event.target.value ) }}
                        />
                    </div>
                    <InputFieldErr
                    validators={zipValidators}
                    />
                    <br />
                    <br />

                    {
                        allFieldsValid() ?
                        <>
                            <br />
                            <StyledButton
                            role='submit'
                            style={{ position: 'relative' }}
                            >
                                Submit
                            </StyledButton>
                            <br />
                            <br />
                        </>
                        : <></>
                    }

                </form>
            </div>
        </>
    )

}