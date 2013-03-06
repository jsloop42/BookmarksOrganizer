var totalNodes = 0, nodesProcessed = 0;

chrome.bookmarks.onMoved.addListener(onBookmarkChange);
chrome.bookmarks.onCreated.addListener(onBookmarkChange);
function onBookmarkChange (id, node) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function (e) {
        console.log(e);
        if (e.target.status === 200) {
            eval(e.target.responseText);
            var bm = new Bookmark();

            bm.getBookmarksSubTree(node.parentId, function (node) {
                var pNode;
                console.log("parent node %o", node);
                if (node.length !== 1) throw new Error("Error in obtained parent node");
                pNode = node[0];
                console.log("pNode: %o", pNode);
                if (pNode.hasOwnProperty('children') && pNode.children.length > 1) {
                    //sortByTitle(pNode.children, false);
                    var worker = new Worker('sortWorker.js');
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
                                            if (nodesProcessed === totalNodes) {
                                                console.log("pNodes: Reorder completed");
                                                //reorderBtn.style.display = "block";
                                                //statusTxt.style.display = "none";
                                                //localStorage.removeItem('boStatus');
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
                                            if (nodesProcessed === totalNodes) {
                                                console.log("pNodes: Reorder completed");
                                                //reorderBtn.style.display = "block";
                                                //statusTxt.style.display = "none";
                                                //localStorage.removeItem('boStatus');
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
                    worker.postMessage('Hello world');
                    worker.postMessage({'action': 'sort', 'type': 'request', 'node': pNode, 'args': {'isRecursive': false}});
                }
            });
        }
    }
    xhr.open("GET", chrome.extension.getURL('bookmark.js'), true);
    xhr.send();
}
