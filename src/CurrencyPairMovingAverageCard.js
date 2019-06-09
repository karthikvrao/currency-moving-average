import React from 'react'
import { getRandomInt, getMovingAverageChangeinPercentage, getCardColor } from "./utils"
import numeral from "numeral"
import { wsURL } from "./constants"

class CurrencyPairMovingAverageCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedCurrencyPairName: '',
      oldValues: [],
      currentValue: 0,
      showPickerDropDown: false
    }
    this.dropdownRef = React.createRef()
  }

  setupWebsocket = () => {
    this.websocket = new WebSocket(wsURL)

    this.websocket.onopen = () => {
      this.sendMessage(this.state.selectedCurrencyPairName)
    }

    this.websocket.onmessage = (evt) => {
      // Convert string to number
      const currentValue = +evt.data

      this.setState(prevState => ({
        oldValues: [...prevState.oldValues, prevState.currentValue],
        currentValue
      }))
    }

    this.websocket.onclose = () => {
      this.setupWebsocket()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { currencyPairsList: prevCurrencyPairsList } = prevProps
    const { currencyPairsList } = this.props
    const { selectedCurrencyPairName } = this.state

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
        currentValue: 0
      })
      if (this.websocket) {
        this.websocket.close()
      } else {
        this.setupWebsocket()
      }
    }
  }

  componentWillUnmount() {
    if (this.websocket) {
      this.websocket.close()
    }
  }

  sendMessage = (currencyPair) => {
    this.websocket.send(JSON.stringify({ currencyPair }))
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

  render() {
    const { selectedCurrencyPairName, currentValue, oldValues, showPickerDropDown } = this.state
    const { currencyPairsList } = this.props
    let percentageChange = getMovingAverageChangeinPercentage(oldValues, currentValue)
    // debugger
    const currentValueStr = numeral(currentValue).format('0.0000')
    const currentValueWholePartStr = currentValueStr.substring(0, currentValueStr.indexOf('.'))
    const currentValueDecimalStr = currentValueStr.substring(currentValueStr.indexOf('.') + 1)
    const currentValueDecimalSmallFontStr = currentValueDecimalStr.substring(0, 2)
    const currentValueDecimalBigFontStr = currentValueDecimalStr.substring(2)

    const percentageStr = numeral(percentageChange).format('0.00')
    const currencyPairDisplayName = (currencyPairName) => `${currencyPairName.substring(0, 3)}/${currencyPairName.substring(3)}`

    return (
      <div
        className="currency-pair-card"
        style={{ backgroundColor: getCardColor(percentageChange) }}
      >
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
              <span>-</span>
              <span>8</span>
              <span>+</span>
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