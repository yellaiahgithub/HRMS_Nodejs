function payLoadMapper(
  uuid,
  featureType,
  geometryType,
  featureClassGroup,
  featureClass,
  scale,
  angle,
  text,
  style,
  location,
  subFeatures,
  attributes,
  highlightGroupUuid
) {
  const obj = {}
  obj.highlightGroupUuid = highlightGroupUuid || ''
  obj.uuid = uuid || ''
  obj.featureType = featureType || ''
  obj.geometryType = geometryType || ''
  obj.featureClassGroup = featureClassGroup || ''
  obj.featureClass = featureClass || ''
  obj.scale = scale || 0
  obj.angle = angle || 0
  obj.text = text || ''
  obj.style = style || {}
  obj.location = location || {}
  obj.subFeatures = subFeatures || []
  obj.compositeAttributes = attributes || []
  return obj
}

function userPreference() {
  const obj = {}
  obj.lastMapLocation = []
  obj.lastMapZoom = 18.1
  obj.lastSearch = ''
  obj.searchHistory = []
  obj.zoomHistory = []
  obj.homeLocation = { name: 'homeLocation' }
  obj.savedViews = []
  obj.mapLocationHistory = []
  obj.toggledLayerFeatures = {}
  return obj
}

function powerCalcResult(
  uuid,
  device,
  equipment,
  singleCurr,
  resistance,
  calCurr,
  calcVoltage,
  calPSDir,
  side,
  status
) {
  const obj = {}
  obj.Uuid = uuid || ''
  obj.Name = device || 'NA'
  obj.FeatureClass = equipment || ''
  obj.CurrentDraw = singleCurr || 0
  obj.Resistance = resistance || 0
  obj.Current = calCurr || 0
  obj.Voltage = calcVoltage || 0
  obj.Direction = calPSDir || ''
  obj.Side = side || ''
  obj.Status = status || ''
  return obj
}

// direction response object.
class DirectionResponse {
  constructor(enabled, type, name, uuid, featureClass, featureClassGroup) {
    this.enabled = enabled
    this.type = type
    this.name = name
    this.uuid = uuid
    this.featureClass = featureClass
    this.featureClassGroup = featureClassGroup
  }
}

module.exports = {
  payLoadMapper,
  userPreference,
  powerCalcResult,
  DirectionResponse
}
