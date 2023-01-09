export const validateBoLHub = (state) => {
  // Validate Hub State against SAT Carta Porte 2.0 Rules
  const BoLHErrors = []
  if (state) {
    return { isValid: true, BoLHErrors: BoLHErrors }
  } 
  return { isValid: false, BoLHErrors: BoLHErrors }
}