import { useRouter } from 'next/router'
import useSWR from 'swr'
import {
  Layout,
  Space,
  Button,
  Dropdown,
  Menu,
  Avatar,
  Empty,
  PageHeader,
  Card,
  Row,
  Col,
  Carousel,
  Statistic,
  Result,
  Tooltip,
  Comment,
  Divider,
  Radio,
  List,
  Spin,
  notification,
  DatePicker,
  Modal,
  Badge,
  Select,
  Form,
  Input,
  Checkbox,
  InputNumber,
} from 'antd'
import { post } from '../../services/fetch'

const UserList = () => {
  const listUrl = `/api/users/list`
  const { data, error } = useSWR(listUrl, url => post(url, {}))
  if (error) return <div>{error}</div>
  if (!data) return <div>No data</div>
  if (data.error) return <div>{data.error}</div>
  if (data.users.length === 0) return <div>Empty state</div>

  return (
    <Row gutter={[16, 16]} className="pt-4 justify-center">
      {data.users.map(user => (
        <ul>
          <li key={user._id}>{user.username}</li>
        </ul>
      ))}
    </Row>
  )
}

export default function experimentId() {
  const router = useRouter()
  // console.log(router.query)
  const { experiment, id } = router.query
  return (
    <div>
      <h1>Experiment / id </h1>
      <p>experiment: {experiment}</p>
      <p>id: {id}</p>
      <UserList />
    </div>
  )
}
