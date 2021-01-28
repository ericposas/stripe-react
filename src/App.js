import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import './App.css'
import SuccessPage from './Success'
import { useAuth0 } from '@auth0/auth0-react'
import Checkout from './components/Checkout'
import UpdateUserDataForm from './components/UpdateUserDataForm'
import { DarkenDiv, DrawerLeftPanel } from './components/DrawerComponent'
import { ActionModal } from './components/ActionModal'
import AppHeader from './components/AppHeader'
import ProfileDataPage from './components/ProfileDataPage'
import BurgerButton from './components/BugerButton'

function App() {
  
  const { user, isAuthenticated, logout } = useAuth0()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const minutes = React.useRef(1)
  const seconds = React.useRef(0)
  const timeout = React.useRef(() => setTOut(minutes.current))
  const interval = React.useRef(() => setCountdown(minutes.current))

  const setTOut = () => {
    console.log(`logout timeout refreshed, set at ${minutes.current} minute`)
    return setTimeout(() => {
      logout({ redirectTo: window.location.origin })
    }, ((1000 * 60) * minutes.current))
  }

  const setCountdown = () => {
    seconds.current = minutes.current * 60
    return setInterval(() => {
      seconds.current = seconds.current - 1
      console.log(`timer: ${seconds.current}`)
    }, 1000)
  }

  React.useEffect(() => {

    const mouseMoveHandler = () => {
      if (timeout?.current && interval?.current) {
        clearTimeout(timeout.current)
        clearInterval(interval.current)
      }
      timeout.current = setTOut()
      interval.current = setCountdown()
    }
    
    if (isAuthenticated === true) {
      console.log('authenticated, set a timer to logout automagically, but refresh upon mouse movement')
      window.addEventListener('mousemove', mouseMoveHandler)
      mouseMoveHandler() // fire once to init logout timer
    }
    
    if (isAuthenticated === false) {
      // console.log('not logged in')
    }

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler)
    }

  }, [isAuthenticated])

  return (
    <>
      <div className='App'>
        <Router>

          <BurgerButton doAction={() => setDrawerOpen(true)} />

          <Link to='/' style={{ textDecoration: 'none' }}>
            <AppHeader />
          </Link>

          <DarkenDiv drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
          <DrawerLeftPanel drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

          <ActionModal
          queryTerm={'profileSetup'}
          msg={'Thank you for completing your profile!'}
          redirectPath={'/'}
          timeout={3000}
          delayBeforeLeave={2750}
          doAction={() => {
            setDrawerOpen(false)
          }}
          />
          
          <ActionModal
          queryTerm={'updateInfo'}
          msg={'You have successfully updated your profile info!'}
          redirectPath={'/'}
          timeout={3000}
          delayBeforeLeave={2750}
          doAction={() => {
            setDrawerOpen(false)
          }}
          />

          <div>
            <Switch>
              <Route exact path='/'>
                <ProfileDataPage />
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
                <UpdateUserDataForm
                user={user}
                onCompleteParams={{
                  queryKey: 'updateInfo',
                  queryValue: 'complete'
                }}
                submitLabel={ 'Update info' }
                />
              </Route>
            </Switch>
          </div>

        </Router>
      </div>
    </>
  )

}

export default App