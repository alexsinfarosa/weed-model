import format from 'date-fns/format'
import addDays from 'date-fns/add_days'

// PRE FETCHING ---------------------------------------------------------
export const matchIconsToStations = (protocol, station, state) => {
  const {network} = station
  const {postalCode} = state

  const newa = `${protocol}//newa2.nrcc.cornell.edu/gifs/newa_small.png`
  const newaGray = `${protocol}//newa2.nrcc.cornell.edu/gifs/newa_smallGray.png`
  const airport = `${protocol}//newa2.nrcc.cornell.edu/gifs/airport.png`
  const airportGray = `${protocol}//newa2.nrcc.cornell.edu/gifs/airportGray.png`
  const culog = `${protocol}//newa2.nrcc.cornell.edu/gifs/culog.png`
  const culogGray = `${protocol}//newa2.nrcc.cornell.edu/gifs/culogGray.png`

  if (
    network === 'newa' ||
    network === 'miwx' ||
    network === 'ucc' ||
    network === 'nwon' ||
    network === 'oardc' ||
    network === 'njwx' ||
    network === 'nysm' ||
    ((network === 'cu_log' || network === 'culog') && station.state !== 'NY')
  ) {
    return station.state === postalCode || postalCode === 'ALL'
      ? newa
      : newaGray
  }

  if (network === 'cu_log' || network === 'culog') {
    return station.state === postalCode || postalCode === 'ALL'
      ? culog
      : culogGray
  }

  if (network === 'icao') {
    return station.state === postalCode || postalCode === 'ALL'
      ? airport
      : airportGray
  }
}

// Handling Temperature parameter and Michigan network id adjustment
export const networkTemperatureAdjustment = network => {
  // Handling different temperature parameter for each network
  if (
    network === 'newa' ||
    network === 'icao' ||
    network === 'njwx' ||
    network === 'oardc' ||
    network === 'nysm'
  ) {
    return '23'
  } else if (
    network === 'miwx' ||
    network === 'cu_log' ||
    network === 'culog'
  ) {
    return '126'
  }
}

// Handling Relative Humidity Adjustment
export const networkHumidityAdjustment = network =>
  network === 'miwx' ? '143' : '24'

// Handling Michigan state ID adjustment
export const michiganIdAdjustment = station => {
  // Michigan
  if (
    station.state === 'MI' &&
    station.network === 'miwx' &&
    station.id.slice(0, 3) === 'ew_'
  ) {
    // example: ew_ITH
    return station.id.slice(3, 6)
  }

  // NY mesonet
  if (
    station.state === 'NY' &&
    station.network === 'nysm' &&
    station.id.slice(0, 5) === 'nysm_'
  ) {
    // example: nysm_spra
    return station.id.slice(5, 9)
  }

  return station.id
}

export const allStations = (
  protocol,
  acis,
  stations,
  state,
  startDate,
  endDate,
) => {
  let stationsWithIcons = matchIconsToStations(protocol, stations, state)

  // building the station object with the things I might need
  for (const station of stationsWithIcons) {
    station['sid'] = `${station.name} ${station.network}`
    station['sdate'] = startDate
    station['edate'] = format(addDays(endDate, 6), 'YYYY-MM-DD')
    station['id-adj'] = michiganIdAdjustment(station)
    station['elems'] = [
      // temperature
      networkTemperatureAdjustment(station.network),
      // relative humidity
      networkHumidityAdjustment(station.network),
      // leaf wetness
      '118',
      // precipitation
      '5',
    ]
  }
  // console.log(stationsWithIcons);
  return stationsWithIcons
}

// POST FETCHING ----------------------------------------------------------------------------

// Returns the average of two numbers.
export const avgTwoStringNumbers = (a, b) => {
  const aNum = parseFloat(a)
  const bNum = parseFloat(b)
  return Math.round((aNum + bNum) / 2).toString()
}

export const replaceNonConsecutiveMissingValues = data => {
  return data.map(day => {
    return day.map(param => {
      if (Array.isArray(param)) {
        return param.map((e, i) => {
          if (i === 0 && e === 'M') {
            return param[i + 1]
          } else if (i === param.length - 1 && e === 'M') {
            return param[i - 1]
          } else if (
            e === 'M' &&
            param[i - 1] !== 'M' &&
            param[i + 1] !== 'M'
          ) {
            return avgTwoStringNumbers(param[i - 1], param[i + 1])
          } else {
            return e
          }
        })
      }
      return param
    })
  })
}

// Replaces current station (cStation) missing values with compared station
export const replaceMissingValues = (cStation, sStation) => {
  return cStation.map((e, i) => {
    if (e === 'M' && sStation[i] !== 'M') {
      return sStation[i].toString()
    }
    return e.toString()
  })
}

// Returns rh array containing new values.
// The new values are calculated according to the equation below.
export const RHAdjustment = arr => {
  return arr.map(e => {
    if (e !== 'M') {
      return Math.round(parseFloat(e) / (0.0047 * parseFloat(e) + 0.53))
    } else {
      return e
    }
  })
}

// Returns average of all the values in array
export const average = data => {
  // handling the case for T and W
  if (data.length === 0) return 0

  //  calculating average
  let results = data.map(e => parseFloat(e))
  return Math.round(results.reduce((acc, val) => acc + val, 0) / data.length)
}

// Returns array with elements above the second argument of the function
export const aboveValue = (data, value) => {
  return data.map(e => {
    if (e > value) {
      return e
    }
    return false
  })
}

// Returns array with elements equal to and above the second argument of the function
export const aboveEqualToValue = (data, value) => {
  return data.map(e => {
    if (e >= value) {
      return e
    }
    return false
  })
}

// This function will shift data from (0, 23) to (13, 12)
export const noonToNoon = data => {
  let results = []

  // get all dates
  const dates = data.map(day => day[0])

  // shifting Temperature array
  const TP = data.map(day => day[1])
  const TPFlat = [].concat(...TP)
  let TPShifted = []
  while (TPFlat.length > 24) {
    TPShifted.push(TPFlat.splice(12, 24))
  }

  // shifting relative humidity array
  let RH = data.map(day => day[2])
  const RHFlat = [].concat(...RH)
  let RHShifted = []
  while (RHFlat.length > 24) {
    RHShifted.push(RHFlat.splice(12, 24))
  }

  // shifting leaf wetness array
  const LW = data.map(day => day[3])
  const LWFlat = [].concat(...LW)
  let LWShifted = []
  while (LWFlat.length > 24) {
    LWShifted.push(LWFlat.splice(12, 24))
  }

  // shifting precipitation array
  const PT = data.map(day => day[4])
  const PTFlat = [].concat(...PT)
  let PTShifted = []
  while (PTFlat.length > 24) {
    PTShifted.push(PTFlat.splice(12, 24))
  }

  for (const [i, el] of dates.entries()) {
    results[i] = [el, TPShifted[i], RHShifted[i], LWShifted[i], PTShifted[i]]
  }

  // Since to shift data we requested one day more, we slice to get rid of the extra day
  return results.slice(0, -1)
}
