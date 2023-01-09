import React from 'react'
import { Good } from './goodCard'

export const GoodsList = ({ goods = [], dispatch, disabled, usersList, loggedEmail, sharePermission=false }) => {
  const goodsRendered = () => {
    const goodsArray = !goods
      ? []
      : goods.map((good, index) => (
          // eslint-disable-next-line react/no-array-index-key, react/jsx-indent
          <Good good={good} index={index} size={goods.length} dispatch={dispatch} disabled={disabled} key={good?.productCode} usersList={usersList} loggedEmail={loggedEmail} sharePermission={sharePermission} />
        ))
    return goodsArray
  }
  return goodsRendered()
}
