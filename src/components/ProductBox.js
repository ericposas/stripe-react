import React from 'react'
import { convertToDollar } from '../App'

export default ({ product, itemsChecked, updateCart }) => (
    <>
        <div
        style={{
        'alignItems': 'center',
        'border': '1px solid #ccc',
        // 'backgroundColor': '',
        'borderRadius': '3px',
        'padding': '20px',
        'width': '300px',
        'position': 'absolute',
        'margin': 'auto',
        'left': 0,
        'right': 0,
        'boxShadow': '1px 1px 2px 2px rgba(0, 0, 0, 0.1)'
        }}
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
            type='checkbox'
            checked={itemsChecked[product.id]}
            onChange={() => { updateCart(product) }}
            />
        </span>
        <img
        style={{ 'width': '100px' }}
        src={ product.images[0] }
        />                
        </div>
    </>
)