// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  settings: {
    apiUrl: 'https://api.100100188.com/api',
    // wssUrl: 'wss://as-swarm-100bet.betconstruct.com',
    // wssUrl: 'wss://eu-swarm-springre.betconstruct.com/',
    wssUrl: 'wss://eu-swarm-test.betconstruct.com/',
    // wssUrl: 'wss://wss.100betcn.com',
    siteID: '1871111',
    casinoApi: 'https://cmsbetconstruct.com/casino',
    gamesApi: 'https://games.100100188.com',
    baseUrl: 'https://100100188.com',
    zdscript_key: '10cfbd82-1132-4721-a38b-0a0df64f9772'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
