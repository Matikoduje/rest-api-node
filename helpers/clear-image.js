const fs = require('fs');

const clearImage = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

module.exports = { clearImage };
