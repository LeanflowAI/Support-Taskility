import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler, checkUserToken, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

// SEARCH RESULTS SCHEMA EXAMPLE
// const searchResults = [
//   {
//     category: 'Clients',
//     items: [
//       { id: 'A', href: '/client/A', description: 'Cliente A', details: '' },
//       { id: 'B', href: '/client/B', description: 'Cliente B', details: '' },
//     ],
//   },
// ]

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'getCfdi.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; loggedUser: User }

export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { dbService, query } = req
  const { searchText } = query

  // i18nInit({ user: loggedUser, requestedLanguage: 'en' })
  const cfdis = await dbService.findCfdis(searchText as string)
  const searchResults = []
  if (cfdis.length)
    searchResults.push({
      category: 'Invoices',
      categoryUrl: '/billing',
      items: cfdis.map(({ _id, cfdiType, folio, total, shortCurrency }) => ({
        id: _id,
        href: `/cfdi/${_id}`,
        // description: i18n(`cfdiType.${cfdiType} ${folio}`), // TODO: Check how to wait for polyglot to start. Also translate category
        description: `${cfdiType} ${folio}`,
        details: `$${total} ${shortCurrency}`,
      })),
    })

  res.json({ ok: true, searchText, searchResults })
  return next()
}

export default composeRoute([methodFilter(), checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)
