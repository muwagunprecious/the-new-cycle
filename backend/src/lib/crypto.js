const crypto = require('crypto');

const generateVerificationCode = (length = 8) => {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
};

module.exports = {
    generateVerificationCode
};
