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
  
  const { user } = useAuth0()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

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
          delayBeforeLeave={2000}
          doAction={() => {
            setDrawerOpen(false)
            window.location.reload()
          }}
          />
          
          <ActionModal
          queryTerm={'updateInfo'}
          msg={'You have successfully updated your profile info!'}
          redirectPath={'/'}
          timeout={3000}
          delayBeforeLeave={2000}
          doAction={() => {
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