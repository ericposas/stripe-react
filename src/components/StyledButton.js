import styled from 'styled-components'

const StyledButton = styled.button`
    width: 200px;
    height: 50px;
    background-color: slateblue;
    border-radius: 3px;
    color: #fff;
    border: none;
    transition: all .35s;
    transform: scale(1.0);
    cursor: pointer;
    &:hover {
        background-color: royalblue;
        transition: all .35s;
        transform: scale(1.05);
    }
`

export default StyledButton
