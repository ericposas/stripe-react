import React from 'react'
import styled, { css } from 'styled-components'
import { useLocation, useHistory } from 'react-router-dom'

const ModalDiv_SlideIn = styled.div`
color: white;
positon: absolute;
padding: 10px 25px;
border-radius: 3px;
background-color: mediumseagreen;
box-shadow: 1px 1px 2px 2px rgba(0, 0, 0, 0.2);
transform: translateX(-100vw);
transition: transform .5s ease-out;
${props => props.slide === 'in' && css`
  transform: translateX(0px);
`}
${props => props.slide === 'out' && css`
  transform: translateX(200vw);
`}
`

function ActionModal ({ doAction, msg, redirectPath, queryTerm, timeout, delayBeforeLeave }) {

  const location = useLocation()
  const history = useHistory()
  const [modal, setModal] = React.useState(false)
  const [slide, setSlide] = React.useState(null)
  
  React.useEffect(() => {
    if (location) {
      let search = location.search.substr(1, location.search.length)
      let params = search.split('=')
      if (params) {
        let key = params[0]
        let value = params[1]
        if (key && value) {
          console.log(key, value)
          if (key === queryTerm) {
            if (value === 'complete') {
              setModal(true) // maybe replace this with react toast lib
              setTimeout(() => setSlide('in'), 50)
              setTimeout(() => {
                setSlide('out')
              }, delayBeforeLeave)
              setTimeout(() => {
                if (redirectPath) {
                  history.push(redirectPath)
                }
                doAction()
                setModal(false)
              }, timeout)
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
            <ModalDiv_SlideIn slide={ slide }>
              {msg}
            </ModalDiv_SlideIn>
        </>
      :
        <></>
    }
    </>
  )
}

export { ActionModal }