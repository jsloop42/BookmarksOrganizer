// bookmarks organizer view-controller
// (c) 2013 kadaj
document.addEventListener('DOMContentLoaded', function () {
    var reorderBtn = document.querySelector('.reorderBtn'),
        statusTxt = document.querySelector('.statusTxt'),
        boState = {}, totalNodes = 0, nodesProcessed = 0, bm;
    bm = new Bookmark();
    // bookmark status
    boStatus = localStorage.getItem('boStatus');
    if (boStatus && boStatus === "in_progress") {
        reorderBtn.style.display = "none";
        statusTxt.innerHTML = "Sorting..";
        statusTxt.style.display = "block";
    } else {
        reorderBtn.style.display = "block";
        statusTxt.style.display = "none";
    }
    // new bookmark or on move event handler
    bm.onBookmarksChange(function (id, bNode) {
        var parentId;
        console.log("new bookmark created");
        console.log(id);
        console.log(bNode);
        switch (bNode.event) {
        case "onCreated":
            parentId = bNode.parentId;
            break;
        case "onMoved":
            parentId = bNode.parentId;
            break;
        }
        bm.getBookmarksSubTree(bNode.parentId, function (node) {
            var pNode;
            console.log("parent node %o", node);
            if (node.length !== 1) throw new Error("Error in obtained parent node");
            pNode = node[0];
            console.log("pNode: %o", pNode);
            if (pNode.hasOwnProperty('children') && pNode.children.length > 1) {
                sortByTitle(pNode.children, false);
            }
        });
    });

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
                bm.moveBookmarks(leafs, function (res) {
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
                        console.log("leafs: Reorder completed");
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
                    bm.moveBookmarks(pNodes, function (res) {
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

    // reorder click event listener
    reorderBtn.addEventListener('click', function (e) {
        localStorage.setItem('boStatus', 'in_progress');
        reorderBtn.style.display = "none";
        statusTxt.innerHTML = "Sorting..";
        statusTxt.style.display = "block";
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
            if (bbNodes.hasOwnProperty('children') && bbNodes.children.length > 1) {
                sortByTitle(bbNodes.children, true);
            }
        }
    });
});
