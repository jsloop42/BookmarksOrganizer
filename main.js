// bookmarks organizer view-controller
// This script is loaded when user clicks on the extension's icon
// (c) 2013 kadaj

var KDJ = {};
KDJ.BO = {
    totalNodes: 0,
    nodesProcessed: 0,
    reorderBtn: [],
    statusTxt: [],
    boState: {},
    onReorderComplete: function () {
        console.log("::task completed");
        KDJ.BO.reorderBtn.style.display = "block";
        KDJ.BO.statusTxt.style.display = "none";
        localStorage.removeItem('boStatus');
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
        KDJ.BO.statusTxt.innerHTML = "Sorting..";
        KDJ.BO.statusTxt.style.display = "block";
    } else {
        KDJ.BO.reorderBtn.style.display = "block";
        KDJ.BO.statusTxt.style.display = "none";
    }

    // reorder click event listener
    KDJ.BO.reorderBtn.addEventListener('click', function (e) {
        localStorage.setItem('boStatus', 'in_progress');
        KDJ.BO.reorderBtn.style.display = "none";
        KDJ.BO.statusTxt.innerHTML = "Sorting..";
        KDJ.BO.statusTxt.style.display = "block";
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
        var worker, xhr;
        console.log(node);
        if (node.hasOwnProperty('children') && node.children.length > 1) {
            KDJ.BO.totalNodes = KDJ.BO.totalNodes + node.children.length;
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
            xhr.open('GET', chrome.extension.getURL('sortManager.js'), true);
            xhr.send();
        }
    }
});
