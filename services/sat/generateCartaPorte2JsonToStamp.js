import { num } from '../helpers/mathHelp'

export const cfdi33Header = (BoLHState, billingState) => {
  const header = {
    Version: '3.3',
    Folio: BoLHState?.folio,
    Fecha: new Date(),
    Currency: billingState?.currency,
    ExchangeRate: billingState?.exchangeRate,
    Total: billingState?.total,
    CfdiType: billingState?.cfdiType,
    ExpeditionPlace: billingState?.expeditionPlace,
    Issuer: {
      Rfc: billingState?.issuer?.rfc,
      FiscalRegime: billingState?.issuer?.fiscalRegime,
      Name: billingState?.issuer?.name,
    },
    Receiver: {
      Rfc: billingState?.receiver?.rfc,
      CfdiUse: billingState?.receiver?.cfdiUse,
      Name: billingState?.receiver?.name,
    },
  }
  if (billingState?.receiver?.foreignFiscalId) header.Receiver.NumRegIdTrib = billingState?.receiver?.foreignFiscalId
  if (billingState?.receiver?.countryOfResidence) header.Receiver.ResidenciaFiscal = billingState?.receiver?.countryOfResidence
  if (billingState?.cfdiType === 'T') {
    return header
  }
  return {
    ...header,
    SubTotal: billingState?.subTotal,
    PaymentForm: billingState?.paymentForm,
    PaymentMethod: billingState?.paymentMethod,
  }
}

export const cfdi33ItemTaxes = item => {
  const taxes = []
  if (item?.haveRetention)
    taxes.push({
      Name: 'IVA',
      Rate: '0.04',
      Total: num(item?.subtotal).times(0.04).val(),
      Base: item?.subtotal,
      IsRetention: 'true',
      IsFederalTax: 'true',
    })
  if (item?.haveTax)
    taxes.push({
      Name: 'IVA',
      Rate: '0.16',
      Total: num(item?.subtotal).times(0.16).val(),
      Base: item?.subtotal,
      IsRetention: 'false',
      IsFederalTax: 'true',
    })
  if (item?.haveRetention || item?.haveTax) return taxes
  return null
}

export const cfdi33Items = billingState => {
  let items = []
  if (billingState?.cfdiType === 'T') {
    items = billingState?.items?.map(item => {
      return {
        ProductCode: item.satProductCode,
        // "NoIdentificacion": "01",
        Quantity: item.quantity,
        UnitCode: item.satUnitCode,
        Unidad: item.satUnitCodeDescription,
        Description: item.description,
        UnitPrice: item.unitPrice,
        Subtotal: item.subtotal,
        Total: item.total,
      }
    })
    return items
  }
  if (billingState?.cfdiType === 'I') {
    items = billingState?.items?.map(item => {
      return {
        Taxes: cfdi33ItemTaxes(item),
        ProductCode: item.satProductCode,
        // "NoIdentificacion": "01",
        Quantity: item.quantity,
        UnitCode: item.satUnitCode,
        Unidad: item.satUnitCodeDescription,
        Description: item.description,
        UnitPrice: item.unitPrice,
        Subtotal: item.subtotal,
        Total: item.total,
      }
    })
    return items
  }
  return null
}

export const cfdi33Taxes = billingState => {
  let retentionTaxTotal = 0
  let taxTotal = 0
  billingState.items.map(item => {
    retentionTaxTotal += num(item?.subtotal).times(0.04).val()
    return null
  })
  billingState.items.map(item => {
    taxTotal += num(item?.subtotal).times(0.16).val()
    return null
  })
  return {
    TotalImpuestosRetenidos: retentionTaxTotal,
    TotalImpuestosTrasladados: taxTotal,
  }
}

export const cartaPorte2GeneralInfo = billOfLading2 => {
  let generalInfo = {}
  if (billOfLading2?.internationalTransport === 'No') {
    generalInfo = {
      TranspInternac: billOfLading2?.internationalTransport,
      // TotalDistRec: billOfLading2?.totalDistance,
    }
  }
  if (billOfLading2?.internationalTransport === 'Sí') {
    generalInfo = {
      TranspInternac: billOfLading2?.internationalTransport,
      EntradaSalidaMerc: billOfLading2?.inOutGoods,
      PaisOrigenDestino: billOfLading2?.countryOfOrigin,
      ViaEntradaSalida: billOfLading2?.wayInOut,
      // TotalDistRec: billOfLading2?.totalDistance,
    }
  }
  return generalInfo
}

