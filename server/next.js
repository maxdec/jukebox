import current from './services/current';
import history from './services/history';
import votes from './services/votes';

export default function next(callback = () => {}) {
  current.get((err, prevTrack) => {
    if (err) return callback(err);
    if (prevTrack) {
      history.create(prevTrack, err => {
        if (err) return callback(err);
        // Clear the votes and current song
        votes.clear();
        current.remove();
        callback();
      });
    } else {
      votes.clear();
      current.remove();
      callback();
    }
  });
}
