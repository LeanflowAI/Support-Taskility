import { BillOfLadingPage } from '../components/pages/billOfLading'
import { redirectIfNotLogged } from '../services/auth/checkAuth'

export default BillOfLadingPage

export async function getServerSideProps(context) {
  redirectIfNotLogged(context)
  // TODO: Fetch with redux action and build redux initial state.
  //  How to load to redux Provider???
  // TODO: redirect to login on expired token.
  return { props: { redirected: false } }
}