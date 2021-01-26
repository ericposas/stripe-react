import React from 'react'
import './Success.css'
import { useLocation, useHistory } from 'react-router-dom'
import validator from 'validator'
import { isEqual } from 'lodash'
import StyledButton from './components/StyledButton'
import { useAuth0 } from '@auth0/auth0-react'

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

    const handleSubmit = (event) => {
        event.preventDefault()
        if (allFieldsValid() && localStorage.getItem('gym-app-jwt')) {
            // send data to an endpoint to store student info
            // fetch('/post-student-data', {
            //     method: 'POST',
            //     body: JSON.stringify({
            //         firstName: firstNameField,
            //         lastName: lastNameField,
            //         email: emailField,
            //         // password: passwordConfirmField,
            //     }),
            //     headers: { 'Content-type': 'application/json' }
            // })
            // .then(response => response.json())
            // .then(response => console.log(response))
            // .catch(err => console.log(err))

            let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
            console.log( jwt )

            if (localStorage.getItem('gym-app-jwt')) {
                let status, statusCode
                fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.sub}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        given_name: firstNameField,
                        family_name: lastNameField
                    }),
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

    const [firstNameField, setFirstNameField] = React.useState('')
    const [lastNameField, setLastNameField] = React.useState('')
    const [emailField, setEmailField] = React.useState('')
    // const [passwordField, setPasswordField] = React.useState('')
    // const [passwordConfirmField, setPasswordConfirmField] = React.useState('')

    React.useEffect(() => {
        // get session data to populate form fields
        let session_id
        if (location.search) {
            session_id = location.search.split('=')[1]
        }
        if (session_id) {
            if (isAuthenticated) {
                if (localStorage.getItem('gym-app-jwt')) {
                    let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
                    // let's get Auth0 user email instead
                    fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.sub}`, {
                        method: 'GET',
                        headers: { 'authorization': `Bearer ${jwt}` }
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        setEmailField( data.email )
                    })
                    .catch(err => console.log(err))
                }
            }
        } else {
            // redirect to home
            history.push('/')
        }
            // let response = fetch('/get-checkout-session', {
            // method: 'POST',
            // body: JSON.stringify({ session_id }),
            //     headers: { 'Content-type': 'application/json' }
            // })
            // .then(response => response.json())
            // .catch(err => console.log(err))
            
            // response
            // .then(data => {
            //     let { customer } = data
            //     // setEmailField(customer.email)
            //     console.log(customer)
            // })
            // .catch(err => console.log(err))

    }, [ isAuthenticated ])

    const allFieldsValid = () => {
        if (
            // (!validator.isEmpty(passwordField) || validator.isLength(passwordField, { min: 8, max: 100 })) &&
            // isEqual(passwordField, passwordConfirmField) &&
            !validator.isEmpty(firstNameField) && !validator.isEmpty(lastNameField) &&
            validator.isEmail(emailField)
        ) {
            return true
        } else {
            return false
        }
    }

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
                    allFieldsValid() ?
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
