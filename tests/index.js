var YandexDisk = require('..').YandexDisk;

var disk = new YandexDisk(process.argv[2], process.argv[3]);
var dirname = Math.random().toString(36).slice(2);

var tests = {
    'Подключаюсь к диску': function(callback) {
        disk.readdir('/', function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, true);
        });
    },

    'Проверяю отсутствие директории': function(callback) {
        disk.exists(dirname, function(err, exists) {
            callback(err, !exists);
        });
    },

    'Создаю директорию': function(callback) {
        disk.mkdir(dirname, function(err, status) {
            callback(err, status);
        });
    },

    'Создаю существующую директорию': function(callback) {
        disk.mkdir(dirname, function(err, status) {
            callback(err, !status);
        });
    },

    'Проверяю существование директории': function(callback) {
        disk.exists(dirname, function(err, exists) {
            callback(err, exists);
        });
    },

    'Переключаюсь в директорию (cd)': function(callback) {
        disk.cd(dirname);
        callback(null, true);
    },

    'Читаю пустую директорию': function(callback) {
        disk.readdir('.', function(err, files) {
            callback(err, !files.length);
        });
    },

    'Создаю текстовый файл из памяти': function(callback) {
        disk.writeFile('привет мир.txt', 'Привет, Мир!', 'utf8', function(err) {
            if (err) {
                return callback(err);
            }
            disk.exists('привет мир.txt', function(err, exists) {
                callback(err, exists);
            });
        });
    },

    'Создаю бинарный файл с диска': function(callback) {
        disk.uploadFile(__dirname + '/img.gif', 'img.gif', function(err) {
            if (err) {
                return callback(err);
            }
            disk.exists('img.gif', function(err, exists) {
                callback(err, exists);
            });
        });
    },

    'Скачиваю бинарный файл на диск': function(callback) {
        disk.downloadFile('img.gif', __dirname + '/img2.gif', function(err) {
            if (err) {
                return callback(err);
            }
            var size1 = require('fs').statSync(__dirname + '/img.gif').size;
            var size2 = require('fs').statSync(__dirname + '/img2.gif').size;
            require('fs').unlinkSync(__dirname + '/img2.gif');
            callback(null, size1 == size2);
        })
    },

    'Читаю директорию с файлами': function(callback) {
        disk.readdir('.', function(err, files) {
            callback(err, files.length == 2);
        });
    },

    'Читаю текстовый файл': function(callback) {
        disk.readFile('привет мир.txt', 'utf8', function(err, content) {
            callback(err, content == 'Привет, Мир!');
        });
    },

    'Копирую текстовый файл': function(callback) {
        var source = 'привет мир.txt';
        var destination = 'пока мир.txt';

        disk.copy(source, destination, function(err) {
            if (err) {
                return callback(err);
            }
            disk.exists(destination, function(err, exists) {
                if (!exists) {
                    return callback(err);
                }
                disk.readFile(source, 'utf8', function(err1, content1) {
                    disk.readFile(destination, 'utf8', function(err2, content2) {
                        return callback(err1 || err2, content1 == content2);
                    });
                });
            });
        });
    },

    'Перемещаю текстовый файл': function(callback) {
        var source = 'привет мир.txt';
        var destination = 'пока мир.txt';

        disk.move(source, destination, function(err, status) {
            if (err) {
                return callback(err);
            }
            disk.exists(source, function(err, exists) {
                if (exists) {
                    return callback(err);
                }
                disk.readFile(destination, 'utf8', function(err, content) {
                    return callback(err, content == 'Привет, Мир!');
                });
            });
        });
    },

    'Удаляю файл': function(callback) {
        disk.remove('img.gif', function(err) {
            if (err) {
                return callback(err);
            }
            disk.exists('img.gif', function(err, exists) {
                return callback(err, !exists);
            });
        });
    },

    'Закачиваю папку': function(callback) {
        disk.uploadDir(__dirname + '/dir1', 'dir1', function(err) {
            if (err) {
                return callback(err);
            }
            disk.exists('dir1/dir2/img.gif', function(err, exists) {
                return callback(err, exists);
            });
        });
    },

    'Публикую папку': function(callback) {
        disk.cd('/');
        disk.publish(dirname, function(err, publicUrl) {
            if (err) {
                return callback(err);
            }
            disk.isPublic(dirname, function(err, publicUrl) {
                var regExpUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                var isUrl = (regExpUrl.test(publicUrl));
                return callback(err, isUrl);
            });
        });
    },

    'Удаляю публичную ссылку с папки': function(callback) {
        disk.unPublish(dirname, function(err, publicUrl) {
            if (err) {
                return callback(err);
            }
            disk.isPublic(dirname, function(err, publicUrl) {
                return callback(err, publicUrl == null);
            });
        });
    },

    'Удаляю директорию с файлами': function(callback) {
        disk.remove(dirname, function(err) {
            if (err) {
                return callback(err);
            }
            disk.exists(dirname, function(err, exists) {
                return callback(err, !exists);
            });
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

