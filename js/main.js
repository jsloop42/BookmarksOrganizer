// Main
// This script is loaded when user clicks on the extension's icon.
// (c) 2013 Jaseem V V. GNU GPL v3.

var KDJ = {};
KDJ.BO = {
    debug: false,
    totalNodes: 0,
    nodesProcessed: 0,
    reorderBtn: [],
    statusTxt: [],
    boState: {},
    bm: new Bookmark(),
    log: function (...args) {
        if (this.debug) console.log.apply(null, args);
    },
    onReorderComplete: function (e) {
        var c;
        KDJ.BO.reorderBtn.style.display = "block";
        KDJ.BO.statusTxt.style.display = "none";
        localStorage.removeItem('boStatus');
        if (KDJ.BO.debug) {
            c = localStorage.getItem('n_onreordercomplete_main_js');
            if (c == null || c == "") {
                c = 0;
            } else {
                c = parseInt(c, 10) + 1;
            }
            localStorage.setItem('n_onreordercomplete_main_js', c);
        }
        //KDJ.BO.worker.terminate();
        KDJ.BO.log("task completed");
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

        KDJ.BO.bm.getBookmarksBarNode(onBookmarksObtained);
        KDJ.BO.bm.getOtherBookmarksNode(onBookmarksObtained);

        function onBookmarksObtained (bNodes) {
            if (bNodes.length === 1) bbNodes = bNodes[0];
            else throw new Error("Error getting bookmarks");
            if (bbNodes.hasOwnProperty('children') && bbNodes.children.length > 1) {
                localStorage.setItem('boStatus', 'in_progress');
                KDJ.BO.reorderBtn.style.display = "none";
                KDJ.BO.statusTxt.innerHTML = "Reorder in progress..";
                KDJ.BO.statusTxt.style.display = "block";
                sortBookmarks(bbNodes);
            }
        }
    });

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
});
