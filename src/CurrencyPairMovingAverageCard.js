import React from 'react'
import { getRandomInt, currencyPairDisplayName, getMovingAverageChangeinPercentage, getCardColor } from "./utils"
import numeral from "numeral"
import { wsURL } from "./constants"

class CurrencyPairMovingAverageCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCurrencyPairName: '',
      oldValues: [],
      currentValue: 0,
      showPickerDropDown: false,
      websocket: undefined,
      selectedNumOfTicks: 0
    }
    this.dropdownRef = React.createRef()
  }

  setupWebsocket = () => {
    const websocket = new WebSocket(wsURL)

    websocket.onopen = () => {
      this.sendMessage(this.state.selectedCurrencyPairName)
    }

    websocket.onmessage = (evt) => {
      // Convert string to number
      const currentValue = +evt.data

      this.setState(prevState => ({
        oldValues: [...prevState.oldValues, prevState.currentValue],
        currentValue
      }))
    }

    websocket.onclose = () => {
      this.setupWebsocket()
    }

    this.setState({ websocket })
  }

  componentDidUpdate(prevProps, prevState) {
    const { currencyPairsList: prevCurrencyPairsList } = prevProps
    const { currencyPairsList } = this.props
    const { selectedCurrencyPairName, websocket } = this.state

    if (prevCurrencyPairsList.length !== currencyPairsList.length &&
      prevState.selectedCurrencyPairName === '') {
      const randomSelectedCurrencyPairName = currencyPairsList[getRandomInt(currencyPairsList.length)].currency_name
      this.setState({
        selectedCurrencyPairName: randomSelectedCurrencyPairName
      })
    }

    if (prevState.selectedCurrencyPairName !== selectedCurrencyPairName) {
      this.setState({
        oldValues: [],
        currentValue: 0,
        selectedNumOfTicks: 0 
      })

      if (websocket) {
        websocket.close()
      } else {
        this.setupWebsocket()
      }
    }
  }

  componentWillUnmount() {
    const { websocket } = this.state

    if (websocket) {
      websocket.close()
    }
  }

  sendMessage = (currencyPair) => {
    const { websocket } = this.state

    websocket.send(JSON.stringify({ currencyPair }))
  }

  toggleShowPickerDropdown = () => {
    this.setState(prevState => {
      if (!prevState.showPickerDropDown) {
        document.addEventListener('click', this.handleOutsideDropdownClick)
      } else {
        document.removeEventListener('click', this.handleOutsideDropdownClick)
      }
      return { showPickerDropDown: !prevState.showPickerDropDown }
    })
  }

  handleOutsideDropdownClick = (evt) => {
    if (this.dropdownRef.current.contains(evt.target)) {
      return
    }

    this.toggleShowPickerDropdown()
  }

  handleClickDropdownOption = (currencyPairName) => {
    this.setState({ selectedCurrencyPairName: currencyPairName })
    this.toggleShowPickerDropdown()
  }

  incrementTicks = () => {
    const {selectedNumOfTicks, oldValues} = this.state

    if (selectedNumOfTicks < oldValues.length + 1) {
      this.setState(prevState => ({selectedNumOfTicks: prevState.selectedNumOfTicks + 1})) 
    }
  }

  decrementTicks = () => {
    const {selectedNumOfTicks} = this.state

    if (selectedNumOfTicks > 1) {
      this.setState(prevState => ({selectedNumOfTicks: prevState.selectedNumOfTicks - 1}))
    }
  }

  render() {
    const { 
      selectedCurrencyPairName,
      currentValue,
      oldValues,
      showPickerDropDown,
      websocket,
      selectedNumOfTicks 
    } = this.state
    const { currencyPairsList } = this.props
    const totalNumOfTicks = oldValues.length + 1
    const numOfTicksToDisplay = selectedNumOfTicks > 0 ? selectedNumOfTicks : totalNumOfTicks
    let percentageChange = getMovingAverageChangeinPercentage(oldValues, currentValue, numOfTicksToDisplay)
    const currentValueStr = numeral(currentValue).format('0.0000')
    const currentValueWholePartStr = currentValueStr.substring(0, currentValueStr.indexOf('.'))
    const currentValueDecimalStr = currentValueStr.substring(currentValueStr.indexOf('.') + 1)
    const currentValueDecimalSmallFontStr = currentValueDecimalStr.substring(0, 2)
    const currentValueDecimalBigFontStr = currentValueDecimalStr.substring(2)
    const percentageStr = numeral(percentageChange).format('0.00')

    return (
      <div
        className="currency-pair-card"
        style={{ backgroundColor: getCardColor(percentageChange) }}
      >
        {(!websocket || websocket.readyState !== WebSocket.OPEN) &&
          <div className="connecting-message">Connecting...</div>
        }
        <div className="row1">
          <div className="currency-pair-picker">
            <div className="picker-button"
              onClick={this.toggleShowPickerDropdown}
            >
              <span>
                {selectedCurrencyPairName ? currencyPairDisplayName(selectedCurrencyPairName) : selectedCurrencyPairName}
              </span>
              <span className="caret"></span>
            </div>
            {showPickerDropDown &&
              <ul
                className="picker-drop-down"
                ref={this.dropdownRef}
              >
                {currencyPairsList.map(currencyPair =>
                  <li
                    key={currencyPair.currency_name}
                    className={currencyPair.currency_name === selectedCurrencyPairName ? 'selected' : ''}
                    onClick={() => this.handleClickDropdownOption(currencyPair.currency_name)}
                  >
                    {currencyPairDisplayName(currencyPair.currency_name)}
                  </li>
                )}
              </ul>
            }
          </div>
          <div className="percentage-change">
            {percentageChange > 0 ? `+${percentageStr}` : percentageStr}%
          </div>
        </div>
        <div className="row2">
          <div className="current-value-container">
            <div className="current-value-big">
              {currentValueWholePartStr}.
              <span className="current-value-small">
                {currentValueDecimalSmallFontStr}
              </span>
              {currentValueDecimalBigFontStr}
            </div>
          </div>
          <div className="num-of-ticks-container">
            <div className="num-of-ticks-header">
              No. Of Ticks
            </div>
            <div className="num-of-ticks-body">
              <span
              className="ticks-controls"
              onClick={this.decrementTicks}
              >-</span>
              <span className="ticks-value">{numOfTicksToDisplay}</span>
              <span
              className="ticks-controls"
              onClick={this.incrementTicks}
              >+</span>
            </div>
          </div>
        </div>
        <div className="graph">
          Graph coming soon
          </div>
      </div>
    )
  }
}

export default CurrencyPairMovingAverageCard