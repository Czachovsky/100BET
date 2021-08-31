export interface Pick {
  id: string,
  date: string,
  hour: string,
  multiplier: string,
  teams: any
}

export interface BetSlip {
  multi_stake: any;
  bankerEnabled: boolean,
  email_notification: boolean,
  sms_notification: boolean,
  type: any[],
  multiples: any[],
  system: any[],
  odds_option: string,
  picks: any[],
  total_odds: number,
  possible_return_single: number,
  possible_return_multi: number,
  possible_return_system: number,
  stake_all: any,
  isConflict: boolean
}

export interface NewPick {
  live: boolean,
  event_id: string,
  event_name: string,
  finished: boolean,
  locked: boolean,
  sport_name: string,
  option_name: string,
  option_id: string,
  stake: number,
  price: number,
  selected: boolean,
  isConflict: boolean,
  base: any,
  isAsian: boolean,
  asianBase: any
}


// example betslip object

// {
//   "bankerEnabled": false,
//   "email_notification": false,
//   "sms_notification": false,
//   "type": "Single",
//   "odds_option": "Any",
//   "picks": [
//   {
//     "live": true,
//     "event_id": "example_event_id",
//     "event_name": "Chelsea -  Bayern Monachium",
//     "finished": false,
//     locked: false,
//     sport_name: "Soccer",
//     option_name: "Chelsea",
//     option_id: "example_option_id",
//     stake: "3.50",
//     price: "10"
//   }
// ]
// }
