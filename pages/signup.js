import { SignUpPage } from '../components/pages/signup'
import { redirectIfLogged } from '../services/auth/checkAuth'

export default SignUpPage

export async function getServerSideProps(context) {
  redirectIfLogged(context)
  return { props: { redirected: false } }
}
