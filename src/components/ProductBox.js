import React from 'react'
import styled from 'styled-components'

const StyledProductBoxDiv = styled.div`
user-select: none;
align-items: center;
box-shadow: 1px 1px 2px 2px rgba(0, 0, 0, 0.15);
border-radius: 3px;
padding: 20px;
width: 300px;
position: relative;
margin: auto;
left: 0;
right: 0;
transform: scale(1.00);
transition: all .35s;
cursor: pointer;
&:hover {
    transform: scale(1.025);
    transition: all .35s;
}
`

export const convertToDollar = priceNum => {
    let amt = priceNum.toString()
    let dollarAmt = amt.split('')
    dollarAmt.pop()
    dollarAmt.pop()
    dollarAmt.push('.00')
    dollarAmt = dollarAmt.join('')
    return dollarAmt
}

export default ({ product, itemsChecked, updateCart }) => (
    <>
        <StyledProductBoxDiv
        onClick={() => { updateCart(product) }}
        >
            <span>
                <div key={product.id}>
                { product.name }
                </div>
                <div>
                { product.statement_descriptor }
                </div>
                <div>
                ${ convertToDollar( product.metadata.price ) }
                </div>
                <input
                style={{
                    position: 'relative',
                    right: '20px'
                }}
                type='checkbox'
                checked={itemsChecked[product.id]}
                onChange={() => { updateCart(product) }}
                />
            </span>
            <img
            style={{ 'width': '100px' }}
            src={ product.images[0] }
            />
        </StyledProductBoxDiv>
    </>
)