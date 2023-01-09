import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService } from 'services/model'
import Stripe from 'stripe'

export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  // const stripe = new Stripe('sk_test_z1e5RABSSVdjyg61iTgFzVx900qLdLXJDi', {
  //   apiVersion: '2020-08-27',
  // })
  const stripe = new Stripe('sk_test_z1e5RABSSVdjyg61iTgFzVx900qLdLXJDi', {
    // @ts-ignore
    apiVersion: '2020-08-27',
  })
  const { quantity } = req.body
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: '1SfUPDm3oIOMJK84xXJAd3W68yaFXaVXnl6ZhjwrIZU',
        quantity,
      },
    ],
    mode: 'payment',
    success_url: `${req.headers.origin}?success=true`,
    cancel_url: `${req.headers.origin}?canceled=true`,
  })

  res.status(200).json({ sessionId: session.id })
}

export default composeRoute([methodFilter(), dbConnection, routeHandler], errorHandler, dbConnectionClose)
