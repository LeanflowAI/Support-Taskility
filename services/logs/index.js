import winston from 'winston'

// TODO: LOG HAPPY PATHS (logEvents) AND ALSO LOG ERRORS
export const logEvents = {
  userLogin: ({ userName }) => `User logged in - ${userName}`,
  userLogout: ({ userName }) => `User logged out ${userName}`,
  userSignUp: ({ userName }) => `New user account ${userName}`,
  emailVerified: ({ userName }) => `New verified user account ${userName}`,
  missingI18nKey: ({ key, locale }) => `Missing i18n key '${key}' in locale '${locale}'`,
}

// Log levels
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
export const log = (level, message) => {
  if (typeof window === 'undefined') {
    const logger = winston.createLogger({ transports: [new winston.transports.Console()] })
    logger.log(level, message)
  } else {
    // eslint-disable-next-line no-console
    // console.log(level, message)
  }
}
