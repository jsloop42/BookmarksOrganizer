// Main
// This script is loaded when user clicks on the extension's icon
// (c) 2013 kadaj

var KDJ = {};
KDJ.BO = {
    totalNodes: 0,
    nodesProcessed: 0,
    reorderBtn: [],
    statusTxt: [],
    boState: {},
    onReorderComplete: function (e) {
        KDJ.BO.reorderBtn.style.display = "block";
        KDJ.BO.statusTxt.style.display = "none";
        localStorage.removeItem('boStatus');
    },
    onReorderError: function (err) {
        KDJ.BO.reorderBtn.style.display = "none";
        KDJ.BO.statusTxt.style.display = "block";
        localStorage.removeItem('boStatus');
        if (err && err.hasOwnProperty('errCode')) {
            switch (err.errCode) {
            case 1:
                KDJ.BO.statusTxt.innerHTML = "Maximum write operations for the API exceeded. Try later.";
                break;
            case 2:
                KDJ.BO.statusTxt.innerHTML = "Error reordering";
                break;
            }
        }

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
        localStorage.setItem('boStatus', 'in_progress');
        KDJ.BO.reorderBtn.style.display = "none";
        KDJ.BO.statusTxt.innerHTML = "Reorder in progress..";
        KDJ.BO.statusTxt.style.display = "block";

        var bbNodes = [];
        //console.log("max writes per min: " , bm.getMaxSustainedWritesPerMin());
        //console.log("max writes per hour: ", bm.getMaxWritesPerHour());
        chrome.bookmarks.MAX_WRITE_OPERATIONS_PER_HOUR = 60000;             //read only?
        chrome.bookmarks.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE = 1000;  //read only?

        bm.getBookmarksBarNode(onBookmarksObtained);
        bm.getOtherBookmarksNode(onBookmarksObtained);

        function onBookmarksObtained (bNodes) {
            if (bNodes.length === 1) bbNodes = bNodes[0];
            else throw new Error("Error getting bookmarks");
            if (bbNodes.hasOwnProperty('children') && bbNodes.children.length > 1) {
                init(bbNodes);
            }
        }
    });

    function init (node) {
        var worker, xhr;
        if (node.hasOwnProperty('children') && node.children.length > 1) {
            xhr = new XMLHttpRequest();
            xhr.onload = function (e) {
                if (e.target.status === 200) eval(e.target.responseText);
                // worker is present in the sortManager that is evaluated in the above step
                worker.postMessage({
                    'action': 'sort',
                    'type': 'request',
                    'node': node,
                    'args': {
                        'isRecursive': true
                    }
                });
            }
            xhr.open('GET', chrome.extension.getURL('js/sortManager.js'), true);
            xhr.send();
        }
    }
});
