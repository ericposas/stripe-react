import React from 'react'
import validator, { isEmpty, isLength, isNumeric } from 'validator'
import { includes } from 'lodash'
import './AddressInputBox.css'
import StyledButton from './StyledButton'

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
    
    return (
        <>
            <h2>Enter your address</h2>
            <div
            style={{ width: allFieldsValid() ? '300px' : '400px' }}
            className='address-form-container-div'>
                <form
                className='Address_form'
                onSubmit={(event) => {
                    event.preventDefault()
                    console.log( 'write submit logic here' )

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
                            style={{
                                position: 'relative'
                            }}
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