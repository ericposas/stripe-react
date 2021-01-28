import React from 'react'
import StyledButton from './StyledButton'

export default ({ doAction }) => (
    <StyledButton
    onClick={doAction}
    style={{ position: 'absolute', left: '14px', top: '7px', width: '50px', fontSize: '24px' }}
    >
      &equiv;
    </StyledButton>
)
