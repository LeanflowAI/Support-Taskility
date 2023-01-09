import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { defaultTheme } from '../themes'

const defaultIconSize = 32

const Hamburguer = ({ stroke, fill = 'none' }) => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1.5H32" stroke={stroke} strokeLinecap="round" />
    <path d="M8 10.5H32" stroke={stroke} strokeLinecap="round" />
    <path d="M1 19.5H32" stroke={stroke} strokeLinecap="round" />
  </svg>
)

const Close = ({ stroke, fill = 'none', scale = 1 }) => (
  <svg width={26 * scale} height={26 * scale} viewBox={`0 0 ${26 * scale} ${26 * scale}`} fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d={`M2 0L${26 * scale} ${26 * scale}`} stroke={stroke} strokeLinecap="round" />
    <path d={`M2 ${26 * scale}L${26 * scale} 0`} stroke={stroke} strokeLinecap="round" />
  </svg>
)

const Bell = ({ stroke, fill = 'none' }) => (
  <svg width="23" height="27" viewBox="0 0 23 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path" maskUnits="userSpaceOnUse" x="0" y="0" width="23" height="27" fill="black">
      <rect fill="white" width="23" height="27" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        // eslint-disable-next-line max-len
        d="M21.2781 20.24C21.0529 20.025 19.224 18.096 19.224 12.0088C19.1811 9.92788 18.4353 7.92741 17.115 6.35168C16.4065 5.47918 15.5292 4.76825 14.5392 4.26418C14.5437 4.21337 14.5437 4.16225 14.5392 4.11144C14.5392 2.39304 13.1868 1 11.5186 1C9.85029 1 8.49789 2.39304 8.49789 4.11144C8.49343 4.16225 8.49343 4.21337 8.49789 4.26418C7.50788 4.76825 6.63065 5.47918 5.92208 6.35168C4.60181 7.92741 3.85604 9.92788 3.8131 12.0088C3.8131 18.0846 1.98971 20.0081 1.76453 20.2231C1.14663 20.6038 0.85917 21.3685 1.06703 22.0786C1.28633 22.8225 1.96015 23.3245 2.71467 23.3062H8.08598C7.78329 23.6321 7.78329 24.1457 8.08598 24.4716C8.97199 25.4088 10.1881 25.9375 11.4581 25.9375C12.7282 25.9375 13.9443 25.4088 14.8303 24.4716C15.1126 24.1505 15.1126 23.6613 14.8303 23.3401H20.273C21.0275 23.3584 21.7014 22.8564 21.9207 22.1125C22.1453 21.4105 21.8811 20.6407 21.2781 20.24Z"
      />
    </mask>
    <path
      // eslint-disable-next-line max-len
      d="M19.224 12.0088H20.224C20.224 12.002 20.224 11.9951 20.2238 11.9882L19.224 12.0088ZM17.115 6.35168L16.3388 6.98209C16.342 6.98606 16.3453 6.99 16.3485 6.99391L17.115 6.35168ZM14.5392 4.26418L13.5431 4.17679C13.5074 4.58307 13.7221 4.97028 14.0855 5.15533L14.5392 4.26418ZM14.5392 4.11144H13.5392C13.5392 4.14061 13.5405 4.16977 13.5431 4.19884L14.5392 4.11144ZM8.49789 4.11144L9.49406 4.19884C9.49661 4.16977 9.49789 4.14061 9.49789 4.11144H8.49789ZM8.49789 4.26418L8.95161 5.15533C9.31505 4.97028 9.5297 4.58307 9.49406 4.17679L8.49789 4.26418ZM5.92208 6.35168L6.68858 6.99391C6.69186 6.99 6.69511 6.98606 6.69833 6.98209L5.92208 6.35168ZM3.8131 12.0088L2.81331 11.9882C2.81317 11.9951 2.8131 12.002 2.8131 12.0088H3.8131ZM1.76453 20.2231L2.28912 21.0744C2.34877 21.0377 2.40438 20.9947 2.45506 20.9464L1.76453 20.2231ZM1.06703 22.0786L0.107301 22.3595L0.107845 22.3614L1.06703 22.0786ZM2.71467 23.3062V22.3062C2.70659 22.3062 2.6985 22.3063 2.69042 22.3065L2.71467 23.3062ZM8.08598 23.3062L8.8187 23.9867C9.08938 23.6953 9.1616 23.2711 9.00263 22.9065C8.84366 22.5419 8.48373 22.3062 8.08598 22.3062V23.3062ZM8.08598 24.4716L7.35322 25.1521L7.35928 25.1585L8.08598 24.4716ZM14.8303 24.4716L15.557 25.1585C15.5653 25.1498 15.5735 25.1408 15.5814 25.1317L14.8303 24.4716ZM14.8303 23.3401V22.3401C14.4375 22.3401 14.0811 22.5701 13.9192 22.9279C13.7573 23.2858 13.8199 23.7053 14.0792 24.0003L14.8303 23.3401ZM20.273 23.3401L20.2973 22.3404C20.2892 22.3402 20.2811 22.3401 20.273 22.3401V23.3401ZM21.9207 22.1125L20.9682 21.8078C20.9659 21.8151 20.9636 21.8224 20.9615 21.8298L21.9207 22.1125ZM21.9686 19.5167C21.9645 19.5128 21.5336 19.1022 21.1007 17.9695C20.6663 16.8327 20.224 14.9528 20.224 12.0088H18.224C18.224 18.3097 20.1255 20.5222 20.5876 20.9633L21.9686 19.5167ZM20.2238 11.9882C20.1762 9.68262 19.3501 7.46212 17.8816 5.70944L16.3485 6.99391C17.5205 8.3927 18.1859 10.1731 18.2242 12.0295L20.2238 11.9882ZM17.8913 5.72126C17.0957 4.74158 16.109 3.94129 14.993 3.37304L14.0855 5.15533C14.9495 5.59521 15.7173 6.21677 16.3388 6.98209L17.8913 5.72126ZM15.5354 4.35158C15.545 4.24262 15.545 4.13301 15.5354 4.02405L13.5431 4.19884C13.5424 4.1915 13.5424 4.18413 13.5431 4.17679L15.5354 4.35158ZM15.5392 4.11144C15.5392 1.86887 13.7668 0 11.5186 0V2C12.6068 2 13.5392 2.91721 13.5392 4.11144H15.5392ZM11.5186 0C9.2703 0 7.49789 1.86887 7.49789 4.11144H9.49789C9.49789 2.91721 10.4303 2 11.5186 2V0ZM7.50171 4.02405C7.49215 4.13301 7.49215 4.24262 7.50171 4.35158L9.49406 4.17679C9.4947 4.18413 9.4947 4.1915 9.49406 4.19884L7.50171 4.02405ZM8.04416 3.37304C6.92811 3.94129 5.94144 4.74158 5.14582 5.72126L6.69833 6.98209C7.31987 6.21677 8.08766 5.59521 8.95161 5.15533L8.04416 3.37304ZM5.15557 5.70944C3.68705 7.46212 2.86089 9.68262 2.81331 11.9882L4.81288 12.0295C4.85119 10.1731 5.51658 8.3927 6.68858 6.99391L5.15557 5.70944ZM2.8131 12.0088C2.8131 14.9473 2.37219 16.823 1.93907 17.957C1.50754 19.0868 1.07809 19.4958 1.074 19.4997L2.45506 20.9464C2.91735 20.505 4.8131 18.2981 4.8131 12.0088H2.8131ZM1.23994 19.3717C0.228082 19.9952 -0.223646 21.229 0.107303 22.3595L2.02676 21.7977C1.94199 21.5081 2.06518 21.2124 2.28912 21.0744L1.23994 19.3717ZM0.107845 22.3614C0.450089 23.5223 1.5148 24.3356 2.73892 24.3059L2.69042 22.3065C2.40551 22.3134 2.12257 22.1227 2.02621 21.7958L0.107845 22.3614ZM2.71467 24.3062H8.08598V22.3062H2.71467V24.3062ZM7.35325 22.6257C6.6942 23.3353 6.6942 24.4425 7.35325 25.1521L8.8187 23.7911C8.84824 23.8229 8.85897 23.86 8.85897 23.8889C8.85897 23.9178 8.84824 23.9549 8.8187 23.9867L7.35325 22.6257ZM7.35928 25.1585C8.43087 26.2921 9.90835 26.9375 11.4581 26.9375V24.9375C10.4679 24.9375 9.51312 24.5256 8.81267 23.7846L7.35928 25.1585ZM11.4581 26.9375C13.0079 26.9375 14.4854 26.2921 15.557 25.1585L14.1036 23.7846C13.4032 24.5256 12.4484 24.9375 11.4581 24.9375V26.9375ZM15.5814 25.1317C16.1955 24.4331 16.1955 23.3787 15.5814 22.68L14.0792 24.0003C14.052 23.9694 14.042 23.9341 14.042 23.9059C14.042 23.8777 14.052 23.8423 14.0792 23.8114L15.5814 25.1317ZM14.8303 24.3401H20.273V22.3401H14.8303V24.3401ZM20.2488 24.3399C21.4729 24.3695 22.5376 23.5562 22.8798 22.3953L20.9615 21.8298C20.8651 22.1566 20.5822 22.3474 20.2973 22.3404L20.2488 24.3399ZM22.8731 22.4173C23.2305 21.3002 22.8163 20.0615 21.8315 19.4071L20.7246 21.0729C20.946 21.22 21.0601 21.5207 20.9682 21.8078L22.8731 22.4173Z"
      fill={stroke}
      mask="url(#path)"
    />
    <line x1="2" y1="19.5" x2="21" y2="19.5" stroke={stroke} />
  </svg>
)

