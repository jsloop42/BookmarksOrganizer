// sort manager
// Deals with sort worker
// Loaded by event.js and main.js
// (c) 2013 kadaj

worker || (worker = new Worker('sortWorker.js'));
worker.addEventListener('message', function (e) {
    console.log("worker: ", e.data);
    if (e.data.hasOwnProperty('action') && e.data.hasOwnProperty('type') && e.data.type === "response") {
        switch (e.data.action) {
        case "sort":
            var result = e.data.result,
                sortedNode = result.node,
                args = (function () { 
                    return e.data.hasOwnProperty('args') ? e.data.args : {}
                })();

            switch (result.nodeType) {
            case "leaf":
                try {
                    bm.moveBookmarks(sortedNode, function (res) {
                        console.log(res);
                        if (!res) {
                            // TODO: update status text
                            localStorage.removeItem('boStatus');
                            console.log("err moving");
                            worker.terminate();
                            return false;
                        }
                        console.log("leaf nodes updated");
                        KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                        console.log("totalNodes %d", KDJ.BO.totalNodes);
                        console.log("nodesProcessed %d", KDJ.BO.nodesProcessed);
                        if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                            console.log("pNodes: Reorder completed");
                            worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderComplete') && typeof KDJ.BO.onReorderComplete === "function") {
                                KDJ.BO.onReorderComplete();
                            }
                        }
                    });
                } catch (ex) {
                    console.log("leaf node reorder exception: ", ex);
                }
                break;
            case "root":
                try {
                    bm.moveBookmarks(sortedNode, function (res) {
                        console.log(res);
                        if (!res) {
                            // TODO: update status text
                            localStorage.removeItem('boStatus');
                            console.log("err moving");
                            worker.terminate();
                            return false;
                        }
                        console.log("parent nodes updated");
                        KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                        console.log("totalNodes %d", KDJ.BO.totalNodes);
                        console.log("nodesProcessed %d", KDJ.BO.nodesProcessed);
                        if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
                            console.log("pNodes: Reorder completed");
                            worker.terminate();
                            if (KDJ.BO.hasOwnProperty('onReorderComplete') && typeof KDJ.BO.onReorderComplete === "function") {
                                KDJ.BO.onReorderComplete();  
                            }
                        }
                    });
                } catch (ex) {
                    console.log("root node reorder exception: ", ex);
                }
                if (args.hasOwnProperty('isRecursive') && args.isRecursive) {
                    for (i = 0; i < sortedNode.length; i++) {
                        //console.log("calling sort on children of " + pNodes[i].title);
                        worker.postMessage({'action': 'sort', 'type': 'request', 'node': sortedNode, 'args': {'isRecursive': args.isRecursive}});
                    }
                }
                break;
            }
            break;
        }
    }
}, false);
