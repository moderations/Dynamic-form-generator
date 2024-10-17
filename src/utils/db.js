const dbMap = {
    template: {
        name: 'template',
        keyPath: 'type',
        indexes: [
            {
                index: 'type',
                unique: true
            },
            // {
            //     index: 'mobile',
            //     unique: true
            // },
            // {
            //     index: 'idcard',
            //     unique: true
            // },
            'remark',
            'template'
        ]
    }
};

export function openDB(dbName, version = 1, options = {}) {
    return new Promise((resolve, reject) => {
        const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        let db;
        const request = indexedDB.open(dbName, version);

        request.onsuccess = function(e) {
            db = e.target.result;
            resolve(db);
        }

        request.onerror = function(e) {
            reject(e.message);
        }

        request.onupgradeneeded = function(e) {
            db = e.target.result;

            const objectStoreName = options.objectStore || dbName;
            const objectStore = db.createObjectStore(objectStoreName, {keyPath: dbMap[objectStoreName].keyPath});
            
            // objectStore.createIndex(dbMap[objectStoreName].keyPath, dbMap[objectStoreName].keyPath, {unique: true});
            if( dbMap[objectStoreName].indexes ) {
                dbMap[objectStoreName].indexes.forEach(index => {
                    if( typeof index === 'string' ) objectStore.createIndex(index, index, {unique: false});
                    else {
                        objectStore.createIndex(index.index, index.index, {unique: index.unique});
                    }
                })
            }
            // objectStore.createIndex('name', 'name', {unique: false});
            objectStore.transaction.oncomplete = function(e) {
                const customObjectStore = db.transaction(objectStoreName, 'readwrite').objectStore(objectStoreName);

                options && options.data && options.data.forEach(item => {
                    customObjectStore.add(item);
                })
                // resolve(db);
            }
        }
    })
}

export function addData(db, storeName, data) {
    var request = db
                    .transaction([storeName],"readwrite") // 事务对象 指定表格名称和操作模式 ("只读"或"读写")
                    .objectStore(storeName) // 仓库对象
                    .add(data);
 
    request.onsuccess = function (event){    
        console.log("数据写入成功");
    };
 
    request.onerror = function (event) {
        console.log("数据写入失败");
    };
}

export function getDataByKey(db, storeName, key, mode = 'readonly') {
    return new Promise((resolve, reject) => {
        console.log('getDataByKey key', key);
        var transaction = db.transaction([storeName]); // 事务
        var objectstore = transaction.objectStore(storeName); // 仓库对象
        var request = objectstore.get(key); // 通过主键获取数据
        request.onerror = function (event) {
            console.log("事务失败", event);
            reject(event);
        };
    
        request.onsuccess = function (event) {
            console.log("主键查询结果:", request.result);
            resolve(request.result);
        };
    });
}

export function getDataByCursor(db, storeName){
    let list = [];
    var store = db
        .transaction(storeName, "readwrite") // 事务
        .objectStore(storeName); // 仓库对象
    var request = store.openCursor(); // 指针对象
    // 游标开启成功,逐行读数据
    request.onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
            // 必须要检查
            list.push(cursor.value);
            cursor.continue(); // 遍历了存储对象中的所有内容
        } else {
            console.log("游标读取的数据",list);
        }
    };
}

export function getDataByIndex(db, storeName, indexName, indexValue){
    var store = db.transaction(storeName, "readwrite").objectStore(storeName);
    var request = store.index(indexName).get(indexValue);
    request.onerror = function () {
        console.log("事务失败");
    };
    request.onsuccess = function (e) {
        var result = e.target.result;
        console.log("索引查询结果:", result);
    };
}

export function updateDB(db, storeName, data) {
    return new Promise((resolve, reject) => {
        var objectStore = db
                        .transaction([storeName], "readwrite") // 事务对象
                        .objectStore(storeName); // 仓库对象
                        
        const requestGet = objectStore.get(data.type);
        
        requestGet.onerror = function (e) {
            console.log("主键查询失败");
            reject({code: 201, msg: e.message || '查询失败'});
        };
        requestGet.onsuccess = function (e) {
            var result = e.target.result || data;

            console.log("主键查询结果:", result);
            result.template = data.template;
            
            const requestUpdate = objectStore.put(result);
            requestUpdate.onsuccess = function (e) {
                console.log("数据更新成功");
                resolve({code: 200});
            };
        
            requestUpdate.onerror = function (e) {
                console.log("数据更新失败");
                reject({code: 201, msg: e.message || '更新失败'});
            };
        };
    })
}

export function deleteDB(db, storeName, id) {
    var request = db
        .transaction([storeName], "readwrite")
        .objectStore(storeName)
        .delete(id);
    request.onsuccess = function () {
        console.log("数据删除成功");
    };
 
    request.onerror = function () {
        console.log("数据删除失败");
    };
}

export function cursorDelete(db,storeName,indexName,indexValue){
    var store = db.transaction(storeName,"readwrite").objectStore(storeName);
    var request = store
        .index(indexName) // 索引对象
        .openCursor(IDBKeyRange.only(indexValue)); // 指针对象
    request.onsuccess = function (e) {
        var cursor = e.target.result;
        var deleteRequest;
        if (cursor) {
            deleteRequest = cursor.delete(); // 请求删除当前项
            deleteRequest.onerror = function () {
                console.log("游标删除该记录失败");
            };
            deleteRequest.onsuccess = function () {    
                console.log("游标删除该记录成功");
            };
            cursor.continue();
        }
    };
    request.onerror = function (e){ };
}

export function closeDB(db) {
    db.close();
    console.log("数据库已关闭");
}

export function deleteDBAll(dbName){
    console.log(dbName);
    let deleteRequest = window.indexedDB.deleteDatabase(dbName);
    deleteRequest.onerror = function (event) {
        console.log("删除失败");
    };
    deleteRequest.onsuccess = function (event) {
        console.log("删除成功");
    };
}