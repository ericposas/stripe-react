{
    itemsList().map(item => {
      // console.log(item.price_data.product_data.name)
      let amt = item.price_data.unit_amount.toString()
      let dollarAmt = amt.split('')
      dollarAmt.pop()
      dollarAmt.pop()
      dollarAmt.push('.00')
      dollarAmt.join('')
      
      return (
        <div
        style={{
          'border': '1px solid grey',
          'padding': '10px'
        }}
        >
          {
            item.price_data.product_data.name
          }
          <span
          style={{
            'margin-left': '20px'
          }}
          >
            ${
              dollarAmt
            }
          </span>
          <span
          style={{
            'margin-left': '20px'
          }}
          >
            <button
            onClick={() => decrementItem(item)}
            >-</button>
            <button
            onClick={() => incrementItem(item)}
            >+</button>
          </span>
          <span
          style={{
            'margin-left': '20px'
          }}
          >
            Quantity: &nbsp;
            {
              itemTypesInCart[
                item.price_data.product_data.name
              ]
            }
          </span>
        </div>
      ) 
    })
  }