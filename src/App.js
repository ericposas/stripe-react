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
import styled, { css } from 'styled-components'
import { useAuth0 } from '@auth0/auth0-react'
import Checkout from './components/Checkout'
import useFetchedUserData from './hooks/useFetchedUserData'
import UpdateUserDataForm from './components/UpdateUserDataForm'

const Header = styled.h3`
padding: 20px 0 20px 0;
background-color: slateblue;
color: #fff;
cursor: pointer;
`

// function LogUser () {
//   const { user } = useAuth0()
//   React.useEffect(() => {
//     console.log( user )
//   }, [])
//   return <></>
// }

const ModalDiv = styled.div`
color: white;
padding: 10px 25px;
border-radius: 3px;
background-color: mediumseagreen;
box-shadow: 1px 1px 2px 2px rgba(0, 0, 0, 0.2);
positon: absolute;
transform: translateX(-200px);
transition: transform .35s ease-out;
${props => props.slide && css`
  transform: translateX(0px);
`}
`

function SomethingSomethingComplete ({ doAction }) {
   
  const [modal, setModal] = React.useState(false)
  const history = useHistory()
  const location = useLocation()
  const [slide, setSlide] = React.useState(false)

  React.useEffect(() => {
    if (location) {
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
              setTimeout(() => setSlide(true), 50)
              setTimeout(() => {
                history.push('/')
                setModal(false)
                doAction()
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
          <ModalDiv slide={ slide ? true : null }>
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
          <Link to='/update-profile'>
            <StyledButton
            onClick={() => setDrawerOpen(false)}
            style={{ backgroundColor: 'royalblue' }}
            >
              Update profile info
            </StyledButton>
          </Link>

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

function App() {
  
  const { loginWithRedirect, isAuthenticated, isLoading, logout, user } = useAuth0()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const fetchedUserData = useFetchedUserData()

  return (
    <>
      <div className='App'>
        <Router>
          
          <StyledButton
          onClick={() => {
            setDrawerOpen(true)
          }}
          style={{ position: 'absolute', left: '14px', top: '7px', width: '50px', fontSize: '24px' }}
          >
            &equiv;
          </StyledButton>

          <Link to='/' style={{ textDecoration: 'none' }}>
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
          </Link>

          <DarkenDiv drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
          <DrawerLeftPanel drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

          <SomethingSomethingComplete
          doAction={() => setDrawerOpen(false)}
          />

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
                              {
                                fetchedUserData ?
                                <>
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
                                    fetchedUserData.user_metadata && (
                                      <h4>
                                        Phone number: { fetchedUserData.user_metadata.mobile ? fetchedUserData.user_metadata.mobile : null }
                                      </h4>
                                    )
                                  }
                                </>
                                : null
                              }
                              {/* <LogUser /> */}
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
              <Route path='/update-profile'>
                <br />
                <div>Update your info</div>
                <br />
                <UpdateUserDataForm submitLabel={ 'Update info' } user={user} />
              </Route>
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
