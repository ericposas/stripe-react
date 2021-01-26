import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory
} from 'react-router-dom'
import './App.css'
import SuccessPage from './Success'
import StyledButton from './components/StyledButton'
import styled from 'styled-components'
import { useAuth0 } from '@auth0/auth0-react'
import Checkout from './components/Checkout'

const Header = styled.h3`
padding: 20px 0 20px 0;
background-color: slateblue;
color: #fff;
cursor: pointer;
`

function LogUser () {
  const { user } = useAuth0()
  React.useEffect(() => {
    console.log( user )
  }, [])
  return <></>
}

function App() {

  const history = useHistory()
  const { loginWithRedirect, isAuthenticated, isLoading, logout, user } = useAuth0()

  // const [jwt, setJwt] = React.useState(null)

  React.useEffect(() => {
    
    if (window.localStorage && !localStorage.getItem('gym-app-jwt')) {
      fetch('/retrieve-api-token', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        localStorage.setItem('gym-app-jwt', JSON.stringify(data))
        // we will update this to send the jwt to our mongo db for better security...
        // we will then need to blacklist or invalidate old jwt tokens as well
        // but for now, let's make a request using the jwt! (at Success component)
        // request will be PATCH to update user 
      })
      .catch(err => console.log(err))
    }

  }, [])

  return (
    <div className='App'>
      <Router>
        
        <Link to='/' style={{ textDecoration: 'none' }}>
          <Header>
            { process.env.REACT_APP_WEB_APP_NAME }
            {
              isLoading ? <></> :
                isAuthenticated ?
                <StyledButton
                  style={{ position: 'absolute', right: '14px', top: '7px', width: '120px', backgroundColor: 'royalblue' }}
                  onClick={() => logout({ returnTo: window.location.origin })}
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
        </Link>

        <div>
          <Switch>
            <Route exact path='/'>
              <>
                <br />
                {
                  isLoading ?
                  <div>Loading...</div>
                  :
                    isAuthenticated ?
                      <>
                        {
                          user ?
                          <>
                            <h3>
                              Welcome { user.given_name && user.family_name ? `${user.given_name} ${user.family_name}` : user.name }
                            </h3>
                            <h4>
                              { user.name }
                            </h4>
                            <LogUser />
                            {/* <h4>{user.email}</h4> */}
                          </>
                          : null
                        }
                        <div>
                          Sign Up For Classes
                        </div>
                        <br />
                        <Link to='/checkout'>
                          <StyledButton>
                            Enroll in Classes
                          </StyledButton>
                        </Link>
                        <br />
                        <br />
                      </>
                    :
                      <>
                        <div>Sign Up or Sign In</div><br />
                      </>
                }
              </>
            </Route>
            <Route path='/success'>
              <SuccessPage />
            </Route>
            <Route path='/checkout'>
              <Checkout />
            </Route>
            {/* {
              isAuthenticated ?
              <>
                <Route path='/success'>
                  <SuccessPage />
                </Route>
                <Route path='/checkout'>
                  <Checkout />
                </Route>
              </>
              : <GoBack />
            } */}
          </Switch>
        </div>

      </Router>
    </div>
  )

}

export default App

function GoBack () {
  const history = useHistory()
  React.useEffect(() => {
    history.push('/')
  })
  return <></>
}

// -- line items: format -- 
//
// {
//   price_data: {
//       currency: 'usd',
//       product_data: {
//           name: 'Monthly subscription',
//       },
//       unit_amount: 2500,
//       recurring: {
//          interval: 'month',
//          interval_count: 1
//       }
//   },
//   quantity: 1,
// }
