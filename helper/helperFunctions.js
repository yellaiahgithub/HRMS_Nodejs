const v8 = require('v8')

/**
 * Checks an Arry is empty or not
 *
 * @method IsEmptyArray
 * @param {array} arr input array
 *
 * @return {boolean} boolean value indicating the array status
 */
const IsEmptyArray = (arr) => !(typeof arr === 'object' && arr instanceof Array && arr.length > 0)

/**
 * Checks a Set is valid or not
 *
 * @method IsEmptySet
 * @param {array} set input set
 *
 * @return {boolean} boolean value indicating the array status
 */
const IsEmptySet = (set) => !(typeof set === 'object' && set instanceof Set && set.size > 0)

/**
 * Checks a Value is Function
 *
 * @method IsFunction
 * @param {function} fn input function
 *
 * @return {boolean} boolean indicating if arg is valid function
 */
const IsFunction = (fn) => typeof fn === 'function'

/**
 * Find max value in array
 * This method is prefered over Math.max and array spread operator due to the time complexicity
 *
 * @method findMinValue
 * @param {array} arr input array
 *
 * @return {number} max number in array
 */
const findMaxValue = (arrObj) => {
  const arr = !IsEmptyArray(arrObj) ? arrObj : []
  let max = arr[0]
  for (let index = 0; index < arr.length; index += 1) {
    max = max > arr[index] ? max : arr[index]
  }
  return max
}

/**
 * Returns the result of substracting arr1-arr2
 *
 * @method subtractArray
 * @param {array} arr1 input array
 * @param {array} arr2 input array
 *
 * @return {array} resulting elements
 */
const subtractArray = (arrObj1, arrObj2) => {
  const arr1 = !IsEmptyArray(arrObj1) ? arrObj1 : []
  const arr2 = !IsEmptyArray(arrObj2) ? arrObj2 : []
  return arr1.filter((elem) => !arr2.includes(elem))
}

/**
 * Find min value in array
 * This method is prefered over Math.min and array spread operator due to the time complexicity
 *
 * @method findMinValue
 * @param {array} arr input array
 *
 * @return {number} min number in array
 */
const findMinValue = (arrObj) => {
  const arr = !IsEmptyArray(arrObj) ? arrObj : []
  let min = arr[0]
  for (let index = 0; index < arr.length; index += 1) {
    min = min < arr[index] ? min : arr[index]
  }
  return min
}

/**
 * Deep clone object
 *
 * @method jsonCopy
 * @param {object} src input object
 *
 * @return {object} cloned object
 */
const jsonCopy = (src) => JSON.parse(JSON.stringify(src))

/**
 * Deep clone object
 *
 * @method structuredClone
 * @param {object} obj input object
 *
 * @return {object} cloned object
 */

const structuredClone = (obj) => v8.deserialize(v8.serialize(obj))

/**
 * Checks an Object is empty or not
 *
 * @method IsEmptyObject
 * @param {object} arr input object
 *
 * @return {boolean} boolean value indicating the object status
 */
const IsEmptyObject = (obj) =>
  !(
    typeof obj === 'object' &&
    !(obj instanceof Array) &&
    obj !== null &&
    Object.keys(obj).length > 0
  )

/**
 * Checks a String is valid or not
 *
 * @method IsValidString
 * @param {string} str input string
 *
 * @return {boolean} boolean value indicating the string status
 */
const IsValidString = (str) => typeof str === 'string' && str.trim().length > 0

/**
 * removes a value from an array.
 *
 * @method removeArrayValue
 * @param {array} arr input number
 * @param {string/number} value input number
 * @param {string} field input number
 * @param {boolean} nested input number
 *
 * @return {array} an updated array after removing the field.
 */
const removeArrayValue = (arrObj, value, field = null, nested = false) => {
  const arr = !IsEmptyArray(arrObj) ? arrObj : []
  const index = nested ? arr.map((item) => item[field]).indexOf(value) : arr.indexOf(value)
  const result = index < 0 ? arr : arr.splice(index, 1)
  return result
}

/**
 * Checks a Number is valid or not
 *
 * @method IsValidNumber
 * @param {number} num input number
 *
 * @return {boolean} boolean value indicating the number status
 */
// eslint-disable-next-line
const IsValidNumber = num => !isNaN(parseFloat(num)) && Number.isFinite(parseFloat(num));