const Share = ({ stroke, fill = 'none' }) => (
  <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      // eslint-disable-next-line max-len
      d="M8.33333 10H2C1.44772 10 1 10.4477 1 11V26C1 26.5523 1.44772 27 2 27H22C22.5523 27 23 26.5523 23 26V11C23 10.4477 22.5523 10 22 10H14.75"
      stroke={stroke}
    />
    <path d="M12 1.62549L12 16.6245" stroke={stroke} />
    <path d="M5.99998 6.87551L12 0.875488L18 6.87551" stroke={stroke} />
  </svg>
)

const Save = ({ stroke, fill = 'none' }) => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 14V23C1 23.5523 1.44772 24 2 24H22C22.5523 24 23 23.5523 23 23V14" stroke={stroke} />
    <path d="M12 15.8745L12 0.875477" stroke={stroke} />
    <path d="M18 10.6245L12 16.6245L5.99998 10.6245" stroke={stroke} />
  </svg>
)

const VerticalThreeDots = ({ stroke, fill = 'none' }) => (
  <svg width="6" height="31" viewBox="0 0 6 31" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <circle cx="3" cy="3" r="3" fill={stroke} />
    <circle cx="3" cy="16" r="3" fill={stroke} />
    <circle cx="3" cy="28" r="3" fill={stroke} />
  </svg>
)
const ArrowDown = ({ stroke, fill = 'none' }) => (
  <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 10.5L11.5 21L1 10.5" stroke={stroke} />
  </svg>
)
const TextSizeToggle = ({ stroke, fill = 'none' }) => (
  <svg width="19" height="11" viewBox="0 0 19 11" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      // eslint-disable-next-line max-len
      d="M8.5957 11L7.35156 7.82129H3.3457L2.11523 11H0.939453L4.89062 0.964844H5.86816L9.79883 11H8.5957ZM6.98926 6.77539L5.82715 3.67871C5.67676 3.28678 5.52181 2.80599 5.3623 2.23633C5.26204 2.67383 5.11849 3.15462 4.93164 3.67871L3.75586 6.77539H6.98926ZM18.3096 11L17.4277 7.37695H15.001L14.1328 11H13.4355L15.8418 1.00586H16.5322L18.9932 11H18.3096ZM17.2705 6.7002L16.3887 2.97461C16.2975 2.55534 16.2269 2.15885 16.1768 1.78516C16.1357 2.18164 16.0719 2.57812 15.9854 2.97461L15.1309 6.7002H17.2705Z"
      fill={stroke}
    />
  </svg>
)

