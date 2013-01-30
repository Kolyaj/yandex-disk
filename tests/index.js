var YandexDisk = require('..').YandexDisk;

var disk = new YandexDisk(process.argv[2], process.argv[3]);
var dirname = Math.random().toString(36).slice(2);

var tests = {
    'Подключение к диску': function(callback) {
        disk.readdir('/', function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, true);
        });
    },

    'Проверка отсутствия директории': function(callback) {
        disk.exists(dirname, function(err, exists) {
            callback(err, !exists);
        });
    },

    'Создание директории': function(callback) {
        disk.mkdir(dirname, function(err, status) {
            callback(err, status);
        });
    },

    'Создание существующей директории': function(callback) {
        disk.mkdir(dirname, function(err, status) {
            callback(err, !status);
        });
    },

    'Проверка существования директории': function(callback) {
        disk.exists(dirname, function(err, exists) {
            callback(err, exists);
        });
    },

    'Переключение в директорию (cd)': function(callback) {
        disk.cd(dirname);
        callback(null, true);
    },

    'Чтение пустой директории': function(callback) {
        disk.readdir('.', function(err, files) {
            callback(err, !files.length);
        });
    }
};

var tasks = Object.keys(tests).map(function(testName) {
    return function(callback) {
        tests[testName](function(err, status) {
            if (err) {
                callback(err);
            }
            console.log(testName + '\t' + (status ? '\033[92mok\033[39m' : '\033[91mfail\033[39m'));
            callback(null);
        });
    };
});

require('async').series(tasks, function(err) {
    if (err) {
        throw err;
    }
});
