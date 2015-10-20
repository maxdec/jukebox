import state from '../player_state';
import current from '../services/current';

export default function (m) {
  state.playing = true;
  if (m.type === 'progress') {
    current.updateCurrentPosition(m.current, m.total);
  }
}
