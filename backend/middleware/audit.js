const prisma = require('../utils/db');

const auditLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = async function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && 
          ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        try {
          await prisma.auditLog.create({
            data: {
              userId: req.user.id,
              action: `${action} - ${req.method} ${req.path}`,
              details: JSON.stringify({
                body: req.body,
                params: req.params,
                query: req.query
              })
            }
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }
      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger;
