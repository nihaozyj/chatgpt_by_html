const dbName = 'ChatAppDB';
const dbVersion = 1;
const storeNames = {
  /** 智能体 */
  agents: 'agents',
  /** 对话 */
  conversations: 'conversations',
};

let db;

/**
 * 打开数据库
 * @returns {Promise<IDBDatabase>} 数据库实例
 */
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

/**
 * 添加数据
 * @param {string} storeName - 存储名称
 * @param {Object} data - 要添加的数据
 * @returns {Promise<Object>} 添加的数据
 */
function addData(storeName, data) {
  // 自动添加时间戳
  const dataWithTimestamp = {
    ...data,
    updatedAt: new Date().toISOString(), // 添加时间戳
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(dataWithTimestamp);

    request.onsuccess = () => resolve(dataWithTimestamp);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * 更新数据
 * @param {string} storeName - 存储名称
 * @param {Object} data - 要更新的数据
 * @returns {Promise<Object>} 更新后的数据
 */
function updateData(storeName, data) {
  // 自动更新时间戳
  const dataWithTimestamp = {
    ...data,
    updatedAt: new Date().toISOString(), // 更新时间戳
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(dataWithTimestamp);

    request.onsuccess = () => resolve(dataWithTimestamp);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * 删除数据
 * @param {string} storeName - 存储名称
 * @param {string} id - 要删除的数据的ID
 * @returns {Promise<string>} 删除的数据的ID
 */
function deleteData(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve(id);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * 查询数据
 * @param {string} storeName - 存储名称
 * @param {string} id - 要查询的数据的ID
 * @returns {Promise<Object|null>} 查询到的数据或null
 */
function getData(storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * 获取所有数据并按更新时间排序
 * @param {string} storeName - 存储名称
 * @returns {Promise<Array<Object>>} 按更新时间排序的所有数据
 */
function getAllData(storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const data = event.target.result;
      // 按 updatedAt 字段排序，时间越近排越前
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      resolve(data);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * 初始化数据库
 * @returns {Promise<void>}
 */
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