/**
 * Extract properies from object
 *
 * @method pickProperties
 * @param {string} O Object to extract properties from.
 * @param {array} K Array of properties.
 *
 * @return {object} Returns new object with extracted properties.
 */

// eslint-disable-next-line
const pickProperties = (O, K) => K.reduce((o, k) => (o[k] = O[k], o), {});

/**
 * Group array of objects by key
 *
 * @method groupByKey
 * @param {array} arr array of objects
 * @param {string} key key to group by
 *
 * @return {object} Returns new object with objects grouped by key
 */
const groupByKey = (arrObj, key) => {
  const arr = !IsEmptyArray(arrObj) ? arrObj : []
  const accObj = arr.reduce((acc, obj) => {
    const value = obj[key]
    if (value) {
      acc[value] = (acc[value] || []).concat(obj)
    }
    return acc
  }, {})
  return accObj
}

/**
 * Create hash map
 *
 * @method getFieldMap
 * @param {array} arr array of objects
 * @param {string} field object field
 * @param {boolean} toLower true if want to convert field to lowercase; false by default.
 *
 * @return {object} Returns new hash map
 */
const getFieldMap = (arrA, field, toLower = false) => {
  const arr = !IsEmptyArray(arrA) ? arrA : []
  const resultObj = arr.reduce((resultElm, elm) => {
    const result = { ...resultElm }
    const key = toLower && IsValidString(elm[field]) ? elm[field].toLowerCase().trim() : elm[field]
    if (key) {
      result[key] = elm
    }
    return result
  }, {})
  return resultObj
}

/**
 * removes a value from an array.
 *
 * @method arrIncludes
 * @param {array} arr input number
 * @param {string/number} value input number
 * @param {string} field input number
 * @param {boolean} nested input number
 *
 * @return {array} an updated array after removing the field.
 */
const arrIncludes = (arrA, value, nested = false, field = null) => {
  const arr = !IsEmptyArray(arrA) ? arrA : []
  let includes = false
  if (nested) {
    const exists = arr.find((ele) => ele[field] === value)
    includes = !IsEmptyObject(exists)
  } else {
    includes = arr.indexOf(value) >= 0
  }
  return includes
}

/**
 * validates a boolean field.
 *
 * @method IsBoolean
 * @param {boolean} field field to check
 *
 * @return {booean} valid boolean field or not;
 */
const IsBoolean = (field) => typeof field === 'boolean'

/**
 * Extracts an object containing two arrays, one with objects from arr having the field and its value be truthy;
 * and one with objects from arr missing the field, or having the field and its value be falsy.
 *
 * @param {array} arr An array of objects containing field
 * @param {string} field the name of the field to base the extraction upon
 */
const extractObjects = (arr, field) => {
  const resultsObj = arr.reduce(
    (results, obj) => {
      if (obj[field]) {
        results.truthyFieldObjectArr.push(obj)
      } else {
        results.falsyFieldObjectArr.push(obj)
      }
      return resultsObj
    },
    { falsyFieldObjectArr: [], truthyFieldObjectArr: [] }
  )
  const { falsyFieldObjectArr, truthyFieldObjectArr } = resultsObj
  return { falsyFieldObjectArr, truthyFieldObjectArr }
}

/**
 * Sorts array arr by the given field, ordered in the direction of sortOrder
 *
 * @param {*} arr - array of objects
 * @param {*} field - field by which the array objects should be sorted
 * @param {*} sortOrder - direction the objects will be sorted, default is ascending
 * @returns - sorted array with falsy field objects appended to the end
 */
const sortByField = (arr, field, sortOrder) => {
  const { falsyFieldObjectArr, truthyFieldObjectArr } = extractObjects(arr, field)
  if (truthyFieldObjectArr.length > 0) {
    const fieldType = typeof truthyFieldObjectArr[0][field]
    const desc = sortOrder === 'desc' // default sort is ascending
    if (fieldType === 'string') {
      if (desc) truthyFieldObjectArr.sort((a, b) => (b[field] > a[field] ? 1 : -1))
      else truthyFieldObjectArr.sort((a, b) => (a[field] > b[field] ? 1 : -1))
    } else if (fieldType === 'number') {
      if (desc) truthyFieldObjectArr.sort((a, b) => b[field] - a[field])
      else truthyFieldObjectArr.sort((a, b) => a[field] - b[field])
    }
  }
  truthyFieldObjectArr.push(...falsyFieldObjectArr)
  return truthyFieldObjectArr
}

