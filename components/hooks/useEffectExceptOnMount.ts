import React, { useRef, useEffect, EffectCallback, DependencyList, } from 'react'

// export const useEffectExceptOnMount = (effect, dependencies) => {
//   const mounted = React.useRef(false)
//   React.useEffect(() => {
//     if (mounted.current) {
//       const unmount = effect()
//       return () => unmount && unmount()
//     }
//     mounted.current = true

//     return null
//   }, dependencies)

//   // Reset on unmount for the next mount.
//   React.useEffect(() => {
//     // eslint-disable-next-line no-return-assign
//     const assignment = () => (mounted.current = false)
//     return assignment
//   }, [])
// }

// export const useEffectExceptOnMount = (func, deps) => {
//   const didMount = useRef(false);

//   useEffect(() => {
//       let unmount;
//       if (didMount.current) unmount = func();
//       else didMount.current = true;

//       return () => {
//           didMount.current = false;
//           // eslint-disable-next-line no-unused-expressions
//           unmount && unmount();
//       }
//   }, deps);
// }

/**
 * @param effect 
 * @param dependencies
 *  
 */
 export default function useEffectExceptOnMount(
  effect: EffectCallback,
  dependencies?: DependencyList
) {
  // Preserving the true by default as initial render cycle
  const initialRender = useRef(true);

  useEffect(() => {
    let effectReturns: void | (() => void) = () => {};

    // Updating the ref to false on the first render, causing
    // subsequent render to execute the effect
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      effectReturns = effect();
    }

    // Preserving and allowing the Destructor returned by the effect
    // to execute on component unmount and perform cleanup if
    // required.
    if (effectReturns && typeof effectReturns === 'function') {
      return effectReturns;
    } 
    return undefined;
  }, dependencies);
}

