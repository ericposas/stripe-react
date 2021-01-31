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
import ChoosePaymentMethod from './components/ChoosePaymentMethod'
import { DarkenDiv, DrawerLeftPanel } from './components/DrawerComponent'
import { ActionModal } from './components/ActionModal'
import AppHeader from './components/AppHeader'
import ProfileDataPage from './components/ProfileDataPage'
import BurgerButton from './components/BugerButton'
import LogoutTimer from './components/LogoutTimer'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import StripeCardEntryExample from './components/StripeCardEntryExample'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_TEST_PUB_KEY)

function App() {
  
  const { user } = useAuth0()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [updatedProfile, setUpdatedProfile] = React.useState(false)

  return (
    <>
      <div className='App'>

        <LogoutTimer minutesOfInactivity={15} />

        <Router>

          {
            user && <BurgerButton doAction={() => setDrawerOpen(true)} />
          }

          <Link to='/' style={{ textDecoration: 'none' }}>
            <AppHeader />
          </Link>

          <DarkenDiv drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
          <DrawerLeftPanel updatedProfile={updatedProfile} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
          
          <ActionModal
          queryTerm={'paymentMethodSetup'}
          msg={'Payment method saved!'}
          redirectPath={'/'}
          timeout={3000}
          delayBeforeLeave={2750}
          doAction={() => {
            setDrawerOpen(false)
          }}
          />

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
          
          <ActionModal
          queryTerm={'paymentSucceeded'}
          msg={'Your payment has been processed successfully!'}
          redirectPath={'/'}
          timeout={3000}
          delayBeforeLeave={2750}
          doAction={() => {
            setDrawerOpen(false)
          }}
          />
          
          <ActionModal
          queryTerm={'paymentFailed'}
          msg={'There was an error, your payment method did not process'}
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
                <Elements stripe={stripePromise}>
                  <Checkout />
                </Elements>
              </Route>

              <Route path='/setup-payment-method'>
                <Elements stripe={stripePromise}>
                  <StripeCardEntryExample />
                </Elements>
              </Route>

              <Route path='/update-profile'>
                <br />
                <div>Update your info</div>
                <br />
                <UpdateUserDataForm
                user={user}
                setUpdatedProfile={setUpdatedProfile}
                extraActionFn={() => {
                  setDrawerOpen(false)
                }}
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