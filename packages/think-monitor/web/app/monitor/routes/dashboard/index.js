
import RBAuthRoute from 'components/auth-route';

export default RBAuthRoute({
  path: 'dashboard',
  chunkLoader(cb) {
    cb(
      require('./home')
    );
  }
});