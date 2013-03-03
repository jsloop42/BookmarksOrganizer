document.addEventListener('DOMContentLoaded', function () {
    var sortBtn = document.querySelector('.sortBtn');
    sortBtn.addEventListener('click', function (e) {
        console.log("button selected");
        var bo, bbId = "", bbNodes = [];
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
                sortByTitle(bbNodes);
            }
        });
        function sortByTitle(nodes) {
            console.log("sort by title");
            var i = 0,
                leafs = [],             // will contain leaf nodes (no children)
                pNodes = [],            // will contains parent nodes (has children)
                nodeElem = undefined,   // will contain a node
                len = 0,                // will contain the total number of children in the nodes
                beginIndex = 0;         // will contain the begin index for leaf nodes
            if (nodes.hasOwnProperty('children') && nodes.children.length > 1) {
                len = nodes.children.length;
                for (i in nodes.children) {
                    nodeElem = nodes.children[i];
                    if (!nodeElem.hasOwnProperty('children')) {
                        // sorts leaf
                        leafs.push(nodeElem);
                    } else {
                        pNodes.push(nodeElem);
                    }
                }
                // sort array containing leaf objects
                leafs = leafs.sort(function (a, b) { return a.title.toLowerCase() > b.title.toLowerCase();} );
                beginIndex = len - leafs.length;
                for (i = 0; i < leafs.length; i++) {
                    leafs[i].index = beginIndex;
                    beginIndex = beginIndex + 1;
                }
                console.log("Sorted leafs: %o", leafs);
                bo.moveBookmarks(leafs, function () {
                    console.log("leaf nodes updated");
                });
            } // else ? (TODO: think later)
        }
        // bo. getOtherBookmarksNode(function (bNodes) {
        //     console.log(bNodes);
        // });
    });
});

