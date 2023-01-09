import nextCookie from 'next-cookies'
import Router from 'next/router'

const userIsLogged = ctx => {
  // If there's no token it means the user is not logged in.
  const { token } = nextCookie(ctx)
  return Boolean(token)
}

export const isServerRequest = ctx => Boolean(ctx.req)

export const redirect = (ctx, url) => {
  if (isServerRequest(ctx)) {
    const { res } = ctx
    res.writeHead(302, { Location: url }).end()
    res.end()
  } else {
    Router.push(url)
  }
}

export const redirectIfNotLogged = (ctx, url = '/login') => {
  const logged = userIsLogged(ctx)

  if (!logged) {
    redirect(ctx, url)
  }
}

// TODO: Save/Retrieve default page ('/billing') from user's profile.
// Default page must be a page that requires user to be logged in.
export const redirectIfLogged = (ctx, url = '/bill-of-lading') => {
  const logged = userIsLogged(ctx)
  if (logged) {
    redirect(ctx, url)
  }
}
