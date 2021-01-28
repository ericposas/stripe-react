import React from 'react'
import StyledButton from './StyledButton'
import { useAuth0 } from '@auth0/auth0-react'
import styled from 'styled-components'

const Header = styled.h3`
padding: 20px 0 20px 0;
background-color: slateblue;
cursor: pointer;
color: #fff;
`

export default function AppHeader () {

    const { loginWithRedirect, isAuthenticated, isLoading, logout } = useAuth0()

    return (
        <Header>
        { process.env.REACT_APP_WEB_APP_NAME }
        {
          isLoading ? <></> :
            isAuthenticated ?
            <StyledButton
              style={{ position: 'absolute', right: '14px', top: '7px', width: '120px', backgroundColor: 'royalblue' }}
              onClick={() => {
                if (localStorage.getItem('gym-app-jwt')) {
                  localStorage.removeItem('gym-app-jwt')
                }
                logout({ returnTo: window.location.origin })
              }}
              >
              Logout
            </StyledButton>
          :
            <StyledButton
              style={{ position: 'absolute', right: '14px', top: '7px', width: '120px', backgroundColor: 'royalblue' }}
              onClick={() => loginWithRedirect()}
            >
              Auth0 Login
            </StyledButton>
        }
      </Header>
    )

}