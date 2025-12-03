export function decryptDMSWorker(inbox, userKeys) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("./dmsWorker.js", import.meta.url),
        { type: "module" }
      );
      worker.postMessage({ inbox, userKeys });
  
      worker.onmessage = (e) => {
        resolve(e.data);
        worker.terminate();
      };
  
      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };
    });
  }
  