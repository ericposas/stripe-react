import React from 'react'
import { screen, render } from '@testing-library/react'
import { convertToDollar } from './ProductBox'

test('method convert to dollar should return a dollar-denoted string', () => {
    expect(
        convertToDollar(
            1000
        )
    )
    .toEqual(
        '10.00'
    )
})

// test('Checkout component should have Monthly Subscr. item in view', async () => {
//     render(<Checkout />)
//     let text = await screen.findByText(/monthly subscription/i)
//     console.log(
//         text
//     )
//     // expect(
//     // )
//     // .toBeInTheDocument()

// })
