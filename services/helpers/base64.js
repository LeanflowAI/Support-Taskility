export const downloadBase64File = (linkSource, fileName) => {
  const downloadLink = document.createElement('a')
  downloadLink.href = linkSource
  downloadLink.download = fileName
  downloadLink.click()
}
