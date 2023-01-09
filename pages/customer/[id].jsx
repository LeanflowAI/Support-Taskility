import { Customer } from '../../components/pages/customers/customer'
import { redirectIfNotLogged } from '../../services/auth/checkAuth'

export default Customer

export async function getServerSideProps(context) {
  // getCustomerData
  // const { id } = context.query
  // console.log('taskility url', process.env.TASKILITY_URL)
  // const data = await fetch(`${process.env.TASKILITY_URL}/api/customers/get-customer-by-id?id=${id}`)
  //   .then(res => res.json())
  //   .catch(error => {
  //     console.error('Error:', error)
  //   })
  // redirectIfNotLogged(context)
  // // TODO: Fetch with redux action and build redux initial state.
  // //  How to load to redux Provider???
  // // TODO: redirect to login on expired token.
  // console.log('serverSidePorps in [id].jsx',{data})
  // if (data) {
  // return { props: { redirected: false, data } }
  // }
  return { props: { redirected: false } }
}
