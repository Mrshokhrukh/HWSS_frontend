/* eslint-disable no-unused-vars */
// src/indexedDBHelper.js
export function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open('UserScreenedDB', 1);
  
      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
  
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('userScreenedStore', { keyPath: 'userId' });
      };
    });
  }
  
  export async function getUserScreenedData(userId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userScreenedStore'], 'readonly');
      const objectStore = transaction.objectStore('userScreenedStore');
      const request = objectStore.get(userId);
  
      request.onerror = (event) => {
        console.error('Error getting data:', event.target.error);
        reject(event.target.error);
      };
  
      request.onsuccess = (event) => {
        resolve(request.result);
      };
    });
  }
  
  export async function setUserScreenedData(userId, data) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userScreenedStore'], 'readwrite');
      const objectStore = transaction.objectStore('userScreenedStore');
      const request = objectStore.put({ userId, ...data });
  
      request.onerror = (event) => {
        console.error('Error setting data:', event.target.error);
        reject(event.target.error);
      };
  
      request.onsuccess = (event) => {
        resolve(request.result);
      };
    });
  }
  