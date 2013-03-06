// bookmarks organizer view-controller
// This script is loaded when user clicks on the extension's icon
// (c) 2013 kadaj

document.addEventListener('DOMContentLoaded', function () {
    var reorderBtn = document.querySelector('.reorderBtn'),
        statusTxt = document.querySelector('.statusTxt'),
        boState = {},
        totalNodes = 0,
        nodesProcessed = 0,
        bm = new Bookmark();
    
    // bookmark status
    boStatus = localStorage.getItem('boStatus');
    if (boStatus && boStatus === "in_progress") {
        reorderBtn.style.display = "none";
        statusTxt.innerHTML = "Sorting..";
        statusTxt.style.display = "block";
    } else {
        reorderBtn.style.display = "block";
        statusTxt.style.display = "none";
    }

    // reorder click event listener
    reorderBtn.addEventListener('click', function (e) {
        localStorage.setItem('boStatus', 'in_progress');
        reorderBtn.style.display = "none";
        statusTxt.innerHTML = "Sorting..";
        statusTxt.style.display = "block";
        console.log("button selected");
        var bbNodes = [];
        console.log("max writes per min: " , bm.getMaxSustainedWritesPerMin());
        console.log("max writes per hour: ", bm.getMaxWritesPerHour());
        chrome.bookmarks.MAX_WRITE_OPERATIONS_PER_HOUR = 60000;
        chrome.bookmarks.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE = 1000;
        bm.getBookmarksBarNode(onBookmarksObtained);
        bm.getOtherBookmarksNode(onBookmarksObtained);
        function onBookmarksObtained (bNodes) {
            console.log(bNodes);
            if (bNodes.length === 1) bbNodes = bNodes[0];
            else throw new Error("Error getting bookmarks");
            console.log(bbNodes);
            //init(bNodes);
            if (bbNodes.hasOwnProperty('children') && bbNodes.children.length > 1) {
                //sortByTitle(bbNodes.children, true);
                init(bbNodes);
            }
        }
    });
    
    function init (node) {
        var worker;
        console.log(node);
        if (node.hasOwnProperty('children') && node.children.length > 1) {
            totalNodes = totalNodes + node.children.length;
            worker = new Worker('sortWorker.js');
            worker.addEventListener('message', function (e) {
                console.log("worker: ", e.data);
                if (e.data.hasOwnProperty('action') && e.data.hasOwnProperty('type') && e.data.type === "response") {
                    switch (e.data.action) {
                    case "sort":
                        var result = e.data.result;
                        var sortedNode = result.node;
                        var args = (function () { return e.data.hasOwnProperty('args') ? e.data.args : {}})();
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
                                    nodesProcessed = nodesProcessed + 1;
                                    console.log("totalNodes %d", totalNodes);
                                    console.log("nodesProcessed %d", nodesProcessed);
                                    if (nodesProcessed === totalNodes) {
                                        console.log("pNodes: Reorder completed");
                                        reorderBtn.style.display = "block";
                                        statusTxt.style.display = "none";
                                        localStorage.removeItem('boStatus');
                                        worker.terminate();
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
                                    nodesProcessed = nodesProcessed + 1;
                                    console.log("totalNodes ", totalNodes);
                                    console.log("nodesProcessed ", nodesProcessed);
                                    if (nodesProcessed === totalNodes) {
                                        console.log("pNodes: Reorder completed");
                                        reorderBtn.style.display = "block";
                                        statusTxt.style.display = "none";
                                        localStorage.removeItem('boStatus');
                                        worker.terminate();
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
            worker.postMessage({'action': 'sort', 'type': 'request', 'node': node, 'args': {'isRecursive': true}});
        }
    }
});
