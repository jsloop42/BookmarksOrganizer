// Main
// This script is loaded when user clicks on the extension's icon
// (c) 2013 kadaj. GNU GPL v3.

var KDJ = {};
KDJ.BO = {
    totalNodes: 0,
    nodesProcessed: 0,
    reorderBtn: [],
    statusTxt: [],
    boState: {},
    worker: undefined,
    onReorderComplete: function (e) {
        KDJ.BO.reorderBtn.style.display = "block";
        KDJ.BO.statusTxt.style.display = "none";
        localStorage.removeItem('boStatus');
        //KDJ.BO.worker.terminate();
        console.log("task completed");
    },
    onReorderError: function (err) {
        KDJ.BO.reorderBtn.style.display = "none";
        KDJ.BO.statusTxt.style.display = "block";
        localStorage.removeItem('boStatus');
        if (err && err.hasOwnProperty('errCode')) {
            switch (err.errCode) {
            case 1:
                KDJ.BO.statusTxt.innerHTML = "Chrome browser API call limit exceeded by the extension. Try later.";
                break;
            case 2:
                KDJ.BO.statusTxt.innerHTML = "Error reordering";
                break;
            }
        }
        return false; // on error stop reordering the rest because most likely, the limit exceeded.
    }
};

document.addEventListener('DOMContentLoaded', function () {
    var bm = new Bookmark();
    KDJ.BO.reorderBtn = document.querySelector('.reorderBtn');
    KDJ.BO.statusTxt = document.querySelector('.statusTxt');

    // bookmark status
    boStatus = localStorage.getItem('boStatus');
    if (boStatus && boStatus === "in_progress") {
        KDJ.BO.reorderBtn.style.display = "none";
        KDJ.BO.statusTxt.innerHTML = "Reorder in progress..";
        KDJ.BO.statusTxt.style.display = "block";
    } else {
        KDJ.BO.reorderBtn.style.display = "block";
        KDJ.BO.statusTxt.style.display = "none";
    }

    // reorder click event listener
    KDJ.BO.reorderBtn.addEventListener('click', function (e) {
        var bbNodes = [];
        //console.log("max writes per min: " , bm.getMaxSustainedWritesPerMin());
        //console.log("max writes per hour: ", bm.getMaxWritesPerHour());

        bm.getBookmarksBarNode(onBookmarksObtained);
        bm.getOtherBookmarksNode(onBookmarksObtained);

        function onBookmarksObtained (bNodes) {
            //console.log(bNodes);
            if (bNodes.length === 1) bbNodes = bNodes[0];
            else throw new Error("Error getting bookmarks");
            if (bbNodes.hasOwnProperty('children') && bbNodes.children.length > 1) {
                localStorage.setItem('boStatus', 'in_progress');
                KDJ.BO.reorderBtn.style.display = "none";
                KDJ.BO.statusTxt.innerHTML = "Reorder in progress..";
                KDJ.BO.statusTxt.style.display = "block";
                init(bbNodes);
            }
        }
    });

    function loadWorker (callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function (e) {
            console.log("manager on loaded");
            //console.log(e.target.status);
            if (e.target.status === 200) eval(e.target.responseText);
            // worker is present in the sortManager that is evaluated in the above step
            if (typeof callback === "function") callback();
        }
        xhr.open('GET', chrome.extension.getURL('js/sortManager.js'), true);
        xhr.send();
    }

    function sortBookmarks (node) {
        KDJ.BO.totalNodes = 0;
        KDJ.BO.worker.postMessage({
            'action': 'sort',
            'type': 'request',
            'node': node,
            'args': {
                'isRecursive': true
            }
        });
    }

    function init (node) {
        if (node.hasOwnProperty('children') && node.children.length > 1) {
            if (!KDJ.BO.worker) {
                loadWorker(function () {
                    sortBookmarks(node);
                });
            } else {
                console.log('manager already loaded');
                sortBookmarks(node);
            }
        }
    }
});
