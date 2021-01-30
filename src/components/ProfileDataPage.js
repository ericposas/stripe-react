import React from 'react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import useCreateStripeCustomer from '../hooks/useCreateStripeCustomer'
import { useAuth0 } from '@auth0/auth0-react'
import StyledButton from './StyledButton'

export default function ProfileDataPage () {

  const fetchedUserData = useFetchedUserData()
  const { isAuthenticated, user, loginWithPopup } = useAuth0()
  useCreateStripeCustomer()
  
  const LoginButton = () => (
    <>
      <div>Sign Up or Log In</div>
      <br />
      <br />
      <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      >
        <StyledButton
        style={{
          height: '100px',
          fontSize: '20px',
          backgroundColor: 'royalblue'
        }}
        onClick={() => loginWithPopup()}
        >
          Login
        </StyledButton> 
      </div>
    </>
  )

  const ProfileData = () => (
    <>
      <br />
      <br />
      <h3>
        Welcome { fetchedUserData.given_name && fetchedUserData.family_name ? `${fetchedUserData.given_name} ${fetchedUserData.family_name}` : user.name }
      </h3>
      {
        fetchedUserData.email && (
          <h4>
            Email: { fetchedUserData.email }
          </h4>
        )
      }
      {
        fetchedUserData.user_metadata?.mobile && (
          <h4>
            Phone number: { fetchedUserData.user_metadata.mobile ? fetchedUserData.user_metadata.mobile : null }
          </h4>
        )
      }
      <br />
      <br />
    </>
  )

  return (
      <>
        <br />
        {
          isAuthenticated && user && fetchedUserData ?
            ProfileData()
          :
            <>
              {
                isAuthenticated
                ? null
                : LoginButton() 
              }
            </>
        }
    </>
  )
}