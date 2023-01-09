function runMiddleware(req, res, middlewareFn) {
  return new Promise((resolve, reject) => {
    middlewareFn(req, res, result => {
      if (result instanceof Error) {
        reject(result)
      }
      resolve(result)
    })
  })
}

const runHandlersList = async (handlers, ...handlerParams) => {
  const [first, ...rest] = typeof handlers === 'function' ? [handlers] : handlers
  if (first) {
    await runMiddleware(...handlerParams, first)
    await runHandlersList(rest, ...handlerParams)
  }
}

export const composeRoute = (handlers, errorHandlers, endHandlers) => async (req, res) => {
  try {
    await runHandlersList(handlers, req, res)
  } catch (error) {
    await runHandlersList(errorHandlers, error, res)
  }
  await runHandlersList(endHandlers, req, res)
}
