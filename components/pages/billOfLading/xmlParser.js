import { message } from 'antd'
import { i18n } from '../../../services/i18n'

export const extractGoodFromXml = async (fileHandle, dispatch) => {
  const fileData = await fileHandle.getFile()
  const text = await fileData.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')
  // console.log('text', text)

  // Get company information (issuer)
  const issuerDOM = xmlDoc.getElementsByTagName('cfdi:Emisor')
  const issuer = {
    rfc: issuerDOM[0].getAttribute('Rfc'),
    name: issuerDOM[0].getAttribute('Nombre'),
  }
  const currency = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('Moneda')
  const conceptos = xmlDoc.getElementsByTagName('cfdi:Concepto')
  const mercancias = xmlDoc.getElementsByTagName('cce11:Mercancia')
  // console.log('conceptos', conceptos)
  // console.log('mercancias', mercancias)

  // Get goods attributes
  let conceptosIndex = 0
  const newGoodsArray = []
  const satProductCodeArray = []
  for (conceptosIndex = 0; conceptosIndex < conceptos.length; conceptosIndex += 1) {
    const newGood = {
      company: issuer,
      currency: currency,
    }
    if (conceptos[conceptosIndex].getAttribute('ClaveProdServ')) {
      newGood.satProductCode = conceptos[conceptosIndex].getAttribute('ClaveProdServ')
      satProductCodeArray.push(conceptos[conceptosIndex].getAttribute('ClaveProdServ'))
    }
    if (conceptos[conceptosIndex].getAttribute('NoIdentificacion'))
      newGood.productIdNumber = conceptos[conceptosIndex].getAttribute('NoIdentificacion')
    if (conceptos[conceptosIndex].getAttribute('Unidad'))
      newGood.satUnitKey = conceptos[conceptosIndex].getAttribute('Unidad').substring(0, 3)
    if (conceptos[conceptosIndex].getAttribute('Descripcion')) newGood.description = conceptos[conceptosIndex].getAttribute('Descripcion')
    if (conceptos[conceptosIndex].getAttribute('Cantidad')) newGood.quantity = conceptos[conceptosIndex].getAttribute('Cantidad')
    if (conceptos[conceptosIndex].getAttribute('Importe')) newGood.value = conceptos[conceptosIndex].getAttribute('Importe')

    // Get FraccionArancelaria
    if (mercancias) {
      const noIdentificacion = conceptos[conceptosIndex].getAttribute('NoIdentificacion')
      const selector = `[NoIdentificacion="${noIdentificacion}"]`
      const selectorResult = xmlDoc.querySelectorAll(selector)
      newGood.tariffCode = selectorResult[1].getAttribute('FraccionArancelaria')
    }

    // Add it to Array
    newGoodsArray.push(newGood)
  }

  // Add it to BoLHStatus and DB
  dispatch({ type: 'Add Item from XML', payload: { satProductCodeArray: satProductCodeArray, goodsArray: newGoodsArray } })
  // console.log('newGoodsArray', newGoodsArray)

  const good = {
    _id: '61ce63e3c0a011153633d8a6',
    company: {
      // OK
      _id: 'Xy9B4Tcdk9eviyPxq',
      name: 'REHAU SA DE CV', // OK
      rfc: 'REH930611FA8', // OK
    },
    companyId: 'Xy9B4Tcdk9eviyPxq',
    currency: 'USD', // OK
    dangerousMaterial: 'Sí',
    dangerousMaterialCode: '77382883928',
    description: 'Sellos de Goma Nuevos', // OK
    dimensions: {
      depth: 22,
      height: 23,
      unitMeasure: 'cm',
      width: 123,
    },
    packagingCode: '4G',
    packagingDescription: 'Cajas de Cartón',
    pedimento: '20039302930',
    productCode: 'PN 7777 New',
    quantity: 2,
    satProductCode: '88473849', // OK
    satUnitKey: 'E48', // OK
    tariffCode: '7738273',
    value: 0, // OK
    weightInKg: 370,
  }
  return newGoodsArray
}

