#!/bin/bash
set -e
cd /mnt/d/dbo/otclient
rm -f android/app/src/main/assets/data.zip
zip -r android/app/src/main/assets/data.zip data mods modules init.lua otclientrc.lua > /dev/null
echo "data.zip regenerated: $(du -h android/app/src/main/assets/data.zip | cut -f1)"
