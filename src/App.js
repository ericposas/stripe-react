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
import { useAuth0 } from '@auth0/auth0-react'
import Checkout from './components/Checkout'
import UpdateUserDataForm from './components/UpdateUserDataForm'
import { DarkenDiv, DrawerLeftPanel } from './components/DrawerComponent'
import { ActionModal } from './components/ActionModal'
import AppHeader from './components/AppHeader'
import ProfileDataPage from './components/ProfileDataPage'

function App() {
  
  const { user } = useAuth0()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const history = useHistory()

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
            <AppHeader />
          </Link>

          <DarkenDiv drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
          <DrawerLeftPanel drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

          <ActionModal
          msg={'Thank you for completing your profile!'}
          doAction={() => {
            history.push('/')
            setDrawerOpen(false)
            window.location.reload()
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