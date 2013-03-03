document.addEventListener('DOMContentLoaded', function () {
    var sortBtn = document.querySelector('.sortBtn');
    sortBtn.addEventListener('click', function (e) {
        console.log("button selected");
        var bo, bbId = "", bbNodes = [], worker;
        bo = new BookmarksOrganizer();
        bbId = bo.getBookmarksBarId();
        bo.getAllBookmarks(function (bNodes) {
            console.log(bNodes);
        });
        bo. getBookmarksBarNode(function (bNodes) {
            console.log(bNodes);
            if (bNodes.length === 1) bbNodes = bNodes[0];
            else throw new Error("Error getting bookmarks from Bookmarks bar");
            console.log(bbNodes);
            debugger;
            if (bbNodes.hasOwnProperty('children') && bbNodes.children.length > 1) {
                sortByTitle(bbNodes.children);
            }
        });
        function sortByTitle(nodes) {
            console.log("sort by title");
            var i = 0,
                leafs = [],             // will contain leaf nodes (no children)
                pNodes = [],            // will contains parent nodes (has children)
                nodeElem = undefined,   // will contain a node
                len = 0,                // will contain the total number of children in the nodes
                beginIndex = 0,         // will contain the begin index for leaf nodes
                aTitle = "",            // title of the first elem in sorting two elems
                bTitle = "";            // title of the second elem in sorting
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
                bo.moveBookmarks(leafs, function (res) {
                    console.log("leaf nodes updated");
                });
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
                    bo.moveBookmarks(pNodes, function (res) {
                        console.log("parent nodes updated: " + res.title);
                    });
                    for (i=0; i < pNodes.length; i++) {
                        console.log("calling sort on children of " + pNodes[i].title);
                        sortByTitle(pNodes[i].children);
                    }
                }
                //worker = new Worker('worker.js');
                //worker.addEventListener('message', function (e) {
                //    console.log("message from worker: ", e.data);
                //}, false);
                //// send data to worker
                //worker.postMessage('hello');
            } // else ? (TODO: think later)
        }
        // bo. getOtherBookmarksNode(function (bNodes) {
        //     console.log(bNodes);
        // });
    });
});

