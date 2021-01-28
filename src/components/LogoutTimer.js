import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function LogoutTimer ({ minutesOfInactivity }) {

    const { isAuthenticated, logout } = useAuth0()
    const minutes = React.useRef(minutesOfInactivity)
    const seconds = React.useRef(0)
    const timeout = React.useRef(() => setTOut(minutes.current))
    const interval = React.useRef(() => setCountdown(minutes.current))

    const setTOut = () => {
        // console.log(`logout timeout refreshed, set at ${minutes.current} minute${minutes.current > 1 ? 's' : ''}`)
        return setTimeout(() => {
            console.log(`logging out due to ${minutes.current} of inactivity`)
            // also remove the jwt token from localStorage
            if (localStorage.getItem('gym-app-jwt')) {
                localStorage.removeItem('gym-app-jwt')
            }
            logout({ redirectTo: window.location.origin })
        }, ((1000 * 60) * minutes.current))
    }

    const setCountdown = () => {
        seconds.current = minutes.current * 60
        return setInterval(() => {
            seconds.current = seconds.current - 1
            let sec = seconds.current % 60
            // console.log(`timer: ${((seconds.current - (seconds.current % 60)) / 60)}:${sec < 10 ? `0${sec}` : sec}`)
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

        return () => {
            window.removeEventListener('mousemove', mouseMoveHandler)
        }

    }, [isAuthenticated])

    return <></>

}