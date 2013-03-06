// bookmarks organizer events.js
// This file is loaded when bookmark events occur
// event.js and main.js has no interaction. They are entirely different files with
// differnt flows.
// (c) 2013 kadaj

var KDJ = {};

KDJ.BO = {
    totalNodes: 0,
    nodesProcessed: 0,
    onBookmarkChange: function (id, node) {
        //KDJ.BO.init(id, node);
        var prevNodeStr = localStorage.getItem('changedNodeEvented'),
            prevNode = {};
        if (prevNodeStr && prevNodeStr != "") {
            prevNode = JSON.parse(prevNodeStr);
            if (node.oldIndex !== prevNode.oldIndex ||
                node.oldParentId !== prevNode.oldParentId ||
                node.parentId !== prevNode.parentId) {
                KDJ.BO.init(id, node);
            }
        } else {
            localStorage.setItem('changedNodeEvented', JSON.stringify(node));
            KDJ.BO.init(id, node);
        }
    },
    init: function (id, node) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
            console.log(e);
            if (e.target.status === 200) {
                eval(e.target.responseText);

                var bm = new Bookmark();
                bm.getBookmarksSubTree(node.parentId, function (node) {
                    var pNode, worker;
                    console.log("parent node %o", node);
                    if (node.length !== 1) throw new Error("Error in obtained parent node");
                    pNode = node[0];
                    console.log("pNode: %o", pNode);
                    if (pNode.hasOwnProperty('children') && pNode.children.length > 1) {
                        //sortByTitle(pNode.children, false);
                        KDJ.BO.totalNodes = KDJ.BO.totalNodes + pNode.children.length;
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
                                                KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                                                console.log("totalNodes %d", KDJ.BO.totalNodes);
                                                console.log("nodesProcessed %d", KDJ.BO.nodesProcessed);
                                                if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
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
                                                KDJ.BO.nodesProcessed = KDJ.BO.nodesProcessed + 1;
                                                console.log("totalNodes %d", KDJ.BO.totalNodes);
                                                console.log("nodesProcessed %d", KDJ.BO.nodesProcessed);
                                                if (KDJ.BO.nodesProcessed === KDJ.BO.totalNodes) {
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
                        worker.postMessage({'action': 'sort', 'type': 'request', 'node': pNode, 'args': {'isRecursive': false}});
                    }
                });
            }
        }
        xhr.open("GET", chrome.extension.getURL('bookmark.js'), true);
        xhr.send();
    }
};

chrome.bookmarks.onMoved.addListener(KDJ.BO.onBookmarkChange);
chrome.bookmarks.onCreated.addListener(KDJ.BO.onBookmarkChange);

//var totalNodes = 0, nodesProcessed = 0;

// function onBookmarkChange (id, node) {
//     debugger;
//     console.log("===0: %o", node);
//     init(id, node);
//     var prevNodeStr = localStorage.getItem('changedNodeEvented'),
//         prevNode = {};
//     if (prevNodeStr && prevNodeStr != "") {
//         prevNode = JSON.parse(prevNodeStr);
//         if (node.oldIndex !== prevNode.oldIndex ||
//             node.oldParentId !== prevNode.oldParentId ||
//             node.parentId !== prevNode.parentId) {
//             init(id, node);
//         }
//     } else {
//         localStorage.setItem('changedNodeEvented', JSON.stringify(node));
//         init(id, node);
//     }
// }

// function init(id, node) {
//     var xhr = new XMLHttpRequest();
//     xhr.onload = function (e) {
//         console.log(e);
//         if (e.target.status === 200) {
//             eval(e.target.responseText);

//             var bm = new Bookmark();
//             bm.getBookmarksSubTree(node.parentId, function (node) {
//                 var pNode, worker;
//                 console.log("parent node %o", node);
//                 if (node.length !== 1) throw new Error("Error in obtained parent node");
//                 pNode = node[0];
//                 console.log("pNode: %o", pNode);
//                 if (pNode.hasOwnProperty('children') && pNode.children.length > 1) {
//                     //sortByTitle(pNode.children, false);
//                     totalNodes = totalNodes + pNode.children;
//                     worker = new Worker('sortWorker.js');
//                     worker.addEventListener('message', function (e) {
//                         console.log("worker: ", e.data);
//                         if (e.data.hasOwnProperty('action') && e.data.hasOwnProperty('type') && e.data.type === "response") {
//                             switch (e.data.action) {
//                             case "sort":
//                                 var result = e.data.result;
//                                 var sortedNode = result.node;
//                                 var args = (function () { return e.data.hasOwnProperty('args') ? e.data.args : {}})();
//                                 switch (result.nodeType) {
//                                 case "leaf":
//                                     try {
//                                         bm.moveBookmarks(sortedNode, function (res) {
//                                             console.log(res);
//                                             if (!res) {
//                                                 // TODO: update status text
//                                                 localStorage.removeItem('boStatus');
//                                                 console.log("err moving");
//                                                 worker.terminate();
//                                                 return false;
//                                             }
//                                             console.log("leaf nodes updated");
//                                             nodesProcessed = nodesProcessed + 1;
//                                             console.log("totalNodes ", totalNodes);
//                                             console.log("nodesProcessed ", nodesProcessed);
//                                             if (nodesProcessed === totalNodes) {
//                                                 console.log("pNodes: Reorder completed");
//                                                 //reorderBtn.style.display = "block";
//                                                 //statusTxt.style.display = "none";
//                                                 //localStorage.removeItem('boStatus');
//                                                 worker.terminate();
//                                             }
//                                         });
//                                     } catch (ex) {
//                                         console.log("leaf node reorder exception: ", ex);
//                                     }
//                                     break;
//                                 case "root":
//                                     try {
//                                         bm.moveBookmarks(sortedNode, function (res) {
//                                             console.log(res);
//                                             if (!res) {
//                                                 // TODO: update status text
//                                                 localStorage.removeItem('boStatus');
//                                                 console.log("err moving");
//                                                 worker.terminate();
//                                                 return false;
//                                             }
//                                             console.log("parent nodes updated");
//                                             nodesProcessed = nodesProcessed + 1;
//                                             console.log("totalNodes ", totalNodes);
//                                             console.log("nodesProcessed ", nodesProcessed);
//                                             if (nodesProcessed === totalNodes) {
//                                                 console.log("pNodes: Reorder completed");
//                                                 //reorderBtn.style.display = "block";
//                                                 //statusTxt.style.display = "none";
//                                                 //localStorage.removeItem('boStatus');
//                                                 worker.terminate();
//                                             }
//                                         });
//                                     } catch (ex) {
//                                         console.log("root node reorder exception: ", ex);
//                                     }
//                                     if (args.hasOwnProperty('isRecursive') && args.isRecursive) {
//                                         for (i = 0; i < sortedNode.length; i++) {
//                                             //console.log("calling sort on children of " + pNodes[i].title);
//                                             worker.postMessage({'action': 'sort', 'type': 'request', 'node': sortedNode, 'args': {'isRecursive': args.isRecursive}});
//                                         }
//                                     }
//                                     break;
//                                 }
//                                 break;
//                             }
//                         }
//                     }, false);
//                     worker.postMessage({'action': 'sort', 'type': 'request', 'node': pNode, 'args': {'isRecursive': false}});
//                 }
//             });
//         }
//     }
//     xhr.open("GET", chrome.extension.getURL('bookmark.js'), true);
//     xhr.send();
// }
