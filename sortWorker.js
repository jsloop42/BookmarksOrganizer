// worker
var shared = {};
self.addEventListener('message', function (e) {
    var node;
    self.postMessage(e.data);
    if (e.data.hasOwnProperty('action') && e.data.hasOwnProperty('type') && e.data.type === "request") {
        if (e.data.hasOwnProperty('args')) shared.args = e.data.args;
        switch (e.data.action) {
        case "sort":
            node = e.data.node;
            if (node.hasOwnProperty('children') && node.children.length > 1) {
                sortByTitle(node.children);
            }
            break;
        }
    }
}, false);

function sortByTitle(nodes) {
    //console.log("sort by title");
    self.postMessage("sort by title");
    var i = 0,
        args = {},
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
        //console.log("Sorted leafs: %o", leafs);
        args = (shared.hasOwnProperty('args')) ? shared.args : {};
        self.postMessage({'action': 'sort', 'type': 'response', 'result': {'nodeType': 'leaf', 'node': leafs}, 'args': args});
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
            //console.log("Sorted pNodes: %o", pNodes);
            args = (shared.hasOwnProperty('args')) ? shared.args : {};
            self.postMessage({'action': 'sort', 'type': 'response', 'result': {'nodeType': 'root', 'node': pNodes}, 'args': args});
        }
    }
}
