
const dbName = 'ChatAppDB';
const dbVersion = 1;
const storeNames = {
  /** 智能体 */
  agents: 'agents',
  /** 对话 */
  conversations: 'conversations',
};

let db;

// 打开数据库
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      // 创建对象存储
      if (!db.objectStoreNames.contains(storeNames.agents)) {
        db.createObjectStore(storeNames.agents, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(storeNames.conversations)) {
        db.createObjectStore(storeNames.conversations, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// 添加数据
function addData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);

    request.onsuccess = () => resolve(data);
    request.onerror = (event) => reject(event.target.error);
  });
}

// 更新数据
function updateData(storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve(data);
    request.onerror = (event) => reject(event.target.error);
  });
}

// 删除数据
function deleteData(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve(id);
    request.onerror = (event) => reject(event.target.error);
  });
}

// 查询数据
function getData(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// 获取所有数据
function getAllData(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// 初始化数据库
async function initDB() {
  await openDB();
}

// 导出接口
export {
  initDB,
  addData,
  updateData,
  deleteData,
  getData,
  getAllData,
  storeNames
};
