import React from 'react'
import styled, { css } from 'styled-components'
import { useLocation } from 'react-router-dom'

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

function ActionModal ({ doAction, msg }) {

  const location = useLocation()
  const [modal, setModal] = React.useState(false)
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
                doAction()
                setModal(false)
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
            {msg}
          </ModalDiv>
          <br />
        </>
      : null
    }
    </>
  )
}

export { ActionModal }