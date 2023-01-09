import { NewCfdiPage } from '../components/pages/new-cfdi'
import { redirectIfNotLogged } from '../services/auth/checkAuth'

export default NewCfdiPage

export async function getServerSideProps(context) {
  redirectIfNotLogged(context)
  return { props: { redirected: false } }
}
