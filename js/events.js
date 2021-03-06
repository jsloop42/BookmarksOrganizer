// Events
// This file is loaded when bookmark events occur.
// event.js and main.js does not interact with each other. They are entirely different files with different flows.
// (c) 2013 Jaseem V V. GNU GPL v3.

var KDJ = KDJ || {};
KDJ.BO = KDJ.BO || {};

KDJ.BO = {
    debug: false,
    totalNodes: 0,
    nodesProcessed: 0,
    isImportBegan: false,
    isImportEnded: true,
    bm: new Bookmark(),
    log: function (...args) {
        if (this.debug) console.log.apply(null, args);
    },
    onImportBegan: function () {
        KDJ.BO.isImportBegan = true;
        KDJ.BO.isImportEnded = false;
    },
    onImportEnded: function () {
        KDJ.BO.isImportBegan = false;
        KDJ.BO.isImportEnded = true;
    },
    onBookmarkChange: function (id, node) {
        var prevNodeStr, prevNode = {}, boStatus = localStorage.getItem('boStatus');
        KDJ.BO.totalNodes = 0;
        // Avoid processing bookmarks if import is in progress. Also avoid processing if reorder is triggered from the UI.
        if ((!KDJ.BO.isImportBegan && KDJ.BO.isImportEnded) || (boStatus == null || boStatus == "")) {
            chrome.bookmarks.onMoved.removeListener(KDJ.BO.onBookmarkChange);
            KDJ.BO.init(id, node);
        }
    },
    init: function (id, node) {
        var c = 0;
        if (KDJ.BO.debug) {
            c = localStorage.getItem('n_init_event_js');
            if (c == null || c == "") {
                c = 0;
            } else {
                c = parseInt(c, 10) + 1;
            }
            localStorage.setItem('n_init_event_js', c);
        }        
        KDJ.BO.bm.getBookmarksSubTree(node.parentId, function (node) {
            var pNode;
            if (node.length !== 1) throw new Error("Error in obtained parent node");
            pNode = node[0];
            if (pNode.hasOwnProperty('children') && pNode.children.length > 1) {
                KDJ.BO.worker.postMessage({
                    'action': 'sort',
                    'type': 'request',
                    'node': pNode,
                    'args': {
                        'isRecursive': false
                    }
                });
            }
        });
        chrome.bookmarks.onMoved.addListener(KDJ.BO.onBookmarkChange);
    },
    onReorderComplete: function () {
        //KDJ.BO.worker.terminate();
        KDJ.BO.log("task completed");
    }
};

chrome.bookmarks.onImportBegan.addListener(KDJ.BO.onBookmarkImportBegan);
chrome.bookmarks.onImportEnded.addListener(KDJ.BO.onBookmarkImportEnded);
chrome.bookmarks.onMoved.addListener(KDJ.BO.onBookmarkChange);
chrome.bookmarks.onCreated.addListener(KDJ.BO.onBookmarkChange);
