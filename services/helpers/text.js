export const encodeTextURL = text => {
  const nomalizedString = text.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  // str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  // str.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  // console.log(text, nomalizedString, encodeURI(nomalizedString))
  return encodeURI(nomalizedString)
}
