export const formatFileSizeKb = (sizeInKb) => {
  if (sizeInKb > 999 ) {
    const sizeInMb = sizeInKb/1024
    return `${sizeInMb.toFixed(1)} MB`
  }
  if (sizeInKb > 999999) {
    const sizeInGb = sizeInKb/(1024*1024)
    return `${sizeInGb.toFixed(1)} MB`
  }
  if (sizeInKb > 999999999) {
    const sizeInTb = sizeInKb/(1024*1024*1024)
    return `${sizeInTb.toFixed(1)} MB`
  }
  return `${sizeInKb} KB`
}