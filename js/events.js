// Events
// This file is loaded when bookmark events occur
// event.js and main.js does not interact with each other. They are entirely different files with different flows.
// (c) 2013 kadaj. GNU GPL v3.

var KDJ = {};

KDJ.BO = {
    totalNodes: 0,
    nodesProcessed: 0,
    worker: undefined,
    isImportBegan: false,
    isImportEnded: true,
    onImportBegan: function () {
        console.log("import began");
        KDJ.BO.isImportBegan = true;
        KDJ.BO.isImportEnded = false;
    },
    onImportEnded: function () {
        console.log("import ended");
        KDJ.BO.isImportBegan = false;
        KDJ.BO.isImportEnded = true;
    },
    onBookmarkChange: function (id, node) {
        console.log("change 0");
        var prevNodeStr, prevNode = {};
        KDJ.BO.totalNodes = 0;
        if (!KDJ.BO.isImportBegan && KDJ.BO.isImportEnded) {  // avoid processing bookmarks if import is in progress
            KDJ.BO.init(id, node);
        }
    },
    init: function (id, node) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
            if (e.target.status === 200) {
                eval(e.target.responseText);

                var bm = new Bookmark();
                bm.getBookmarksSubTree(node.parentId, function (node) {
                    var pNode;
                    if (node.length !== 1) throw new Error("Error in obtained parent node");
                    pNode = node[0];
                    if (pNode.hasOwnProperty('children') && pNode.children.length > 1) {
                        xhr = new XMLHttpRequest();
                        xhr.onload = function (e) {
                            if (e.target.status === 200) eval(e.target.responseText);
                            // worker is present in the sortManager that is evaluated in the above step
                            KDJ.BO.worker.postMessage({
                                'action': 'sort',
                                'type': 'request',
                                'node': pNode,
                                'args': {
                                    'isRecursive': false
                                }
                            });
                        }
                        xhr.open('GET', chrome.extension.getURL('js/sortManager.js'), true);
                        xhr.send();
                    }
                });
            }
        }
        xhr.open('GET', chrome.extension.getURL('js/bookmark.js'), true);
        xhr.send();
    },
    onReorderComplete: function () {
        console.log("task completed");
    }
};

chrome.bookmarks.onImportBegan.addListener(KDJ.BO.onBookmarkImportBegan);
chrome.bookmarks.onImportEnded.addListener(KDJ.BO.onBookmarkImportEnded);
chrome.bookmarks.onMoved.addListener(KDJ.BO.onBookmarkChange);
chrome.bookmarks.onCreated.addListener(KDJ.BO.onBookmarkChange);
