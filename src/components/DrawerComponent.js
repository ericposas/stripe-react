import React from 'react'
import {
  Link
} from 'react-router-dom'
import StyledButton from './StyledButton'

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
            <Link to='/'>
              <StyledButton
                onClick={() => setDrawerOpen(false)}
                style={{ backgroundColor: 'royalblue' }}
              >
                Profile Info
              </StyledButton>
            </Link>
            <br />
            <br />
            <Link to='/update-profile'>
              <StyledButton
              onClick={() => setDrawerOpen(false)}
              style={{ backgroundColor: 'royalblue' }}
              >
                Update profile info
              </StyledButton>
            </Link>
            <br />
            <br />
            <Link to='/checkout'>
              <StyledButton
                onClick={() => setDrawerOpen(false)}
                style={{ backgroundColor: 'royalblue' }}
              >
                Enroll in Classes
              </StyledButton>
            </Link>
            <br />
  
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

export {
    DrawerLeftPanel,
    DarkenDiv
}