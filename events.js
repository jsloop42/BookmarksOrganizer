var totalNodes = 0, nodesProcessed = 0;

function moveBookmarks (nodes, callback) {
    var i, nodeElem;
    for (i in nodes) {
        nodeElem = nodes[i];
        chrome.bookmarks.move(nodeElem.id, {
            'parentId': nodeElem.parentId,
            'index': nodeElem.index
        }, function (res) {
            if (typeof callback === "function") callback(res);
        });
    }
}

// @param {boolean} Recursive sort for the nodes with children. Defaults to false.
function sortByTitle(nodes, isRecursive) {
    console.log("sort by title");
    var i = 0,
        leafs = [],             // will contain leaf nodes (no children)
        pNodes = [],            // will contains parent nodes (has children)
        nodeElem = undefined,   // will contain a node
        len = 0,                // will contain the total number of children in the nodes
        beginIndex = 0,         // will contain the begin index for leaf nodes
        aTitle = "",            // title of the first elem in sorting two elems
        bTitle = "";            // title of the second elem in sorting
    isRecursive || false;
    totalNodes = totalNodes + nodes.length;
    if (nodes && nodes.length > 0) {
        len = nodes.length;
        for (i in nodes) {
            nodeElem = nodes[i];
            if (nodeElem.hasOwnProperty('children')) {
                pNodes.push(nodeElem);
            } else {
                // sorts leaf
                leafs.push(nodeElem);
            }
        }
        // sort array containing leaf objects
        aTitle = "";
        bTitle = "";
        leafs = leafs.sort(function (a, b) {
            aTitle = a.title.toLowerCase();
            bTitle = b.title.toLowerCase();
            return aTitle < bTitle ? -1 : aTitle > bTitle ? 1 : 0;
        });
        beginIndex = len - leafs.length;
        for (i = 0; i < leafs.length; i++) {
            leafs[i].index = beginIndex;
            beginIndex = beginIndex + 1;
        }
        console.log("Sorted leafs: %o", leafs);
        try {
            moveBookmarks(leafs, function (res) {
                console.log(res);
                if (!res) {
                    // TODO: update status text
                    localStorage.removeItem('boStatus');
                    console.log("err moving");
                    return false;
                }
                console.log("leaf nodes updated");
                nodesProcessed = nodesProcessed + 1;
                if (nodesProcessed === totalNodes) {
                    console.log("pNodes: Reorder completed");
                    reorderBtn.style.display = "block";
                    statusTxt.style.display = "none";
                    localStorage.removeItem('boStatus')
                }
            });
        } catch (ex) {
            console.log("l:Exception: ", ex);
        }
        if (pNodes.length > 0) {
            aTitle = "";
            bTitle = "";
            pNodes = pNodes.sort(function (a, b) {
                aTitle = a.title.toLowerCase();
                bTitle = b.title.toLowerCase();
                return aTitle < bTitle ? -1 : aTitle > bTitle ? 1 : 0;
            });
            for (i = 0; i < pNodes.length; i++) {
               pNodes[i].index = i;
            }
            console.log("Sorted pNodes: %o", pNodes);
            try {
                moveBookmarks(pNodes, function (res) {
                    console.log(res);
                    if (!res) {
                        // TODO: update status text
                        localStorage.removeItem('boStatus');
                        console.log("err moving");
                        return false;
                    }
                    console.log("parent nodes updated: " + res.title);
                    nodesProcessed = nodesProcessed + 1;
                    if (nodesProcessed === totalNodes) {
                        console.log("pNodes: Reorder completed");
                        reorderBtn.style.display = "block";
                        statusTxt.style.display = "none";
                        localStorage.removeItem('boStatus');
                    }
                });
            } catch (ex) {
                console.log("p:Exception: ", ex);
            }
            if (isRecursive) {
                for (i=0; i < pNodes.length; i++) {
                    console.log("calling sort on children of " + pNodes[i].title);
                    sortByTitle(pNodes[i].children);
                }
            }
        }
    }
}

chrome.bookmarks.onMoved.addListener(function (id, node) {
    node.event = "onMoved";
    // chrome.bookmarks.getSubTree(res.parentId, function (node) {
    //     var pNode;
    //     console.log("parent node %o", node);
    //     if (node.length !== 1) throw new Error("Error in obtained parent node");
    //     pNode = node[0];
    //     console.log("pNode: %o", pNode);
    //     if (pNode.hasOwnProperty('children') && pNode.children.length > 1) {
    //         sortByTitle(pNode.children, false);
    //     }
    // });

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
                                                return false;
                                            }
                                            console.log("leaf nodes updated");
                                            nodesProcessed = nodesProcessed + 1;
                                            if (nodesProcessed === totalNodes) {
                                                console.log("pNodes: Reorder completed");
                                                //reorderBtn.style.display = "block";
                                                //statusTxt.style.display = "none";
                                                //localStorage.removeItem('boStatus')
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
                                                return false;
                                            }
                                            console.log("parent nodes updated");
                                            nodesProcessed = nodesProcessed + 1;
                                            if (nodesProcessed === totalNodes) {
                                                console.log("pNodes: Reorder completed");
                                                //reorderBtn.style.display = "block";
                                                //statusTxt.style.display = "none";
                                                //localStorage.removeItem('boStatus');
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
});
