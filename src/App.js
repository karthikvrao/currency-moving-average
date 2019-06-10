import React from 'react'
import './App.css'
import { getCurrencyPairs } from "./utils"
import CurrencyPairMovingAverageCard from "./CurrencyPairMovingAverageCard"
// import * as d3 from "d3"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currencyPairs: []
    }
  }


  componentDidMount() {
    getCurrencyPairs().then(currencyPairs => this.setState({ currencyPairs }))
  }

  render() {
    const { currencyPairs } = this.state

    return (
      <div className="App">
        <div className="App-row">
          <CurrencyPairMovingAverageCard
            currencyPairsList={currencyPairs}
          />
          <CurrencyPairMovingAverageCard
            currencyPairsList={currencyPairs}
          />
        </div>
        <div className="App-row">
          <CurrencyPairMovingAverageCard
            currencyPairsList={currencyPairs}
          />
          <CurrencyPairMovingAverageCard
            currencyPairsList={currencyPairs}
          />
        </div>
      </div>
    )
  }
}

export default App
