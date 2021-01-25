import React from 'react'
import './Success.css'
import { useLocation } from 'react-router-dom'
import validator from 'validator'
import { isEqual } from 'lodash'
import StyledButton from './components/StyledButton'

export default function SuccessPage () {

    const location = useLocation()

    const handleSubmit = (event) => {
        event.preventDefault()
        // send data to an endpoint to store student info

    }

    const [firstNameField, setFirstNameField] = React.useState('')
    const [lastNameField, setLastNameField] = React.useState('')
    const [emailField, setEmailField] = React.useState('')
    const [passwordField, setPasswordField] = React.useState('')
    const [passwordConfirmField, setPasswordConfirmField] = React.useState('')

    React.useEffect(() => {
        // get session data to populate form fields
        let session_id = location.search.split('=')[1]
        let response = fetch('/get-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
            session_id
        }),
        headers: {
            'Content-type': 'application/json'
        }
        })
        .then(response => response.json())
        .catch(err => console.log(err))
        
        response
        .then(data => {
        let { customer } = data
        setEmailField(customer.email)
        console.log(customer)
        })
        .catch(err => console.log(err))

    }, [])

    const allFieldsValid = () => {
        if (
            (!validator.isEmpty(passwordField) || validator.isLength(passwordField, { min: 8, max: 100 })) &&
            isEqual(passwordField, passwordConfirmField) &&
            !validator.isEmpty(firstNameField) && !validator.isEmpty(lastNameField) &&
            validator.isEmail(emailField)
        ) {
            return true
        } else {
            return false
        }
    }

    return (
        <>
        <br />
        <div>
            Payment was successful! Please finish setting up your profile
        </div>
        <br />
        <form
        className={'Success_form'}
        onSubmit={handleSubmit}>
            <label htmlFor='first-name'>First name: &nbsp;</label>
            <input
            id='first-name' type='text'
            onChange={(event) => {
            setFirstNameField(event.target.value)
            }}
            value={firstNameField}
            />
            <div style={{ color: 'red' }} >
            {
                validator.isEmpty(firstNameField) ?
                'enter a name' : null
            }
            </div>
            <br />
            <br />
            <label htmlFor='last-name'>Last name: &nbsp;</label>
            <input
            id='last-name' type='text'
            onChange={(event) => {
            setLastNameField(event.target.value)
            }}
            value={lastNameField}
            />
            <div style={{ color: 'red' }} >
            {
                validator.isEmpty(lastNameField) ?
                'enter a last name' : null
            }
            </div>
            <br />
            <br />
            <label htmlFor='email'>Email address: &nbsp;</label>
            <input
            id='email' type='text'
            value={emailField}
            onChange={(event) => {
            setEmailField(event.target.value)
            }}
            />
            <div style={{ color: 'red' }} >
            {
                !validator.isEmail(emailField) ?
                'enter a valid email' : null
            }
            </div>
            <br />
            <br />
            <label htmlFor='password'>Password: &nbsp;</label>
            <input
            id='password' type='password'
            value={passwordField}
            onChange={(event) => {
                setPasswordField(event.target.value)
            }}
            />
            <div style={{ color: 'red' }} >
                {
                    validator.isEmpty(passwordField) || !validator.isLength(passwordField, { min: 8, max: 100 })
                    ? '8 char. minimum'
                    : null
                }
            </div>
            <br />
            <br />
            <label htmlFor='password-confirm'>Confirm Password: &nbsp;</label>
            <input
            id='password-confirm' type='password'
            value={passwordConfirmField}
            onChange={(event) => {
                setPasswordConfirmField(event.target.value)
            }}
            />
            <div style={{ color: 'red' }}>
                {
                    !isEqual(passwordField, passwordConfirmField)
                    ? 'passwords do not match'
                    : null 
                }
            </div>
            <br />
            <br />
            {
                allFieldsValid() ?
                <StyledButton
                style={{
                    'left': 0,
                    'right': 0,
                    'bottom': '40px',
                    'position': 'absolute',
                    'margin': 'auto'
                }}
                type='submit' role='button'>
                    Complete Enrollment
                </StyledButton>
                : null
            }
        </form>
        </>
    )
}
