import { LoginPage } from '../components/pages/login'
import { redirectIfLogged } from '../services/auth/checkAuth'


// Render login page on index page
export default LoginPage

export async function getServerSideProps(context) {
  redirectIfLogged(context)
  return { props: { redirected: false } }
}