export const loadXMLFileToParse = async () => {
  const fileHandleArray = await window.showOpenFilePicker({
    types: [{ description: 'XML File', accept: { 'application/xml': ['.xml'] } }],
    multiple: true,
  })
  const newGoods = []
  let countGoods = 0
  await fileHandleArray.map(fileHandle => {
    extractGoodFromXml(fileHandle).then(goodArray => {
      goodArray.map(item => {
        newGoods.push(item)
        countGoods += 1
        return null
      })
    })
    return null
    // console.log('goodArray', newGoods)
  })
  message.success(`${i18n('newBillOfLadingHub.goods.itemsAddedSuccessfullyFromXML')}`)
}

export const extractDataFromXml = async fileHandle => {
  const fileData = await fileHandle.getFile()
  const text = await fileData.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')
  // console.log('text', text)

  // Get company information (issuer)
  const issuerDOM = xmlDoc.getElementsByTagName('cfdi:Emisor')
  const issuer = {
    rfc: issuerDOM[0].getAttribute('Rfc'),
    name: issuerDOM[0].getAttribute('Nombre'),
  }

  // Get company information (receiver)
  const receiverDOM = xmlDoc.getElementsByTagName('cfdi:Receptor')
  const receiver = {
    rfc: receiverDOM[0].getAttribute('Rfc'),
    name: receiverDOM[0].getAttribute('Nombre'),
  }

  // Get CFDI Invoice information
  const folio = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('Folio')
  const date = {
    sat: xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('Fecha'),
    print: xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('Fecha').replace(/T/, ' '),
  }
  const subtotal = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('SubTotal')
  const currency = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('Moneda')
  const exchangeRate = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('TipoCambio')
    ? xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('TipoCambio')
    : 1
  const total = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('Total')
  const cfdiType = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('TipoDeComprobante')
  const taxArray = xmlDoc.getElementsByTagName('cfdi:Impuestos')
  let tax
  let taxRetention
  let taxIndex = 0
  for (taxIndex = 0; taxIndex < taxArray.length; taxIndex += 1) {
    if (taxArray[taxIndex].getAttribute('TotalImpuestosTrasladados')) {
      tax = taxArray[taxIndex].getAttribute('TotalImpuestosTrasladados')
    } else {
      tax = 0
    }
    if (taxArray[taxIndex].getAttribute('TotalImpuestosRetenidos')) {
      taxRetention = taxArray[taxIndex].getAttribute('TotalImpuestosRetenidos')
    } else {
      taxRetention = 0
    }
  }

  const invoiceData = {
    date: date,
    folio: folio,
    currency: currency,
    exchangeRate: parseFloat(exchangeRate),
    subtotal: parseFloat(subtotal),
    tax: parseFloat(tax),
    taxRetention: parseFloat(taxRetention),
    total: parseFloat(total),
    cfdiType: cfdiType,
  }

  // const conceptos = xmlDoc.getElementsByTagName('cfdi:Concepto')
  // const mercancias = xmlDoc.getElementsByTagName('cce11:Mercancia')
  // // console.log('conceptos', conceptos)
  // // console.log('mercancias', mercancias)

  // // Get goods attributes
  // let conceptosIndex = 0
  // const newGoodsArray = []
  // const satProductCodeArray = []
  // for (conceptosIndex = 0; conceptosIndex < conceptos.length; conceptosIndex += 1) {
  //   const newGood = {
  //     company: issuer,
  //     currency: currency,
  //   }
  //   if (conceptos[conceptosIndex].getAttribute('ClaveProdServ')) {
  //     newGood.satProductCode = conceptos[conceptosIndex].getAttribute('ClaveProdServ')
  //     satProductCodeArray.push(conceptos[conceptosIndex].getAttribute('ClaveProdServ'))
  //   }
  //   if (conceptos[conceptosIndex].getAttribute('NoIdentificacion'))
  //     newGood.productIdNumber = conceptos[conceptosIndex].getAttribute('NoIdentificacion')
  //   if (conceptos[conceptosIndex].getAttribute('Unidad'))
  //     newGood.satUnitKey = conceptos[conceptosIndex].getAttribute('Unidad').substring(0, 3)
  //   if (conceptos[conceptosIndex].getAttribute('Descripcion')) newGood.description = conceptos[conceptosIndex].getAttribute('Descripcion')
  //   if (conceptos[conceptosIndex].getAttribute('Cantidad')) newGood.quantity = conceptos[conceptosIndex].getAttribute('Cantidad')
  //   if (conceptos[conceptosIndex].getAttribute('Importe')) newGood.value = conceptos[conceptosIndex].getAttribute('Importe')

  //   // Get FraccionArancelaria
  //   if (mercancias) {
  //     const noIdentificacion = conceptos[conceptosIndex].getAttribute('NoIdentificacion')
  //     const selector = `[NoIdentificacion="${noIdentificacion}"]`
  //     const selectorResult = xmlDoc.querySelectorAll(selector)
  //     newGood.tariffCode = selectorResult[1].getAttribute('FraccionArancelaria')
  //   }

  //   // Add it to Array
  //   newGoodsArray.push(newGood)
  // }

  // // Add it to BoLHStatus and DB
  // // dispatch({ type: 'Add Item from XML', payload: { satProductCodeArray: satProductCodeArray, goodsArray: newGoodsArray } })
  // // console.log('newGoodsArray', newGoodsArray)

  // const good = {
  //   _id: '61ce63e3c0a011153633d8a6',
  //   company: {
  //     // OK
  //     _id: 'Xy9B4Tcdk9eviyPxq',
  //     name: 'REHAU SA DE CV', // OK
  //     rfc: 'REH930611FA8', // OK
  //   },
  //   companyId: 'Xy9B4Tcdk9eviyPxq',
  //   currency: 'USD', // OK
  //   dangerousMaterial: 'Sí',
  //   dangerousMaterialCode: '77382883928',
  //   description: 'Sellos de Goma Nuevos', // OK
  //   dimensions: {
  //     depth: 22,
  //     height: 23,
  //     unitMeasure: 'cm',
  //     width: 123,
  //   },
  //   packagingCode: '4G',
  //   packagingDescription: 'Cajas de Cartón',
  //   pedimento: '20039302930',
  //   productCode: 'PN 7777 New',
  //   quantity: 2,
  //   satProductCode: '88473849', // OK
  //   satUnitKey: 'E48', // OK
  //   tariffCode: '7738273',
  //   value: 0, // OK
  //   weightInKg: 370,
  // }
  return invoiceData
}

