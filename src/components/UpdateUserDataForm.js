import React from 'react'
import './UpdateUserDataForm.css'
import validator from 'validator'
import StyledButton from './StyledButton'
import awesomePhonenumber from 'awesome-phonenumber'
import { isGoogleAccount } from '../utils/utils'
import { useAuth0 } from '@auth0/auth0-react'
import { useHistory } from 'react-router-dom'
import useFetchedUserData from '../hooks/useFetchedUserData'

export default function UpdateUserDataForm ({ submitLabel }) {

    const { user, isAuthenticated } = useAuth0()
    const history = useHistory()
    const fetchedUserData = useFetchedUserData()
    const [firstNameField, setFirstNameField] = React.useState('')
    const [lastNameField, setLastNameField] = React.useState('')
    const [phoneField, setPhoneField] = React.useState('')
    
    React.useEffect(() => {
        if (user && fetchedUserData) {
            if (!isGoogleAccount(user)) {
                setFirstNameField(fetchedUserData?.given_name ? fetchedUserData.given_name : '')
                setLastNameField(fetchedUserData?.given_name ? fetchedUserData.family_name : '')
                setPhoneField(fetchedUserData?.user_metadata?.mobile ? fetchedUserData.user_metadata.mobile : '')
            }
        }
    }, [fetchedUserData, user])

    const allFieldsValid = () => {
        if (!validator.isEmpty(firstNameField) && !validator.isEmpty(lastNameField) && validator.isMobilePhone(phoneField)) {
            return true
        } else {
            return false
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if ((allFieldsValid() || (isGoogleAccount(user) && validator.isMobilePhone(phoneField))) && localStorage.getItem('gym-app-jwt')) {
            let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
            let bodyShape = {
                user_metadata: {
                    mobile: phoneField
                },
            }
            if (!isGoogleAccount(user)) {
                bodyShape.given_name = firstNameField
                bodyShape.family_name = lastNameField
                // bodyShape.email = emailField //-- email field triggers an auto-logout bc auth0 needs to reverify credentials
            }
            if (localStorage.getItem('gym-app-jwt')) {
                let status, statusCode
                fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.sub}`, {
                    method: 'PATCH',
                    body: JSON.stringify(bodyShape),
                    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${jwt}` }
                })
                .then(response => {
                    console.log(
                        response
                    )
                    status = response.status
                    return response.json()
                })
                .then(data => {
                    console.log(data)
                    statusCode = data.statusCode ? data.statusCode : null
                    setTimeout(() => {
                        history.push('/?profileSetup=complete')
                    }, 1000)
                })
                .catch(err => {
                    // should we do another fetch to invalidate the jwt here in
                    // the case of a 401 error?
                    if (status === 401 || statusCode === 401) {
                        console.log(
                            `Bad token, need to make a call to invalidate it
                            and subsequently clear jwt from localStorage or db,
                            wherever we have saved it`
                        )
                        console.log(`
                            alternatively, we can just make sure that we delete
                            the jwt from localStorage or database once the user
                            logs out
                        `)
                    }
                })
            }
        } else {
            console.log(
                'form contains some invalid fields'
            )
        }
    }


    return (
        <form
        className={'Success_form'}
        onSubmit={handleSubmit}>
            {
                user && user.sub && !isGoogleAccount(user) ?
                <>
                    <label htmlFor='first-name'>First name: &nbsp;</label>
                    <input
                    id='first-name' type='text'
                    onChange={(event) => {
                        setFirstNameField(event.target.value)
                    }}
                    value={firstNameField}
                    />
                    <div style={{ color: 'red' }} >{ !validator.isEmpty(firstNameField) ? null : 'enter a first name' }
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
                    <div style={{ color: 'red' }} >{ !validator.isEmpty(lastNameField) ? null : 'enter a last name' }
                    </div>
                    <br />
                    <br />
                </>
                : null
            }

            <label htmlFor='phone'>Mobile number:</label>
            <input
            id='phone' type='tel'
            value={phoneField}
            onChange={(event) => {
                setPhoneField(event.target.value)
            }}
            />
            <div style={{ color: 'red' }} > { new awesomePhonenumber(phoneField, 'US').isValid() ? null : 'enter a valid mobile number' }</div>
            <br />
            <br />
            
            {
                user &&
                    (allFieldsValid() || (isGoogleAccount(user) && validator.isMobilePhone(phoneField))) ?
                    <StyledButton
                    type='submit' role='button'>
                        { submitLabel }
                    </StyledButton>
                    : null
            }
        </form>
    )

}
