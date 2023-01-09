import { LoginPage } from '../components/pages/login'
import { redirectIfLogged } from '../services/auth/checkAuth'

export default LoginPage

export async function getServerSideProps(context) {
  redirectIfLogged(context) // TODO: Add user setting for initial page.
  return { props: { redirected: false } }
}
