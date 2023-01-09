import React from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'
import { SlideMenu, SlideMenuItem } from '../../ui-elements/slide-menu'
import { Text } from '../../ui-elements/text'
import { Link } from '../../ui-elements/link'
import { logout } from '../../../state/actions/index.ts'

const InnerItem = ({onClick, text}) => (
  <SlideMenuItem onClick={onClick}>
    <Text color="inverse" size="big">
      {text}
    </Text>
  </SlideMenuItem>
)

const MainMenuTextItem = ({ text, href = '/', onClick }) => {
  

  return onClick ? (
    <InnerItem onClick={onClick} text={text} />
  ) : (
    <Link href={href}>
      <InnerItem />
    </Link>
  )
}

export const AppMainMenu = ({ visible }) => {
  const dispatch = useDispatch()
  return (
    <SlideMenu visible={visible}>
      {/* <UserNameAvatar /> */}
      <MainMenuTextItem href="/" text="Inicio" />
      <MainMenuTextItem href="/" text="Embarques" />
      <MainMenuTextItem href="/" text="Finanzas" />
      <MainMenuTextItem href="/" text="Proveedores" />
      <MainMenuTextItem href="/" text="Clientes" />
      <MainMenuTextItem href="/" text="Reportes" />
      <MainMenuTextItem href="/" text="Mis empresas" />
      <MainMenuTextItem href="/" text="Conductores" />
      <MainMenuTextItem href="/" text="Vehículos" />
      <MainMenuTextItem href="/" text="Usuarios" />
      <MainMenuTextItem href="/" text="Configuración" />
      <MainMenuTextItem href="/" text="Soporte" />
      <MainMenuTextItem onClick={() => dispatch(logout())} text="Cerrar sesión" />
    </SlideMenu>
  )
}

AppMainMenu.propTypes = {
  visible: PropTypes.bool,
}

AppMainMenu.defaultProps = {
  visible: false,
}