const TableRowSizeBig = ({ stroke, fill = 'none' }) => (
  <svg width="19" height="20" viewBox="0 0 19 20" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M1.32233 9.82227H18.3595" stroke={stroke} strokeLinecap="round" />
    <path d="M1.32233 0.867188H18.3595" stroke={stroke} strokeLinecap="round" />
    <path d="M1.32233 18.8672H18.3595" stroke={stroke} strokeLinecap="round" />
  </svg>
)
const TableRowSizeMedium = ({ stroke, fill = 'none' }) => (
  <svg width="19" height="20" viewBox="0 0 19 20" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M1.36628 12.8223H18.4035" stroke={stroke} strokeLinecap="round" />
    <path d="M1.36628 6.86719H18.4035" stroke={stroke} strokeLinecap="round" />
    <path d="M1.36628 0.867188H18.4035" stroke={stroke} strokeLinecap="round" />
    <path d="M1.36628 18.8672H18.4035" stroke={stroke} strokeLinecap="round" />
  </svg>
)
const TableRowSizeSmall = ({ stroke, fill = 'none' }) => (
  <svg width="19" height="20" viewBox="0 0 19 20" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M1.41169 14.8672H18.4489" stroke={stroke} strokeLinecap="round" />
    <path d="M1.41169 9.86719H18.4489" stroke={stroke} strokeLinecap="round" />
    <path d="M1.41169 4.86719H18.4489" stroke={stroke} strokeLinecap="round" />
    <path d="M1.41169 0.867188H18.4489" stroke={stroke} strokeLinecap="round" />
    <path d="M1.41169 18.8672H18.4489" stroke={stroke} strokeLinecap="round" />
  </svg>
)

