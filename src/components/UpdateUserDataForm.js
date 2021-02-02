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
import useAuthToken from '../hooks/useAuthToken'

export default function UpdateUserDataForm ({ setUpdatedProfile, extraActionFn, submitLabel, onCompleteParams: { queryKey, queryValue } }) {

    const { user } = useAuth0()
    const history = useHistory()
    const fetchedUserData = useFetchedUserData()
    const [firstNameField, setFirstNameField] = React.useState('')
    const [lastNameField, setLastNameField] = React.useState('')
    const [emailField, setEmailField] = React.useState('')
    const [phoneField, setPhoneField] = React.useState('')
    const isPhone = (num) => (new awesomePhonenumber(num, 'US').isValid())
    const jwt = useAuthToken()
    const { logout } = useAuth0()
    
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

    const getPostBodyShape = () => {
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
        }
        return bodyShape
    }

    // posts user data to stripe account
    const postUserDataToStripeAcct = async () => (
        new Promise(async (resolve, reject) => {
            try {
                let response = await fetch('/update-user-data-to-stripe', {
                    method: 'PATCH',
                    body: JSON.stringify({
                        userData: {
                            name: firstNameField && lastNameField ? firstNameField + ' ' + lastNameField : null,
                            email: emailField ? emailField : null,
                            phone: phoneField ? phoneField : null
                        },
                        customer: fetchedUserData?.user_metadata?.stripe?.customer?.id
                    }),
                    headers: { 'Content-type': 'application/json' }
                })
                let data = await response.json()
                console.log( data )
                resolve( data )
            } catch (err) {
                console.log(err)
                reject( err )
            }
        })
    )

    // posts user data to auth user
    const postUserDataToAuthUser = () => (
        new Promise((resolve, reject) => {
            let status, statusCode
            let bodyShape = getPostBodyShape()
            fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.sub}`, {
                method: 'PATCH',
                body: JSON.stringify(bodyShape),
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${jwt?.access_token}`
                }
            })
            .then(response => {
                status = response.status
                return response.json()
            })
            .then(data => {
                statusCode = data.statusCode ? data.statusCode : null
                setTimeout(() => {
                    history.push(`/?${queryKey}=${queryValue}`)
                }, 250)
                setUpdatedProfile(true)
                resolve( data )
            })
            .catch(err => {
                // the case of a 401 error?
                // delete token and logout
                resolve( err )
                if (status === 401 || statusCode === 401) {
                    if (localStorage.getItem('gym-app-jwt')) {
                        localStorage.removeItem('gym-app-jwt')
                        logout({ redirectTo: window.location.origin })
                    }
                }
            })
        })
    )
        
    

    const handleSubmit = async (event) => {
        event.preventDefault()
        if ((allFieldsValid() || (isGoogleAccount(user) && isPhone(phoneField))) && jwt) {
            // let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
            if (jwt) {
                try {
                    let postToStripe = await postUserDataToStripeAcct()
                    let postToAuth = await postUserDataToAuthUser()
                    console.log( 'user data posted to apis', postToAuth, postToStripe )
                } catch (err) {
                    console.log('an error occurred in posting to apis', err)
                }
            }
        } else {
            console.log(
                'form contains some invalid fields'
            )
        }
    }

    // ?
    const shouldRenderSubmitButton = () => {
        
        if (fetchedUserData) {

            let object1 = {
                firstName: firstNameField,
                lastName: lastNameField,
                mobile: phoneField,
                email: emailField
            }
    
            let object2 = {
                firstName: fetchedUserData?.given_name,
                lastName: fetchedUserData?.family_name,
                mobile: fetchedUserData?.user_metadata?.mobile,
                email: fetchedUserData?.email
            }
    
            if (isEqual(object1, object2)) {
                return false
            }
    
            return true
        }

        return false
        
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
            <br />
            <h2 style={{ margin: 0 }}>Update your info</h2>
            <form
            style={{ width: allFieldsValid() ? '330px' : '450px' }}
            onClick={extraActionFn}
            className={'Success_form'}
            onSubmit={handleSubmit}
            >
                <div
                style={{ width: allFieldsValid() ? '330px' : '450px' }}
                className='form-container-div'
                >
                {
                    user && user.sub && !isGoogleAccount(user) ?
                    <>
                        <label htmlFor='first-name'>First name: &nbsp;</label>
                        <input
                        style={ allFieldsValid() ? { right: '20px' } : { left: 0, right: 0, } }
                        id='first-name' type='text'
                        onChange={(event) => { setFirstNameField(event.target.value) }}
                        onFocus={extraActionFn}
                        value={firstNameField}
                        />
                        <div className='form-error-div' style={{ color: 'red' }} >{ !validator.isEmpty(firstNameField) ? null : 'enter first name' }
                        </div>
                        <br />
                        <br />

                        <label htmlFor='last-name'>Last name: &nbsp;</label>
                        <input
                        style={ allFieldsValid() ? { right: '20px' } : { left: 0, right: 0, } }
                        id='last-name' type='text'
                        onFocus={extraActionFn}
                        onChange={(event) => { setLastNameField(event.target.value) }}
                        value={lastNameField}
                        />
                        <div className='form-error-div' style={{ color: 'red' }} >{ !validator.isEmpty(lastNameField) ? null : 'enter last name' }
                        </div>
                        <br />
                        <br />
                    </>
                    : null
                }

                {
                    user && (
                        <>
                            <label htmlFor='phone'>Mobile:</label>
                            <input
                            style={ allFieldsValid() ? { right: '20px' } : { left: 0, right: 0, } }
                            id='phone' type='tel'
                            onFocus={extraActionFn}
                            value={phoneField}
                            onChange={(event) => { setPhoneField(event.target.value) }}
                            />
                            <div className='form-error-div' style={{ color: 'red' }} > { isPhone(phoneField) ? null : 'invalid number' }</div>
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
                            style={ allFieldsValid() ? { right: '20px' } : { left: 0, right: 0, } }
                            id='email' type='text'
                            onFocus={extraActionFn}
                            value={emailField}
                            onChange={(event) => {
                                setEmailField(event.target.value)
                            }}
                            />
                            <div className='form-error-div' style={{ color: validator.isEmail(emailField) ? 'green' : 'red' }} >
                                {
                                    !isEqual(emailField, user.email) ?
                                        validator.isEmail(emailField) ?
                                        'requires sign-in'
                                        : 'invalid email'
                                    : ''
                                }
                            </div>
                            <br />
                            <br />
                        </>
                    : 'no user data'
                }
                </div>
                <br />
                {
                    user &&
                        (allFieldsValid() || (isGoogleAccount(user) && isPhone(phoneField))) ?
                            shouldRenderSubmitButton()
                            ?
                                <StyledButton
                                type='submit'
                                role='button'
                                style={{
                                    position: 'relative',
                                    margin: 0,
                                    left: 0, right: 0,
                                }}>
                                    { submitLabel }
                                </StyledButton>
                            : null
                        : null
                }
            </form>
        </>
    )

}