export const cartaPorte2Locations = locations => {
  // eslint-disable-next-line no-return-assign
  if (!locations) return { error: 'No locations available', description: 'No locations included in the Bill of Lading' }
  const codedLocations = locations.map((location, index) => {
    let locationId = ''
    const indexPlusOne = index + 1
    if (location?.locationType?.print === 'Origen') {
      locationId = `OR${indexPlusOne.toString().padStart(6, '0')}`
    }
    if (location?.locationType?.print === 'Destino') {
      locationId = `DE${indexPlusOne.toString().padStart(6, '0')}`
    }
    const codedLocation = {
      TipoUbicacion: location?.locationType?.sat,
      IDUbicacion: location?.locationId,
      RFCRemitenteDestinatario: location?.company?.rfc,
      NombreRFC: location?.company?.name,
      FechaHoraSalidaLlegada: location?.departureArrivalDateTime?.sat,
      Domicilio: {
        Calle: location?.place?.satAddress?.street,
        NumeroExterior: location?.place?.satAddress?.exteriorNumber,
        Colonia: location?.place?.satAddress?.suburb?.satCode,
        Localidad: location?.place?.satAddress?.locality?.satCode || '',
        Municipio: location?.place?.satAddress?.municipality?.satCode || '',
        Estado: location?.place?.satAddress?.politicalState?.satCode,
        Pais: location?.place?.satAddress?.country,
        CodigoPostal: location?.place?.satAddress?.postalCode,
      },
    }
    if (location?.place?.satAddress?.interiorNumber) codedLocation.Domicilio.NumeroInterior = location?.place?.satAddress?.interiorNumber
    return codedLocation
  })
  return codedLocations
}

export const cartaPorte2GoodsArray = good => {
  if (!good) return { error: 'No good available', description: 'No good included in the Bill of Lading' }
  const itemsArray = good.map(item => {
    const parsedItem = {
      BienesTransp: item?.satProductCode,
      Descripcion: item?.description,
      Cantidad: item?.quantity,
      ClaveUnidad: item?.satUnitKey,
      Dimensiones: `${item?.dimensions?.depth}/${item?.dimensions?.height}/${item?.dimensions?.width}${item?.dimensions?.unitMeasure}`,
      MaterialPeligroso: item?.dangerousMaterial,
      PesoEnKg: item?.weightInKg,
      ValorMercancia: item?.value,
      Moneda: item?.currency,
    }
    if (item?.tariffCode) parsedItem.FraccionArancelaria = item?.tariffCode
    if (item?.pedimento) parsedItem.Pedimentos = item?.pedimento
    if (item?.dangerousMaterialCode) parsedItem.CveMaterialPeligroso = item?.dangerousMaterialCode
    if (item?.packagingCode) parsedItem.Embalaje = item?.packagingCode
    if (item?.packagingDescription) parsedItem.DescripEmbalaje = item?.packagingDescription
    return parsedItem
  })
  return itemsArray
}

export const cartaPorte2GoodsMain = goods => {
  if (!goods) return { error: 'No goods available', description: 'No goods included in the Bill of Lading' }
  return {
    PesoBrutoTotal: goods?.totalWeight,
    UnidadPeso: goods?.weightUnit,
    NumeroTotalMercancias: goods?.totalGoods,
    Mercancia: cartaPorte2GoodsArray(goods?.good),
  }
}

export const cartaPorte2TrailersArray = trailers => {
  // TO DO: convert trailers from object to array in the BoLHState and in the front end
  // const parsedTrailers = trailers.map(trailer => {
  //   return {
  //     "SubTipoRem": trailer?.typeOfTrailerSat,
  //     "Placa": trailer?.plateNumber,
  //   }
  // })
  // return parsedTrailers

  return {
    SubTipoRem: trailers?.typeOfTrailerSAT,
    Placa: trailers?.plateNumber,
  }
}

