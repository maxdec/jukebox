import crypto from 'crypto';

export default function (req, res, next) {
  if (req.cookies.uid) return next();

  const hash = crypto.createHash('sha1')
                   .update(req.headers['user-agent'])
                   .update(req.ip)
                   .update('' + Date.now())
                   .digest('hex');
  res.cookie('uid', hash, { expires: new Date('2020-01-01'), httpOnly: true });
  next();
}
