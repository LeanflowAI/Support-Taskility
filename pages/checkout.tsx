import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe('pk_test_8dV1I6xm0BOgDXiLPR0n5uOw00LSAgiatq')

export default function Checkout() {
  const handleClick = async () => {
    // Call your bakend to create the Checkoyt session.
    const { sessionId } = await fetch('/api/checkout/session', {
      method: 'POST',
      headers: { 'content-type': 'aplication/json' },
      body: JSON.stringify({ quantity: 1 }),
    }).then(res => res.json())
    // When the customer clicks on the button, redirect them to Checkout.
    const stripe = await stripePromise
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })
      // console.log(error)
    }
  }
  return (
    <div>
      <h1>Checkout</h1>
      {/* eslint-disable-next-line react/button-has-type */}
      <button role="link" onClick={handleClick}>
        Checkout
      </button>
    </div>
  )
}

export async function getServerSideProps() {
  // redirectIfNotLogged(context)
  // TODO: Fetch with redux action and build redux initial state.
  //  How to load to redux Provider???
  // TODO: redirect to login on expired token.
  return { props: { redirected: false } }
}