export const cartaPorte2GoodsTransport = transport => {
  if (!transport) return { error: 'No transport available', description: 'No transport included in the Bill of Lading' }
  const transportObject = {}
  if (transport?.autotransport) {
    transportObject.Autotransporte = {
      PermSCT: transport?.autotransport.vehicle?.SCTPermit,
      NumPermisoSCT: transport?.autotransport.vehicle?.SCTPermitNumber,
      IdentificacionVehicular: {
        ConfigVehicular: transport?.autotransport.vehicle?.typeOfVehicleSAT,
        PlacaVM: transport?.autotransport.vehicle?.plateNumber,
        AnioModeloVM: transport?.autotransport.vehicle?.modelYear,
      },
      Seguros: {
        AseguraRespCivil: transport?.autotransport?.vehicle?.insurance?.civilResponsibility?.company,
        PolizaRespCivil: transport?.autotransport?.vehicle?.insurance?.civilResponsibility?.policy,
      },
    }
    if (transport?.autotransport?.trailers) {
      // console.log(`trailers`, transport?.autotransport?.trailers)
      transportObject.Autotransporte.Remolques = cartaPorte2TrailersArray(transport?.autotransport?.trailers)
    }
    if (transport?.autotransport?.vehicle?.insurance?.environmentalProtection) {
      transportObject.Autotransporte.Seguros.AseguraMedAmbiente =
        transport?.autotransport?.vehicle?.insurance?.environmentalProtection?.company
      transportObject.Autotransporte.Seguros.PolizaMedAmbiente =
        transport?.autotransport?.vehicle?.insurance?.environmentalProtection?.policy
    }
  }
  return transportObject
}

export const cartaPorte2Figure = figures => {
  if (!figures) return { error: 'No figures available', description: 'No figures included in the Bill of Lading' }
  const figuresArray = figures.map(figure => {
    const figureObject = {
      TipoFigura: figure?.figureType,
      RFCFigura: figure?.rfc,
      NumLicencia: figure?.document,
      NombreFigura: figure?.name,
      Domicilio: {
        Calle: figure?.satAddress?.street,
        NumeroExterior: figure?.satAddress?.externalNumber || '',
        Colonia: figure?.satAddress?.suburb?.satCode,
        Localidad: figure?.satAddress?.locality?.satCode || '',
        Municipio: figure?.satAddress?.municipality?.satCode || '',
        Estado: figure?.satAddress?.politicalState?.satCode,
        Pais: figure?.satAddress?.country,
        CodigoPostal: figure?.satAddress?.postalCode,
      },
    }
    if (figure?.satAddress?.internalNumber) figureObject.Domicilio.NumeroInterior = figure?.satAddress?.internalNumber
    if (figure?.foreignFiscalId) figureObject.NumRegIdTribFigura = figure?.foreignFiscalId
    if (figure?.countryOfResidence) figureObject.ResidenciaFiscalFigura = figure?.countryOfResidence
    return figureObject
  })
  return figuresArray
}

export const generateCartaPorte2ToStamp = BoLHState => {
  // const cfdiHeader = cfdi33Header(BoLHState, billingState)
  // const items = cfdi33Items(billingState)
  // const taxes = cfdi33Taxes(billingState)
  const generalInfo = cartaPorte2GeneralInfo(BoLHState?.billOfLading2)
  const locations = cartaPorte2Locations(BoLHState?.billOfLading2?.locations)
  const goods = cartaPorte2GoodsMain(BoLHState?.billOfLading2?.goods)
  const transport = cartaPorte2GoodsTransport(BoLHState?.billOfLading2?.transports)
  const figura = cartaPorte2Figure(BoLHState?.billOfLading2?.transports?.figures)

  // const jsonToStamp = {
  //   ...cfdiHeader,
  //   Items: items,
  //   Impuestos: taxes,
  //   Complemento: {
  //     CartaPorte20: {
  //       ...generalInfo,
  //       Ubicaciones: locations,
  //       Mercancias: {
  //         ...goods,
  //         ...transport,
  //       },
  //       FiguraTransporte: figura,
  //     },
  //   },
  // }

  const cartaPorte20 = {
    CartaPorte20: {
      ...generalInfo,
      Ubicaciones: locations,
      Mercancias: {
        ...goods,
        ...transport,
      },
      FiguraTransporte: figura,
    },
  }

  return cartaPorte20
}