export const loadXMLFileToParseNewDocumentForm = async parentDispatch => {
  const fileHandleArray = await window.showOpenFilePicker({
    types: [{ description: 'XML File', accept: { 'application/xml': ['.xml'] } }],
    multiple: false,
  })
  await fileHandleArray.map(fileHandle => {
    extractDataFromXml(fileHandle).then(invoiceData => {
      // console.log('invoiceData', invoiceData)
      parentDispatch({ type: 'Add Cost Extracted From XML', payload: invoiceData })
    })
    return null
  })
  // console.log('goodArray', newGoods)
  message.success(`${i18n('newBillOfLadingHub.newDocument.costsExtractedFromXML')}`)
}

export const ladXMLFiles = async (multiple = true) => {
  const fileHandleArray = await window.showOpenFilePicker({
    types: [{ description: 'XML File', accept: { 'application/xml': ['.xml'] } }],
    multiple: multiple,
  })

  return fileHandleArray
}

export const extractGoodsFromXml = async (fileHandle, company, authorizedUsers) => {
  // Check for the existance of the correct information to complete the extraction of Goods from XML
  const errors = []
  if (!fileHandle) return errors.push('Error: No XML information added')
  if (!company) return errors.push('Error: No company information added')
  if (!authorizedUsers) return errors.push('Error: No authorized users information added')

  // Parse XML to extraction
  const fileData = await fileHandle.getFile()
  const text = await fileData.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')

  // Get company information (issuer)
  const issuerDOM = xmlDoc.getElementsByTagName('cfdi:Emisor')
  const issuer = {
    rfc: issuerDOM[0].getAttribute('Rfc'),
    name: issuerDOM[0].getAttribute('Nombre'),
  }

  // Get company information (receiver)
  const receiverDOM = xmlDoc.getElementsByTagName('cfdi:Receptor')
  const receiver = {
    rfc: receiverDOM[0].getAttribute('Rfc'),
    name: receiverDOM[0].getAttribute('Nombre'),
  }

  // Extract goods general information
  // <cartaporte20:Mercancias PesoBrutoTotal="1.88" UnidadPeso="KGM" NumTotalMercancias="1">
  // HubState: goods = { "totalWeight": 18, "weightUnit": "KGM", "totalGoods": 1 }
  const goodsDOM = xmlDoc.getElementsByTagName('cartaporte20:Mercancias')
  const totalWeight = goodsDOM[0].getAttribute('PesoBrutoTotal')
  const weightUnit = goodsDOM[0].getAttribute('UnidadPeso')
  const totalGoods = goodsDOM[0].getAttribute('NumTotalMercancias')

  const goods = {
    totalWeight: parseFloat(totalWeight),
    weightUnit: weightUnit,
    totalGoods: parseInt(totalGoods, 10),
    good: [],
  }

  // Extract goods array information
  // <cartaporte20:Mercancia *BienesTransp="40101600" *Descripcion="CIRCUITOS INTEGRADOS" *Cantidad="1250" *ClaveUnidad="H87" *Dimensiones="0/0/0cm" *PesoEnKg="1.88" *ValorMercancia="1375" *Moneda="USD">
  //  <cartaporte20:Pedimentos Pedimento="22 64 1626 2006676"/>
  //  <cartaporte20:Pedimentos Pedimento="22 64 1626 2006677"/>
  //  <cartaporte20:CantidadTransporta Cantidad="1250" IDOrigen="OR000001" IDDestino="DE000001"/>
  // </cartaporte20:Mercancia>
  // HubState: good= {
  // 	*"quantity": 10,
  // 	*"currency": "USD",
  // 	*"value": 30.11,
  // 	*"packagingCode": "4G",
  // 	*"packagingDescription": "Cajas de Cartón",
  // 	*"dimensions": {
  //     "unitMeasure": "cm",
  //     "width": 120,
  //     "height": 100,
  //     "depth": 100
  //  },
  // 	"authorizedUsers": [
  // 		"frodriguez@a1alogistics.com",
  // 		"evargas@a1alogistics.com",
  // 		"d.perez@elica.com",
  // 		"aavila@a1alogistics.com",
  // 		"german@taskility.com"
  // 	],
  // 	*"company": {
  // 		"_id": "vkF9Cwrf7EqWkTbde",
  // 		"name": "ELICAMEX SA DE CV",
  // 		"rfc": "ELI060102RK8"
  // 	},
  // 	*"companyId": "vkF9Cwrf7EqWkTbde",
  // 	*"productCode": " GRI0184678-v1",
  // 	*"description": "FILTRO DE AIRE",
  // 	*"satProductCode": "40161505",
  // 	*"satProductCodeDescription": "Filtros de aire",
  // 	*"satProductCodeIsDangerousMaterial": "0",
  // 	*"dangerousMaterial": "No",
  // 	*"satUnitKey": "H87",
  // 	*"tariffCode": "8421399999",
  // 	*"tariffCodeDescription": "Las demás.",
  // 	*"weightInKg": 3,
  // 	*"pedimento": "22  64  1626  2006588"
  // },

  const goodsArrayDOM = xmlDoc.getElementsByTagName('cartaporte20:Mercancia')
  let goodsArrayIndex = 0
  for (goodsArrayIndex; goodsArrayIndex < goodsArrayDOM.length; goodsArrayIndex += 1) {
    const goodDOM = goodsArrayDOM[goodsArrayIndex]

    // Construct the goodItem
    // Add Required Fields
    const goodItem = {
      satProductCode: goodDOM.getAttribute('BienesTransp'),
      // satProductCodeDescription:
      description: goodDOM.getAttribute('Descripcion'),
      // productCode:
      // companyId:
      // company:
      quantity: parseFloat(goodDOM.getAttribute('Cantidad')),
      satUnitKey: goodDOM.getAttribute('ClaveUnidad'),
      weightInKg: parseFloat(goodDOM.getAttribute('PesoEnKg')),
      // Taskility Hub required fileds
      company: company,
      companyId: company._id,
      authorizedUsers: authorizedUsers,
    }

    // Add Optional Fields
    // *ClaveSTCC, *Unidad, *Dimensiones, *MaterialPeligroso, *CveMaterialPeligroso, *Embalaje, *DescripEmbalaje, *ValorMercancia, *Moneda, *FraccionArancelaria, *UUIDComercioExt
    if (goodDOM.getAttribute('ClaveSTCC')) goodItem.stccKey = goodDOM.getAttribute('ClaveSTCC')
    if (goodDOM.getAttribute('Unidad')) goodItem.unit = goodDOM.getAttribute('Unidad')
    if (goodDOM.getAttribute('Dimensiones')) {
      // Trim Dimensions
      const dimensions = goodDOM.getAttribute('Dimensiones')
      const slashIndexes = [...dimensions.matchAll(/\//gi)].map(a => a.index)
      const cmIndex = [...dimensions.matchAll(/cm/gi)].map(a => a.index)
      const plgIndex = [...dimensions.matchAll(/plg/gi)].map(a => a.index)
      const width = dimensions.slice(0, slashIndexes[0])
      const height = dimensions.slice(slashIndexes[0] + 1, slashIndexes[1])
      const depth = dimensions.slice(slashIndexes[1] + 1, cmIndex[0] || plgIndex[0])
      const unit = dimensions.slice(cmIndex[0] || plgIndex[0])
      goodItem.dimensions = {
        width: parseFloat(width),
        height: parseFloat(height),
        depth: parseFloat(depth),
        unitMeasure: unit,
      }
    }
    goodItem.dangerousMaterial = goodDOM.getAttribute('MaterialPeligroso') ? goodDOM.getAttribute('MaterialPeligroso') : 'No'
    goodItem.satProductCodeIsDangerousMaterial = goodDOM.getAttribute('CveMaterialPeligroso')
      ? goodDOM.getAttribute('CveMaterialPeligroso')
      : '0'
    if (goodDOM.getAttribute('Embalaje')) goodItem.packagingCode = goodDOM.getAttribute('Embalaje')
    if (goodDOM.getAttribute('DescripEmbalaje')) goodItem.packagingDescription = goodDOM.getAttribute('DescripEmbalaje')
    if (goodDOM.getAttribute('ValorMercancia')) goodItem.value = parseFloat(goodDOM.getAttribute('ValorMercancia'))
    if (goodDOM.getAttribute('Moneda')) goodItem.currency = goodDOM.getAttribute('Moneda')
    if (goodDOM.getAttribute('FraccionArancelaria')) goodItem.tariffCode = goodDOM.getAttribute('FraccionArancelaria')
    if (goodDOM.getAttribute('UUIDComercioExt')) goodItem.uuidForeignExchange = goodDOM.getAttribute('UUIDComercioExt')

    // Add pedimentos
    // TODO: fix FORM and UI to support multiple Pedimentos and eliminate pedimento from UI
    // Adding pedimento field
    if (goodDOM.getElementsByTagName('cartaporte20:Pedimentos').length > 0) {
      console.log('cartaPorte20:Pedimentos', goodDOM.getElementsByTagName('cartaporte20:Pedimentos'))
      const pedimentosArrayDOM = goodDOM.getElementsByTagName('cartaporte20:Pedimentos')
      goodItem.pedimento = pedimentosArrayDOM[0].getAttribute('Pedimento')
    }
    // Adding pedimentos array
    if (goodDOM.getElementsByTagName('cartaporte20:Pedimentos').length > 0) {
      const pedimentosArrayDOM = goodDOM.getElementsByTagName('cartaporte20:Pedimentos')
      let pedimentosIndex = 0
      const pedimentosArray = []
      for (pedimentosIndex = 0; pedimentosIndex < pedimentosArrayDOM.length; pedimentosIndex += 1) {
        pedimentosArray.push({ pedimento: pedimentosArrayDOM[pedimentosIndex].getAttribute('Pedimento') })
      }
      // Add pedimentosArray to goodItem
      goodItem.pedimentos = pedimentosArray
    }
    // Add Good Item to Good Array in goods object
    goods.good = [...goods.good, goodItem]
  }

  // return goods
  return goods
}

export const extractAutotransportInformationFromXML = async (fileHandle, company, authorizedUsers) => {
  // Check for the existance of the correct information to complete the extraction of Goods from XML
  const errors = []
  if (!fileHandle) return errors.push('Error: No XML information added')
  if (!company) return errors.push('Error: No company information added')
  if (!authorizedUsers) return errors.push('Error: No authorized users information added')

  // Parse XML to extraction
  const fileData = await fileHandle.getFile()
  const text = await fileData.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')

  // Get Vehicle information from xml
    // SAT XML Format
    // <cartaporte20:Autotransporte PermSCT="TPAF01" NumPermisoSCT="2242ALO02062014021001000">
    // <cartaporte20:IdentificacionVehicular ConfigVehicular="C3" PlacaVM="286EY6" AnioModeloVM="2015"/>
    // <cartaporte20:Seguros AseguraRespCivil="A.N.A. Compañía de Seguros, S.A. de C.V." PolizaRespCivil="003965066"/>
    // </cartaporte20:Autotransporte>

    // Taskility Hub Format
    //   [
    //     {
    //       "authorizedUsers": [
    //           "aavila@a1alogistics.com"
    //       ],
    //       "company": {
    //           "_id": "bugL7uZvYvcodAENJ",
    //           "name": "Leanflow Logistics S. de R.L. de C.V.",
    //           "comercialName": "Leanflow Logistics",
    //           "country": "México",
    //           "rfc": "ALO110913N98"
    //       },
    //       "taskilityObjective": "Stamp BoL Income",
    //       "transportType": "01",
    //       "autotransport": {
    //           "vehicle": {
    //               "_id": "61ce6326c0a011153633d8a4",
    //               "companyId": "bugL7uZvYvcodAENJ",
    //               "type": "truck",
    //               "number": "ECO 7777 New",
    //               "plateNumber": "77 GCJ 77",
    //               "modelYear": "2017",
    //               "typeOfVehicleSAT": "C3R2",
    //               "SCTPermit": "TPAF01",
    //               "SCTPermitNumber": "938837736355",
    //               "insurance": {
    //                   "civilResponsibility": {
    //                       "company": "Berkley International Seguros México, S.A. de C.V.",
    //                       "policy": "6765466"
    //                   },
    //                   "environmentalProtection": {
    //                       "company": "Allianz México, S.A., Compañía de Seguros",
    //                       "policy": "112234"
    //                   }
    //               }
    //           },
    //           "trailers": {
    //               "_id": "61ce636cc0a011153633d8a5",
    //               "companyId": "bugL7uZvYvcodAENJ",
    //               "type": "trailer",
    //               "number": "C 7777652 New",
    //               "plateNumber": "77 GCA 77",
    //               "modelYear": "2009",
    //               "typeOfTrailerSAT": "CTR004",
    //               "SCTPermit": "TPAF01",
    //               "SCTPermitNumber": "662526378746",
    //               "insurance": {
    //                   "civilResponsibility": {
    //                       "company": "AXA Seguros, S.A. de C.V.",
    //                       "policy": "66272678"
    //                   },
    //                   "environmentalProtection": {
    //                       "company": "Allianz México, S.A., Compañía de Seguros",
    //                       "policy": "663536627"
    //                   }
    //               }
    //           }
    //       },
    //       "figures": [
    //           {
    //               "figureType": "01",
    //               "driverId": "61ce5233156bb57aab1aaf91",
    //               "rfc": "CAJG7810073H8",
    //               "document": "993894884938",
    //               "name": "Alberto Vázquez",
    //               "satAddress": {
    //                   "street": "San Luis",
    //                   "suburb": {
    //                       "key": "6165d8a265420a8f8302c3f4",
    //                       "satCode": "0090",
    //                       "satDescription": "Raquet Club"
    //                   },
    //                   "municipality": {
    //                       "key": "6165d3cd65420a8f8302838a",
    //                       "satCode": "014",
    //                       "satDescription": "Querétaro"
    //                   },
    //                   "locality": "Santiago de Querétaro",
    //                   "politicalState": {
    //                       "key": "6165d0ae65420a8f830280a9",
    //                       "satCode": "QUE",
    //                       "satDescription": "Querétaro"
    //                   },
    //                   "country": "MEX",
    //                   "postalCode": "76127"
    //               }
    //           }
    //       ]
    //   }
    // ]
  const autotransportsDOM = xmlDoc.getElementsByTagName('cartaporte20:Autotransporte')
  const vehicle = {}
  return null


}
