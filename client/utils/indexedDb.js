function sIndexedDB(){
    var win = typeof window !== 'undefined' ? window : {}
    var indexedDB = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
    if (typeof window !== 'undefined' && !indexedDB) {
        console.error('indexDB not supported');
        return;
    }
    this.db = undefined;
    let openRequest = indexedDB.open("ldb", 1);
    openRequest.onupgradeneeded = function() {
        
    };
      
    openRequest.onerror = function() {
        console.error("Error", openRequest.error);
    };
      
    openRequest.onsuccess = async function() {
        this.db = openRequest.result;
        await this.db.createObjectStore('frames', {keyPath: 'k', autoIncrement: false});
        this.transaction = await this.db.transaction('frames', 'readwrite');
        this.frames = await this.transaction.objectStore("frames");
        // continue working with database using db object
    };


    

    this.get = (key, callback)=>{
        return this.frames.get(key.toString());
    }

    this.set = (key, value, callback)=>{
        return this.frames.add({
            'k': key,
            'v': value
        });
    }
}