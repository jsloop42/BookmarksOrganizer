self.addEventListener('message', function (e) {
    debugger;
    self.postMessage("message obtained by worker.js: " + e.data);
    self.close();
}, false);