const icons = {
  hamburguerMenu: Hamburguer,
  close: Close,
  bell: Bell,
  share: Share,
  save: Save,
  'more-options': VerticalThreeDots,
  down: ArrowDown,
  'text-size': TextSizeToggle,
  'table-row-big': TableRowSizeBig,
  'table-row-medium': TableRowSizeMedium,
  'table-row-small': TableRowSizeSmall,
}

const iconSize = ({ size }) => `${size}px`

const StyledIcon = styled.div`
  width: ${iconSize};
  height: ${iconSize};
  min-width: ${iconSize};
  max-width: ${iconSize};
  min-height: ${iconSize};
  max-height: ${iconSize};
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background-color: transparent;
  margin: 0 4px;
  padding: 0;
  &:focus {
    outline: none;
  }
  &:hover {
    opacity: 0.8;
    transition: opacity 100ms;
    /* TODO: Icons hover color. Implement and fix UserNotification close button */
  }
`

const IconVisibilityToggle = styled.div`
  display: flex; /* Center icon vertically */
  opacity: 0;
  position: absolute;
  transform: rotateZ(180deg);
  &.visible {
    transform: rotateZ(0deg);
    opacity: 1;
    transition: opacity 200ms, transform 200ms;
  }
`

export const Icon = ({ icon, altIcon, visibleIcon, color, size, onClick }) => {
  const MainIconComponent = icons[icon]
  const AltIconComponent = icons[altIcon]
  const stroke = color === 'inverse' ? defaultTheme.colors.empty : defaultTheme.colors.primary
  const scale = size / defaultIconSize

  return (
    <StyledIcon size={size} onClick={onClick}>
      {MainIconComponent && (
        <IconVisibilityToggle className={visibleIcon === 'main' ? 'visible' : ''}>
          <MainIconComponent stroke={stroke} scale={scale} />
        </IconVisibilityToggle>
      )}
      {AltIconComponent && (
        <IconVisibilityToggle className={visibleIcon === 'alt' ? 'visible' : ''}>
          <AltIconComponent stroke={stroke} scale={scale} />
        </IconVisibilityToggle>
      )}
    </StyledIcon>
  )
}

Icon.propTypes = {
  icon: PropTypes.oneOf(Object.keys(icons)).isRequired,
  altIcon: PropTypes.oneOf([...Object.keys(icons), '']),
  visibleIcon: PropTypes.oneOf(['main', 'alt']),
  color: PropTypes.oneOf(['default', 'inverse']),
  size: PropTypes.number,
}

Icon.defaultProps = {
  altIcon: '',
  visibleIcon: 'main',
  color: 'default',
  size: defaultIconSize,
}
