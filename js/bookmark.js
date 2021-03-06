// Bookmark model. Interfaces with chrome bookmarks API.
// (c) 2013 Jaseem V V. GNU GPL v3.

function Bookmark() {}

Bookmark.prototype = (function () {
    // @private
    var BOOKMARKS_BAR_ID = "1",
        OTHER_BOOKMARKS_ID = "2";
    // @public
    return {
        // Retrieves all bookmarks
        // @param {function} callback
        // @return Array with the root node containing BookmarkTreeNodes
        getAllBookmarks: function (callback) {
            if (typeof callback !== "function") throw new Error("callback parameter is required");
            chrome.bookmarks.getTree(callback);
        },
        // Get the id of Bookmarks bar
        getBookmarksBarId: function () {
            return BOOKMARKS_BAR_ID; //string
        },
        // Get the id of Other bookmarks
        getOtherBookmarksId: function () {
            return OTHER_BOOKMARKS_ID; //string
        },
        // Returns bookmarks tree for the given id
        // @param {string} id Node id
        // @param {function} callback
        getBookmarksSubTree: function (id, callback) {
            if (typeof callback !== "function") throw new Error("callback parameter is required");
            chrome.bookmarks.getSubTree(id, callback);
        },
        // Retrives all the Bookmarks bar node
        // @param {function} callback
        getBookmarksBarNode: function (callback) {
            if (typeof callback !== "function") throw new Error("callback parameter is required");
            this.getBookmarksSubTree(this.getBookmarksBarId(), callback);
        },
        // Retrives the Other bookmarks node
        // @param {function} callback
        getOtherBookmarksNode: function (callback) {
            if (typeof callback !== "function") throw new Error("callback parameter is required");
            this.getBookmarksSubTree(this.getOtherBookmarksId(), callback);
        },
        // @param {array} nodes
        moveBookmarks: function (nodes, callback) {
            var i, nodeElem;
            if (typeof callback !== "function") throw new Error("callback parameter is required");
            for (i in nodes) {
                nodeElem = nodes[i];
                chrome.bookmarks.move(nodeElem.id, {
                    'parentId': nodeElem.parentId,
                    'index': nodeElem.index
                }, function (res) {
                    callback(res);
                });
            }
        },
        // @param {object} node
        moveBookmark: function (node, callback) {
            chrome.bookmarks.move(node.id, {
                'parentId': node.parentId,
                'index': node.index
            }, function (res) {
                if (typeof callback === "function") callback(res);
            });
        },
        getMaxSustainedWritesPerMin: function () {
            return chrome.bookmarks.MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE;
        },
        getMaxWritesPerHour: function () {
            return chrome.bookmarks.MAX_WRITE_OPERATIONS_PER_HOUR;
        },
        // calls the given callback function on new bookmarks
        // @param {function} callback
        onBookmarksChange: function (callback) {
            if (typeof callback !== "function") throw new Error('callback function is required');
            chrome.bookmarks.onCreated.addListener(function (id, res) {
                res.event = "onCreated";
                callback(id, res);
            });
            chrome.bookmarks.onMoved.addListener(function (id, res) {
                res.event = "onMoved";
                callback(id, res);
            });
        }
    };
})();
