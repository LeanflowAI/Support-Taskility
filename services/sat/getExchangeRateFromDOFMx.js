// import { encodeTextURL } from '../helpers/text'
const puppeteer = require('puppeteer');

export const getExchangeRateFromDofMx = async (day, month, year) => {
  // const formattedDate = econdeTextURL(date)
  const URL = `https://dof.gob.mx/indicadores_detalle.php?cod_tipo_indicador=158&dfecha=${day}%2F${month}%2F${year}&hfecha=${day}%2F${month}%2F${year}#gsc.tab=0`

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(URL)
  // await page.screenshot({'path': 'dofUSDToMXToday.png'})
  const MXNToUSD = await page.evaluate(() => {
    return document.querySelector('.Celda td:nth-child(2)').innerText;
  });
  // console.log('MXNTOUSD', MXNToUSD);
  await browser.close()
  return MXNToUSD
}

// export default getExchangeRateFromDofMx
