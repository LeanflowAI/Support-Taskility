export const filterUsersByViewPermission = (usersArray, section) => {
  const authorizedUsers = usersArray?.filter(user => user?.viewPermissions?.includes(section) || user?.hubManager)
  const authorizedUsersModified = authorizedUsers?.map(user => ({ ...user, authorized: true }))
  return authorizedUsersModified
}

export const filterUsersByViewPermissionOnlyMail = (usersArray, section) => {
  const authorizedUsers = usersArray?.filter(user => user?.viewPermissions?.includes(section) || user?.hubManager)
  const authorizedUsersModified = authorizedUsers?.map(user => user.email)
  return authorizedUsersModified
}

export const filterUsersByWritePermission = (usersArray, section) => {
  const authorizedUsers = usersArray?.filter(user => user?.writePermissions?.includes(section) || user?.hubManager)
  const authorizedUsersModified = authorizedUsers?.map(user => ({ ...user, authorized: true }))
  return authorizedUsersModified
}
