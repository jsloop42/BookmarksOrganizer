// Sort Manager
// Deals with sort worker
// Loaded by event.js and main.js
// (c) 2013 kadaj. GNU GPL v3.

worker || (worker = new Worker('js/sortWorker.js'));
worker.addEventListener('message', function (e) {
    if (e.data.hasOwnProperty('action') && e.data.hasOwnProperty('type') && e.data.type === "response") {
        switch (e.data.action) {
        case "sort":
            var result = e.data.result,
                sortedNode = result.node,
                args = (function () {
                    return e.data.hasOwnProperty('args') ? e.data.args : {}
                })();
            KDJ.BO.totalNodes = KDJ.BO.totalNodes + sortedNode.length;
            switch (result.nodeType) {
            case "leaf":
                try {
                    bm.moveBookmarks(sortedNode, function (res) {
                        if (!res) {
                            // TODO: update status text
                            localStorage.removeItem('boStatus');
                            //console.log("err moving");
                            worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderError') && typeof KDJ.BO.onReorderError === "function") {
                                KDJ.BO.onReorderError({
                                    'status': false,
                                    'errMsg': 'API max write exceeded',
                                    'errCode': 1
                                });
                            }
                            return false;
                        }
                        KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                        if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                            // leaf nodes reorder completed
                            worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderComplete') && typeof KDJ.BO.onReorderComplete === "function") {
                                KDJ.BO.onReorderComplete();
                            }
                        }
                    });
                } catch (ex) {
                    //console.log("leaf node reorder exception: ", ex);
                    if (KDJ.BO.hasOwnProperty('onReorderError') && typeof KDJ.BO.onReorderError === "function") {
                        KDJ.BO.onReorderError({
                            'status': false,
                            'errMsg': 'Error reordering',
                            'errCode': 2
                        });
                    }
                }
                break;
            case "root":
                try {
                    bm.moveBookmarks(sortedNode, function (res, a) {
                        if (!res) {
                            // TODO: update status text
                            localStorage.removeItem('boStatus');
                            //console.log("err moving");
                            worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderError') && typeof KDJ.BO.onReorderError === "function") {
                                KDJ.BO.onReorderError({
                                    'status': false,
                                    'errMsg': 'API max write exceeded',
                                    'errCode': 1
                                });
                            }
                            return false;
                        }
                        KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                        //console.log("totalNodes %d", KDJ.BO.totalNodes);
                        //console.log("nodesProcessed %d", KDJ.BO.nodesProcessed);
                        if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                            // root nodes reorder completed
                            worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderComplete') && typeof KDJ.BO.onReorderComplete === "function") {
                                KDJ.BO.onReorderComplete();
                            }
                        }
                    });
                } catch (ex) {
                    //console.log("root node reorder exception: ", ex);
                    if (KDJ.BO.hasOwnProperty('onReorderError') && typeof KDJ.BO.onReorderError === "function") {
                        KDJ.BO.onReorderError({
                            'status': false,
                            'errMsg': 'Error reordering',
                            'errCode': 2
                        });
                    }
                }
                if (args.hasOwnProperty('isRecursive') && args.isRecursive) {
                    for (i = 0; i < sortedNode.length; i++) {
                        //console.log("calling sort on children of " + sortedNode[i].title);
                        worker.postMessage({'action': 'sort', 'type': 'request', 'node': sortedNode[i], 'args': {'isRecursive': args.isRecursive}});
                    }
                }
                break;
            }
            break;
        }
    }
}, false);
