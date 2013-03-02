// bookmarks organizer
// (c) 2013 kadaj

// class
function BookmarksOrganizer() {}

BookmarksOrganizer.prototype = (function () {
    // private
    var BOOKMARKS_BAR_ID = "1",
        OTHER_BOOKMARKS_ID = "2";
    // public
    return {
        // Retrieves all bookmarks
        // @param {function} callback
        // @return Array with the root node containing BookmarkTreeNodes
        getAllBookmarks: function (callback) {
            console.log("bo: getAllBookmarks");
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
        // Retrives all the bookmarks in the Bookmarks bar
        // @param {function} callback
        getAllBookmarksInBookmarksBar: function (callback) {
            if (typeof callback !== "function") throw new Error("callback parameter is required");
            chrome.bookmarks.getSubTree(this.getBookmarksBarId(), callback);
        }
    };
})();