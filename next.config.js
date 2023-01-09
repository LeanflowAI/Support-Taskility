
// eslint-disable-next-line import/no-extraneous-dependencies
// import { LoaderOptionsPlugin } from 'webpack'

// Run 'npm run bundle-analyzer' to see the results
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === true }) // 'true'

// export default withBundleAnalyzer({
//   async headers() {
//     return [
//       {
//         // matching all API routes
//         source: '/api/:path*',
//         headers: [
//           { key: 'Access-Control-Allow-Credentials', value: 'true' },
//           { key: 'Access-Control-Allow-Origin', value: '*' },
//           { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
//           {
//             key: 'Access-Control-Allow-Headers',
//             value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
//           },
//         ],
//       },
//     ]
//   },
//   reactStrictMode: false,
//   crossOrigin: 'anonymous',
//   target: 'serverless',
//   webpack5: true,
//   webpack(config, { isServer, webpack }) {
//     module.exports = {
//       // module: {
//       //   rules: [
//       //     {
//       //       test: /canvas.node$/,
//       //       use: 'node-loader',
//       //     },
//       //   ],
//       // },
//       // target: 'node',
//       // node: {
//       //   __dirname: false,
//       // },
//       // module: {
//       //   rules: [
//       //     {
//       //       test: /\.node$/,
//       //       loader: 'node-loader',
//       //       options: {
//       //         name: "[path][name].[ext]",
//       //       },
//       //     },
          
//       //   ],
//       // },
//     }
//     if (isServer) {
//       // exclude client only packages.
//       // config.plugins.push(new webpack.IgnorePlugin(/encoding|mongodb-client-encryption/))
//       config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /encoding|mongodb-client-encryption/ }))
//       // eslint-disable-next-line no-param-reassign
//       config.resolve.alias.canvas = false
//       // // eslint-disable-next-line no-param-reassign
//       // config.resolve.alias.encoding = false
//       // config.module.rules.push({
//       //   test: /\.node$/,
//       //   use: 'node-loader',
//       // })
//     } else {
//       // don't bundle server modules to the client
//       // config.plugins.push(new webpack.IgnorePlugin(/bcryptjs|jsonwebtoken|mongodb/))
//       config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /bcryptjs|jsonwebtoken|mongodb/ }))
//       // exclude test files
//       // config.plugins.push(new webpack.IgnorePlugin(/pages.*\/test.*/))
//       config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /pages.*\/test.*/ }))
//       // allow winston logger to be bundled on client
//       // eslint-disable-next-line no-param-reassign
//       // config.node = { fs: 'empty' }
//       // eslint-disable-next-line no-param-reassign
//       config.resolve.fallback.fs = false
//       // eslint-disable-next-line no-param-reassign
//       // config.resolve.alias.canvas = false
//       // eslint-disable-next-line no-param-reassign
//       // config.resolve.alias.encoding = false
//       // config.module.rules.push({
//       //   test: /\.node$/,
//       //   use: 'node-loader',
//       // })
//     }

//     return config
//   },
// })

module.exports = (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    /* config options here */
    async headers() {
      return [
        {
          // matching all API routes
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
            },
          ],
        },
      ]
    },
    reactStrictMode: false,
    crossOrigin: 'anonymous',
    // removed target in Nextjs 13, use it if going back to nextjs 12 
      // target: 'serverless',
      // webpack5: true,
    webpack(config, { isServer, webpack }) {
      module.exports = {
        // module: {
        //   rules: [
        //     {
        //       test: /canvas.node$/,
        //       use: 'node-loader',
        //     },
        //   ],
        // },
        // target: 'node',
        // node: {
        //   __dirname: false,
        // },
        // module: {
        //   rules: [
        //     {
        //       test: /\.node$/,
        //       loader: 'node-loader',
        //       options: {
        //         name: "[path][name].[ext]",
        //       },
        //     },
            
        //   ],
        // },
      }
      if (isServer) {
        // exclude client only packages.
        // config.plugins.push(new webpack.IgnorePlugin(/encoding|mongodb-client-encryption/))
        config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /encoding|mongodb-client-encryption/ }))
        // eslint-disable-next-line no-param-reassign
        config.resolve.alias.canvas = false
        // // eslint-disable-next-line no-param-reassign
        // config.resolve.alias.encoding = false
        // config.module.rules.push({
        //   test: /\.node$/,
        //   use: 'node-loader',
        // })
      } else {
        // don't bundle server modules to the client
        // config.plugins.push(new webpack.IgnorePlugin(/bcryptjs|jsonwebtoken|mongodb/))
        config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /bcryptjs|jsonwebtoken|mongodb/ }))
        // exclude test files
        // config.plugins.push(new webpack.IgnorePlugin(/pages.*\/test.*/))
        config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /pages.*\/test.*/ }))
        // allow winston logger to be bundled on client
        // eslint-disable-next-line no-param-reassign
        // config.node = { fs: 'empty' }
        // eslint-disable-next-line no-param-reassign
        config.resolve.fallback.fs = false
        // eslint-disable-next-line no-param-reassign
        // config.resolve.alias.canvas = false
        // eslint-disable-next-line no-param-reassign
        // config.resolve.alias.encoding = false
        // config.module.rules.push({
        //   test: /\.node$/,
        //   use: 'node-loader',
        // })
      }
  
      return config
    },
  }
  return nextConfig
}
