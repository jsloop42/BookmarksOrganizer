# Bookmarks Organizer build script

function clean {
    ls bin
    rm -rf bin/*
    ls bin
}

function copyFiles {
    local dest="bin"
    tar -cvf bo.tar * -X buildExcludes
    mkdir -p $dest
    tar -xvf bo.tar -C $dest/
    rm -f bo.tar
}

clean
copyFiles
