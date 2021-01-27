import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
  useLocation
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
  // const history = useHistory()
  const { user } = useAuth0()
  React.useEffect(() => {
    console.log( user )
  }, [])
  return <></>
}

const ModalDiv = styled.div`
color: white;
padding: 10px 25px;
border-radius: 3px;
background-color: mediumseagreen;
box-shadow: 1px 1px 2px 2px rgba(0, 0, 0, 0.2)
`

function SomethingSomethingComplete () {
   
  const [modal, setModal] = React.useState(false)
  const history = useHistory()
  const location = useLocation()

  React.useEffect(() => {
    if (location) {
      // let location = window.location
      let search = location.search.substr(1, location.search.length)
      let params = search.split('=')
      if (params) {
        let key = params[0]
        let value = params[1]
        if (key && value) {
          console.log(key, value)
          if (key === 'profileSetup') {
            if (value === 'complete') {
              setModal(true) // maybe replace this with react toast lib
              setTimeout(() => {
                history.push('/')
                window.location.reload()
              }, 2500)
            }
          }
        }
      }
    }
  }, [location])

  return (
    <>
    {
      modal ?
        <>
          <ModalDiv>
            Thank you for completing your profile!
          </ModalDiv>
          <br />
        </>
      : null
    }
    </>
  )
}

function DrawerLeftPanel ({ drawerOpen, setDrawerOpen }) {

  return (
    <>
    {
      drawerOpen ?
      <div
        className={'SidePanel_container'}
        style={{
          width: '300px',
          height: '100vh',
          position: 'absolute',
          left: 0, top: 0,
          color: 'white',
          zIndex: 100,
          backgroundColor: 'white',
          boxShadow: '1px 1px 2px 2px rgba(0, 0, 0, 0.2)'
        }}
        >
          <StyledButton
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'absolute', right: '10px', top: '10px', width: '50px', backgroundColor: 'royalblue', border: '1px solid darkblue' }}
          >
            &#8678;
          </StyledButton>
          <h4
          style={{
            margin: 0,
            padding: '25px 0 25px 0',
            backgroundColor: 'royalblue',
          }}
          >
            Account
          </h4>
          <br />
          <StyledButton
          style={{ backgroundColor: 'royalblue' }}
          >Update email address</StyledButton>

        </div>
      : null
    }
    </>
  )

}

function DarkenDiv ({ drawerOpen, setDrawerOpen }) {
  return (
    <>
      {
        drawerOpen ?
        <div
        onClick={() => setDrawerOpen(false)}
        className={'bg-darken'}
        style={{
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.25)'
        }}
        ></div>
        : null
      }
    </>
  )
}

function useFetchedUserData (user) {

  const [fetchedUserData, setFetchedUserData] = React.useState(null)

  React.useEffect(() => {
    
    if (user) {
      if (localStorage.getItem('gym-app-jwt')) {
        let jwt = JSON.parse(localStorage.getItem('gym-app-jwt'))['access_token']
        // let's get Auth0 user instead data
        fetch(`https://gymwebapp.us.auth0.com/api/v2/users/${user.sub}`, {
            method: 'GET',
            headers: { 'authorization': `Bearer ${jwt}` }
        })
        .then(response => response.json())
        .then(data => {
            setFetchedUserData(data)
        })
        .catch(err => console.log(err))
      }
    }

  }, [user])

  return fetchedUserData

}

function App() {
  
  const { loginWithRedirect, isAuthenticated, isLoading, logout, user } = useAuth0()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const fetchedUserData = useFetchedUserData(user)
  
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

  React.useEffect(() => {

    if (!isLoading && !isAuthenticated) {
      if (localStorage.getItem('gym-app-jwt')) {
        localStorage.removeItem('gym-app-jwt')
      }
    }

  }, [isLoading, isAuthenticated])

  React.useEffect(() => {
    
    console.log(
      `fetchedUserData:`, fetchedUserData
    )

  }, [fetchedUserData])

  return (
    <>
      <div className='App'>
        <Router>
          
          <Link to='/' style={{ textDecoration: 'none' }}>
            <Header>
              { process.env.REACT_APP_WEB_APP_NAME }
              <StyledButton
              onClick={() => setDrawerOpen(true)}
              style={{ position: 'absolute', left: '14px', top: '7px', width: '50px', fontSize: '24px' }}
              >
                {/* &#8680; */}
                &equiv;
              </StyledButton>
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

          <SomethingSomethingComplete />

          <div>
            <Switch>
              <Route exact path='/'>
                <>
                  <br />
                  {
                    isLoading ? <div>Loading...</div>
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
                                Email: { user.name }
                              </h4>
                              <h4>
                                Phone number: { fetchedUserData && fetchedUserData.user_metadata && fetchedUserData.user_metadata.mobile ? fetchedUserData.user_metadata.mobile : null }
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
                  <DarkenDiv drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
                  <DrawerLeftPanel drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
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
    </>
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
