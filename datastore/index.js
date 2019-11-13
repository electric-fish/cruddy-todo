const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

const Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id = counter.getNextUniqueId ((err, id) => {
    if (err) {
      throw err;
    } else {
      let fileName = path.join(exports.dataDir, `${id}.txt`);
      // let fileName = path.join(exports.dataDir, id);
      fs.writeFile(fileName, text, (err) => {
        if (err) {
          throw err;
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
  // items[id] = text;
  // callback(null, { id, text });
};

exports.readAll = (callback) => {
  // let dirPath = exports.dataDir;
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw err;
    } else {
      let data = _.map(files, (file) => {
        let filePath = path.join(exports.dataDir, file);
        // console.log('------------filePath: ', filePath);
        var id = file.slice(0, -4);
        // var text =
        // fs.readFileSync(filePath, 'utf8', (err, data) => {
        //   if (err) {
        //     throw err;
        //   } else {
        //     console.log('------------data: ', data);
        //     return {id, text: data};
        //   }
        // });
        // var data = fs.readFileSync(filePath, 'utf8');
        // return {id, text: data};
        return readFilePromise(filePath)
          .then(fileData => {
            return {id: id, text: fileData.toString()};
          });
      });
      Promise.all(data)
        .then(items => callback(null, items), err => callback(err));
    }
  });
  // var data = _.map(items, (text, name) => {
  //   return { id, text };
  // });
  // callback(null, data);
};

exports.readOne = (id, callback) => {
  // let path = exports.dataDir;
  // path = path.join(path, `${id}.txt`);
  let fileName = path.join(exports.dataDir, `${id}.txt`);
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      // throw err;
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id: id, text: data});
    }
  });

  // var text = items[id];
  // if (!text) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback(null, { id, text });
  // }
};

exports.update = (id, text, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.access(filePath, fs.constants.F_OK | fs.constants.W_OK, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          // callback(new Error(`No item with id: ${id}`));
          throw err;
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  let filePath = path.join(exports.dataDir, `${id}.txt`);
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
