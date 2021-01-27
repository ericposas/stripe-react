import React from 'react'
import './Success.css'
import { useLocation, useHistory } from 'react-router-dom'
import validator from 'validator'
import StyledButton from './components/StyledButton'
import { useAuth0 } from '@auth0/auth0-react'
import awesomePhonenumber from 'awesome-phonenumber'
import useFetchedUserData from './hooks/useFetchedUserData'
import { useAuthToken } from './App'

// function GetUser () {
    
//     const { user } = useAuth0()
    
//     React.useEffect(() => {

//         if (localStorage.getItem('gym-app-jwt')) {
//             let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
//             // let's get Auth0 user email instead
//             fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.sub}`, {
//                 method: 'GET',
//                 headers: { 'authorization': `Bearer ${jwt}` }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log(data)
//                 setEmailField( data.email )
//             })
//             .catch(err => console.log(err))
//         }

//     }, [])

//     return <></>
// }

export default function SuccessPage () {

    const location = useLocation()
    const history = useHistory()
    const { isLoading, isAuthenticated, user } = useAuth0()
    // const jwt = useAuthToken(isAuthenticated)
    const fetchedUser = useFetchedUserData()

    const isGoogleAccount = (user) => {
        if (user.sub) {
            let matches = user.sub.match(/google/gi)
            if (matches === null) {
                return false
            } else {
                return true
            }
        }
        return 'please include a "user" param'
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
                // bodyShape.email = emailField
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

    React.useEffect(() => {
        // get session data to populate form fields
        let session_id
        if (location.search) {
            session_id = location.search.split('=')[1]
        }
        if (session_id) {

            if (isAuthenticated) {

                // get stripe customer data 
                fetch('/get-checkout-session', {
                    method: 'POST',
                    body: JSON.stringify({ session_id }),
                        headers: { 'Content-type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    let { customer } = data
                    console.log('stripe-customer-data:', customer)
                })
                .catch(err => console.log(err))

            }

        } else {
            // redirect to home
            history.push('/')
        }

    }, [ isAuthenticated ])

    // React.useEffect(() => {
    //     if (fetchedUser) {
    //         setEmailField(fetchedUser.email)
    //     }
    // }, [fetchedUser])
    
    const [firstNameField, setFirstNameField] = React.useState('')
    const [lastNameField, setLastNameField] = React.useState('')
    const [phoneField, setPhoneField] = React.useState('')
    // const [emailField, setEmailField] = React.useState('')
    // const [passwordField, setPasswordField] = React.useState('')
    // const [passwordConfirmField, setPasswordConfirmField] = React.useState('')

    const allFieldsValid = () => {
        if (!validator.isEmpty(firstNameField) && !validator.isEmpty(lastNameField) &&
            validator.isMobilePhone(phoneField)
            // validator.isEmail(emailField) &&
        ) {
            return true
        } else {
            return false
        }
    }

    // const FirstLastEmailEdit = ({ user, firstNameField, setFirstNameField, lastNameField, setLastNameField, emailField, setEmailField }) => {
    //     if (user && user.sub) {
    //         if (!isGoogleAccount(user)) {
    //             return (
    //                 <>
    //                     <label htmlFor='first-name'>First name: &nbsp;</label>
    //                     <input
    //                     id='first-name' type='text'
    //                     onChange={(event) => {
    //                         setFirstNameField(event.target.value)
    //                     }}
    //                     value={firstNameField}
    //                     />
    //                     <div style={{ color: 'red' }} >{ !validator.isEmpty(firstNameField) ? null : 'enter a first name' }
    //                     </div>
    //                     <br />
    //                     <br />
    
    //                     <label htmlFor='last-name'>Last name: &nbsp;</label>
    //                     <input
    //                     id='last-name' type='text'
    //                     onChange={(event) => {
    //                         setLastNameField(event.target.value)
    //                     }}
    //                     value={lastNameField}
    //                     />
    //                     <div style={{ color: 'red' }} >{ !validator.isEmpty(lastNameField) ? null : 'enter a last name' }
    //                     </div>
    //                     <br />
    //                     <br />
    
    //                     <label htmlFor='email'>Email address: &nbsp;</label>
    //                     <input
    //                     id='email' type='text'
    //                     value={emailField}
    //                     onChange={(event) => {
    //                         setEmailField(event.target.value)
    //                     }}
    //                     />
    //                     <div style={{ color: 'red' }} > { validator.isEmail(emailField) ? null : 'enter a valid email' }</div>
    //                     <br />
    //                     <br />
    //                 </>
    //             )
    //         }
    //     }
    //     return <></>
    // }

    const markup = () => (
        <>
            <br />
            <div>
                Payment was successful! Please finish setting up your profile
            </div>
            <br />

            <form
            className={'Success_form'}
            onSubmit={handleSubmit}>

                {/* <FirstLastEmailEdit
                firstNameField={firstNameField}
                setFirstNameField={setFirstNameField}
                lastNameField={lastNameField}
                setLastNameField={setLastNameField}
                emailField={emailField}
                setEmailField={setEmailField}
                user={user}
                /> */}

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
    
                        {/* sending an email field will trigger an auth0 logout */}
                        {/* <label htmlFor='email'>Email address: &nbsp;</label>
                        <input
                        id='email' type='text'
                        value={emailField}
                        onChange={(event) => {
                            setEmailField(event.target.value)
                        }}
                        />
                        <div style={{ color: 'red' }} > { validator.isEmail(emailField) ? null : 'enter a valid email' }</div>
                        <br />
                        <br /> */}
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

                {/* <label htmlFor='password'>Password: &nbsp;</label>
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
                <br /> */}
                {
                    (allFieldsValid() || (isGoogleAccount(user) && validator.isMobilePhone(phoneField))) ?
                    <StyledButton
                    type='submit' role='button'>
                        Complete Enrollment
                    </StyledButton>
                    : null
                }
            </form>
        </>
    )
        
    return (
        <>
        {
            isLoading
            ? <><br /><div>Loading...</div></>
            :
                isAuthenticated
                ? markup()
                : null
        }
        </>
    )
}
