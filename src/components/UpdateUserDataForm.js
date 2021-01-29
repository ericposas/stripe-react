import React from 'react'
import './UpdateUserDataForm.css'
import validator from 'validator'
import StyledButton from './StyledButton'
import awesomePhonenumber from 'awesome-phonenumber'
import { isGoogleAccount } from '../utils/utils'
import { useAuth0 } from '@auth0/auth0-react'
import { useHistory } from 'react-router-dom'
import useFetchedUserData from '../hooks/useFetchedUserData'
import { isEqual } from 'lodash'

export default function UpdateUserDataForm ({ submitLabel, onCompleteParams: { queryKey, queryValue } }) {

    const { user } = useAuth0()
    const history = useHistory()
    const fetchedUserData = useFetchedUserData()
    const [firstNameField, setFirstNameField] = React.useState('')
    const [lastNameField, setLastNameField] = React.useState('')
    const [emailField, setEmailField] = React.useState('')
    const [phoneField, setPhoneField] = React.useState('')
    const isPhone = (num) => (new awesomePhonenumber(num, 'US').isValid())
    
    React.useEffect(() => {
        if (user && fetchedUserData) {
            if (!isGoogleAccount(user)) {
                setFirstNameField(fetchedUserData?.given_name ? fetchedUserData.given_name : '')
                setLastNameField(fetchedUserData?.given_name ? fetchedUserData.family_name : '')
                setEmailField(fetchedUserData?.email ? fetchedUserData.email : '')
            }
            setPhoneField(fetchedUserData?.user_metadata?.mobile ? fetchedUserData.user_metadata.mobile : '')
        }
    }, [fetchedUserData, user])

    const allFieldsValid = () => {
        if (
            !validator.isEmpty(firstNameField) && !validator.isEmpty(lastNameField) &&
            isPhone(phoneField) &&
            validator.isEmail(emailField)
            ) {
            return true
        } else {
            return false
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if ((allFieldsValid() || (isGoogleAccount(user) && isPhone(phoneField))) && localStorage.getItem('gym-app-jwt')) {
            let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
            let bodyShape = {
                user_metadata: {
                    mobile: phoneField
                },
            }
            if (!isGoogleAccount(user)) {
                bodyShape.given_name = firstNameField
                bodyShape.family_name = lastNameField
                if (emailField !== user.email) {
                    bodyShape.email = emailField
                }
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
                        history.push(`/?${queryKey}=${queryValue}`)
                    }, 250)
                })
                .catch(err => {
                    // should we do another fetch to invalidate the jwt here in
                    // the case of a 401 error?
                    if (status === 401 || statusCode === 401) {
                        if (localStorage.getItem('gym-app-jwt')) {
                            localStorage.removeItem('gym-app-jwt')
                        }
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
        <>
            {
                (user && isGoogleAccount(user)) && (
                    <>
                        <br />
                        <div>Your name and email details are managed by Google</div>
                        <br />
                    </>
                )
            }
            <form
            style={{ height: user && isGoogleAccount(user) ? '110px' : '220px' }}
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

                {
                    user && (
                        <>
                            <label htmlFor='phone'>Mobile number:</label>
                            <input
                            id='phone' type='tel'
                            value={phoneField}
                            onChange={(event) => {
                                setPhoneField(event.target.value)
                            }}
                            />
                            <div style={{ color: 'red' }} > { isPhone(phoneField) ? null : 'enter a valid number' }</div>
                            <br />
                            <br />
                        </>
                    )
                }
                
                {
                    (user && user.email) ?
                        isGoogleAccount(user) ? ''
                        :
                        <>
                            <label htmlFor='email'>Email:</label>
                            <input
                            id='email' type='text'
                            value={emailField}
                            onChange={(event) => {
                                setEmailField(event.target.value)
                            }}
                            />
                            <div style={{ color: validator.isEmail(emailField) ? 'green' : 'red' }} >
                                {
                                    !isEqual(emailField, user.email) ?
                                        validator.isEmail(emailField) ?
                                        'requires sign in upon change'
                                        : 'not a valid email'
                                    : ''
                                }
                            </div>
                            <br />
                            <br />
                        </>
                    : 'no user data'
                }
                <br />
                {
                    user &&
                        (allFieldsValid() || (isGoogleAccount(user) && isPhone(phoneField))) ?
                        <StyledButton
                        type='submit' role='button'>
                            { submitLabel }
                        </StyledButton>
                        : null
                }
            </form>
        </>
    )

}
