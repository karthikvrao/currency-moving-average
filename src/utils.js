import _ from "lodash"
import { baseColorValue, percentageRangeStart, percentageRangeEnd, percentageChangeStepSize } from "./constants"

export const getCurrencyPairs = async () => {
  const response = await fetch('https://restsimulator.intuhire.com/currency_pairs')
  const data = await response.json()

  return data
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

export const currencyPairDisplayName = (currencyPairName) => `${currencyPairName.substring(0, 3)}/${currencyPairName.substring(3)}`

export const getMovingAverageChangeinPercentage = (oldValues, currentValue) => {
  const allValues = [...oldValues, currentValue]
  let percentageChange = 0
  const numOfValues = allValues.length
  if (numOfValues > 0) {
    const sum = allValues.reduce((total, value) => total + value)
    const movingAverage = sum / numOfValues

    if (movingAverage !== 0) {
      percentageChange = ((currentValue - movingAverage) / movingAverage) * 100 
    }
  }

  return percentageChange
}

export const getCardColor = (percentageChange) => {
  const steps = _.range(percentageRangeStart, percentageRangeEnd, percentageChangeStepSize)

  const colorCssAttr = ({redValue = 0, greenValue = 0}) => `rgb(${redValue}, ${greenValue}, 0)`
  const percentageGreaterThan = steps.reduce(
    (valueGreaterThan, value) => Math.abs(percentageChange) > value ? value : valueGreaterThan
    , 0)

  let colorValue = 0
  if (percentageGreaterThan !== 0) {
    colorValue = baseColorValue + (percentageGreaterThan / percentageChangeStepSize) * 10
  }

  // Determine to apply to red or green or orange (nil or not significant change)
  if (percentageChange > -percentageRangeStart && percentageChange < percentageRangeStart ) {
    return 'orange'
  } else if (percentageChange >= percentageRangeStart) {
    return colorCssAttr({redValue: colorValue})
  } else {
    return colorCssAttr({greenValue: colorValue})
  }
}