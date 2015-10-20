import { VOTES_SET } from '../constants/votes';

export const set = votes => ({ type: VOTES_SET, payload: votes });

// doVote: function() {
//   api.votes.post(function (err) {
//     if (err) console.error(err);
//   });
// }