const jsonFromHub2 = {
  Version: '3.3',
  Folio: 'TSKY|BoLH-000022',
  Fecha: '2022-01-15T02:47:22.018Z',
  Moneda: 'MXN',
  TipoCambio: 1,
  Total: 1.12,
  CfdiType: 'I',
  ExpeditionPlace: '78000',
  Issuer: {
    Rfc: 'ALO110913N98',
    FiscalRegime: '601',
    Name: 'A1A Logistics S de RL de CV',
  },
  Receiver: {
    Rfc: 'SME751021B90',
    CfdiUse: 'G03',
    Name: 'FREUDENBERG-NOK SEALING TECHNOLOGIES DE MEXICO SA DE CV',
  },
  SubTotal: 1,
  PaymentForm: '99',
  PaymentMethod: 'PPD',
  Items: [
    {
      Taxes: [
        {
          Name: 'IVA',
          Rate: '0.04',
          Total: 0.04,
          Base: 1,
          IsRetention: 'true',
          IsFederalTax: 'true',
        },
        {
          Name: 'IVA',
          Rate: '0.16',
          Total: 0.16,
          Base: 1,
          IsRetention: 'false',
          IsFederalTax: 'true',
        },
      ],
      ProductCode: '78101802',
      Quantity: 1,
      UnitCode: 'E48',
      Unidad: 'SERVICIO',
      Description: 'Flete',
      UnitPrice: 1,
      Subtotal: 1,
      Total: 1.12,
    },
  ],
  Impuestos: {
    TotalImpuestosRetenidos: 0.04,
    TotalImpuestosTrasladados: 0.16,
  },
  Complemento: {
    CartaPorte20: {
      Ubicaciones: [
        {
          TipoUbicacion: 'Origen',
          RFCRemitenteDestinatario: 'TTM990603E21',
          NombreRFC: 'TOYOTA TSUSHO MEXICO, S.A. DE C.V',
          FechaHoraSalidaLlegada: '2022-01-11T17:35:05',
          Domicilio: {
            Calle: 'Avenida Vía Rápida Poniente',
            NumeroExterior: '15155',
            Colonia: '0689',
            Localidad: '04',
            Municipio: '004',
            Estado: 'BCN',
            Pais: 'MEX',
            CodigoPostal: '22010',
          },
        },
        {
          TipoUbicacion: 'Destino',
          RFCRemitenteDestinatario: 'TTM990603E21',
          NombreRFC: 'TOYOTA TSUSHO MEXICO, S.A. DE C.V',
          FechaHoraSalidaLlegada: '2022-01-22T17:38:58',
          Domicilio: {
            Calle: 'Querétaro - Celaya',
            NumeroExterior: 'KM 45',
            Colonia: '2595',
            Localidad: '28',
            Municipio: '005',
            Estado: 'GUA',
            Pais: 'MEX',
            CodigoPostal: '38160',
          },
        },
      ],
      Mercancias: {
        PesoBrutoTotal: 128,
        UnidadPeso: 'KGM',
        NumeroTotalMercancias: 1,
        Mercancia: [
          {
            BienesTransp: '88473849',
            Descripcion: 'Sellos de Goma Nuevos',
            Cantidad: 1,
            ClaveUnidad: 'E48',
            Dimensiones: '93/65/140cm',
            MaterialPeligroso: 'Sí',
            PesoEnKg: 128,
            ValorMercancia: 2800,
            Moneda: 'USD',
            FraccionArancelaria: '7738273',
            CveMaterialPeligroso: '77382883928',
            Embalaje: '4C2',
            DescripEmbalaje: 'Cajas de Madera natural de paredes a prueba de polvos (estancas a los pulverulentos)',
          },
        ],
        Autotransporte: {
          PermSCT: 'TPAF01',
          NumPermisoSCT: '938837736355',
          IdentificacionVehicular: {
            ConfigVehicular: 'C3R2',
            PlacaVM: '77 GCJ 77',
            AnioModeloVM: '2017',
          },
          Seguros: {
            AseguraRespCivil: 'Berkley International Seguros México, S.A. de C.V.',
            PolizaRespCivil: '6765466',
            AseguraMedAmbiente: 'Allianz México, S.A., Compañía de Seguros',
            PolizaMedAmbiente: '112234',
          },
          Remolques: {
            SubTipoRem: 'CTR004',
            Placa: '77 GCA 77',
          },
        },
      },
      FiguraTransporte: [
        {
          TipoFigura: '01',
          RFCFigura: 'CAJG7810073H8',
          NumLicencia: '993894884938',
          NombreFigura: 'Alberto Vázquez',
          Domicilio: {
            Calle: 'San Luis',
            NumeroExterior: '',
            Colonia: '0090',
            Localidad: '',
            Municipio: '014',
            Estado: 'QUE',
            Pais: 'MEX',
            CodigoPostal: '76127',
          },
        },
      ],
    },
  },
}
