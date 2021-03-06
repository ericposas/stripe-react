import React from 'react'
import useFetchedUserData from '../hooks/useFetchedUserData'
import useCreateStripeCustomer from '../hooks/useCreateStripeCustomer'
import { useAuth0 } from '@auth0/auth0-react'
import StyledButton from './StyledButton'
import { RingLoader } from 'react-spinners'

export default function ProfileDataPage () {

  const fetchedUserData = useFetchedUserData()
  const { isAuthenticated, user, loginWithPopup, isLoading } = useAuth0()
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
      <h3>
        Welcome { fetchedUserData.given_name && fetchedUserData.family_name ? `${fetchedUserData.given_name} ${fetchedUserData.family_name}` : user.name }
      </h3>
      {
        fetchedUserData.email && (
          <div>
            Email: { fetchedUserData.email }
          </div>
        )
      }
      {
        fetchedUserData.user_metadata?.mobile && (
          <div>
            Phone number: { fetchedUserData.user_metadata.mobile }
          </div>
        )
      }
      <br />
      <br />
      {
        fetchedUserData?.user_metadata?.pt_sessions || fetchedUserData?.user_metadata?.classes
        ? <h3>Enrolled in</h3>
        : null
      }
      <div>
        <div>
          {
            fetchedUserData.user_metadata?.pt_sessions > 0 && (
              <>
                <h4>Personal Training</h4>
                <div>
                  Training Sessions Available: { fetchedUserData.user_metadata.pt_sessions }
                </div>
              </>
            )
          }
          {
            fetchedUserData.user_metadata?.classes?.length > 0 && (
              <>
                <h4>Courses</h4>
                <div>
                  {
                    fetchedUserData.user_metadata.classes
                    .map(_class => (
                      <div key={_class}>
                        { _class }
                      </div>
                    ))
                  }
                </div>
              </>
            )
          }
        </div>
      </div>
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
                :
                  isLoading ?
                    <>
                      <RingLoader
                      css={{
                        position: 'absolute',
                        left: 0, right: 0,
                        margin: 'auto',
                      }}
                      size={ 50 }
                      color={ 'slateblue' }
                      loading={ fetchedUserData ? false : true }
                      />
                    </>
                  :
                    LoginButton() 
              }
            </>
        }
    </>
  )
}