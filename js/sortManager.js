// Sort Manager
// Loads and communicates with sort worker
// Loaded by event.js and main.js
// (c) 2013 kadaj. GNU GPL v3.

KDJ.BO.worker || (KDJ.BO.worker = new Worker('js/sortWorker.js'));
KDJ.BO.worker.addEventListener('message', function (e) {
    if (e.data.hasOwnProperty('action') && e.data.hasOwnProperty('type') && e.data.type === "response") {
        switch (e.data.action) {
        case "sort":
            var result = e.data.result,
                sortedNode = result.node,
                args = (function () {
                    return e.data.hasOwnProperty('args') ? e.data.args : {};
                })(),
                i = 0,  // leaf node loop index
                j = 0,  // root node loop index
                k = 0,  // loop for arg with recursive set for root node
                len = sortedNode.length,
                node;
            KDJ.BO.totalNodes = KDJ.BO.totalNodes + len;
            //console.log("totalNodes sorted: " + len);
            switch (result.nodeType) {
            case "leaf":
                for (i = 0; i < len; i++) {
                    node = sortedNode[i];
                    if (node.isChanged == true) {  // node changed
                        delete node.isChanged;
                        try {
                            bm.moveBookmark(node, function (res) {
                                if (!res) {
                                    localStorage.removeItem('boStatus');
                                    console.log("err moving");
                                    //KDJ.BO.worker.terminate();
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
                                console.log("nodesProcessed %d", KDJ.BO.nodesProcessed);
                                console.log("leaf updated");
                                if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                                    // leaf nodes reorder completed
                                    //KDJ.BO.worker.terminate();
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
                            return false;  // on error stop reordering the rest because most likely, the limit exceeded.
                        }
                    } else {  // node not changed
                        KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                        if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                            // leaf nodes reorder completed
                            //KDJ.BO.worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderComplete') && typeof KDJ.BO.onReorderComplete === "function") {
                                KDJ.BO.onReorderComplete();
                            }
                        }
                    }
                }                
                break;
            case "root":
                for (j = 0; j < len; j++) {
                    node = sortedNode[j];
                    if (node.isChanged == true) {                        
                        delete node.isChanged;
                        try {
                            bm.moveBookmark(node, function (res, a) {
                                if (!res) {
                                    localStorage.removeItem('boStatus');
                                    //console.log("err moving");
                                    //KDJ.BO.worker.terminate();
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
                                console.log("nodesProcessed %d", KDJ.BO.nodesProcessed);
                                console.log("root updated")
                                if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                                    // root nodes reorder completed
                                    //KDJ.BO.worker.terminate();
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
                            return false;
                        }
                    } else {
                        KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                        if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                            // root nodes reorder completed
                            //KDJ.BO.worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderComplete') && typeof KDJ.BO.onReorderComplete === "function") {
                                KDJ.BO.onReorderComplete();
                            }
                        }
                    }
                }
                
                if (args.hasOwnProperty('isRecursive') && args.isRecursive) {
                    for (k = 0; k < len; k++) {
                        //console.log("calling sort on children of " + sortedNode[i].title);
                        KDJ.BO.worker.postMessage({'action': 'sort', 'type': 'request', 'node': sortedNode[k], 'args': {'isRecursive': args.isRecursive}});
                    }
                }
                break;
            }
            break;
        }
    }
}, false);
