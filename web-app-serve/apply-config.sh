#!/bin/env bash

set -xe

# Substitute WEB_APP_SERVE_PLACEHOLDER__<VAR> markers with runtime values.
# Based on the base image's default-app-apply-config.sh (which handles ^APP_),
# but hardened with two conventions the stock script lacks:
#   1. sed replacement metacharacters are escaped so values substitute literally;
#   2. unfilled placeholders are blanked after the loop so an omitted var
#      resolves to "" instead of leaking the literal marker into the bundle.
# The stock script only substitutes vars that are SET and never blanks unfilled
# markers, so an unset var (e.g. APP_TITLE) leaked the literal placeholder into
# the served index.html/JS. This restores the old nginx-serve semantics
# (unconditional sed → unset == "").
while IFS='=' read -r KEY VALUE; do
    # Escape sed replacement metacharacters (\, & and the | delimiter) so
    # URLs/tokens containing them substitute literally
    ESCAPED_VALUE=$(printf '%s' "$VALUE" | sed -e 's/[\\&|]/\\&/g')
    find "$DESTINATION_DIRECTORY" -type f \
        -exec sed -i "s|\<WEB_APP_SERVE_PLACEHOLDER__$KEY\>|$ESCAPED_VALUE|g" {} +
done < <(env | grep '^APP_')

# Blank unfilled placeholders so a variable omitted at runtime resolves to ""
# (falsy) instead of leaking the literal marker (a truthy string) into the bundle
find "$DESTINATION_DIRECTORY" -type f \
    -exec sed -i 's|WEB_APP_SERVE_PLACEHOLDER__APP_[A-Za-z0-9_]*||g' {} +