/**
 * If provided valid key and array of documents, the method will filter the documents based on the key and will return single documents for the repeated ones.
 * This method will assume documents are duplicated and it will not going to test for other changes to determine its duplicated other than checking the provided key value,
 * if valid keys are not provided it will return empty array.
 *
 * @param {*} docs - array of objects
 * @param {*} key - field by which the array objects should be sorted
 * @returns - filtered array with removed duplicates
 */
const filterDocuments = (docsArray, keyStr) => {
  const docs = IsEmptyArray(docsArray) ? [] : docsArray
  const key = IsValidString(keyStr) ? keyStr : null

  if (!key) {
    return []
  }

  const map = getFieldMap(docs, key)
  const filteredObj = Object.values(map)
  return filteredObj
}

/**
 * Scan object for forbbiden keys and build an error message from the provided array of key-reason pairs.
 *
 * @param {!Object} object target object to scan for forbidden keys.
 * @param {!Object[]} keyReasonPairs array of objects containing a key to forbid and a reason why.
 * @param {!String} keyReasonPairs[].key the forbbiden key to scan for.
 * @param {!String} keyReasonPairs[].reason the message appended to the error when the key is found.
 */
const forbidKeys = (object, keyReasonPairs) => {
  const keyErrors = []
  keyReasonPairs.forEach((entry) => {
    if (entry.key in object) {
      keyErrors.push(`${entry.key} - ${entry.reason}`)
    }
  })
  if (keyErrors.length) {
    throw new Error(`The following fields are forbidden:\n${keyErrors.join('\n')}`)
  }
}

/**
 * Scan object for invalid fields.
 *
 * @method checkInvalidFields
 * @param {object} object Target object to scan.
 * @param {array} validFields Array of valid fields.
 *
 * @return {object} Returns error if object contains invalid fields.
 */
const checkInvalidFields = (object, validFields) => {
  const invalidFields = []
  Object.keys(object).forEach((key) => {
    if (!validFields.includes(key)) invalidFields.push(key)
  })
  if (invalidFields.length) {
    throw new Error(
      `Cannot proceed. The following fields are not allowed: ${invalidFields.join(', ')}`
    )
  }
}

/**
 * Performs a shallow comparison and returns an object containing only the keys
 * that exist in the differential but not the original, or keys that hold a different
 * value than the original.
 *
 * @param original The object to compare the differential against.
 * @param differential The object containing potential differences.
 * @returns An object containing the differece in keys between the two input objects.
 */
const objectDifference = (original, differential) => {
  const difference = {}
  Object.keys(differential).forEach((k) => {
    if (!(k in original) || differential[k] !== original[k]) {
      difference[k] = differential[k]
    }
  })
  return difference
}

function round(valueN, precision) {
  const value = IsValidNumber(valueN) ? valueN : 0
  const multiplier = 10 ** (precision || 0)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Checks if a string is a valid UUID
 *
 * @method IsValidUuid
 * @param {string} uuid input UUID
 *
 * @return {boolean} boolean value indicating the UUID status
 */
const IsValidUuid = (uuid) =>
  new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i).test(
    uuid
  )

/**
 * Checks if a string is a valid job UUID
 *
 * @method IsValidJobUuid
 * @param {string} jobUuid input job UUID
 *
 * @return {boolean} boolean value indicating the job UUID status
 */
const IsValidJobUuid = (jobUuid) => jobUuid === 'LIVE' || IsValidUuid(jobUuid)

const exactBool = (value) => value === 'true' || value === true || +value > 0

const isToday = (date) => {
  const today = new Date()
  return today.toDateString() === date.toDateString()
}

module.exports = {
  findMaxValue,
  findMinValue,
  filterDocuments,
  jsonCopy,
  IsEmptySet,
  IsEmptyArray,
  IsEmptyObject,
  IsValidString,
  IsBoolean,
  removeArrayValue,
  pickProperties,
  IsValidNumber,
  groupByKey,
  getFieldMap,
  arrIncludes,
  extractObjects,
  sortByField,
  subtractArray,
  forbidKeys,
  objectDifference,
  round,
  IsValidUuid,
  IsValidJobUuid,
  structuredClone,
  IsFunction,
  exactBool,
  checkInvalidFields,
  isToday
}
