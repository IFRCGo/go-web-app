#!/bin/env bash

set -xe

# Substitute WEB_APP_SERVE_PLACEHOLDER__<VAR> markers with runtime values.
# Based on the base image's default-app-apply-config.sh (handles ^APP_), but
# hardened with two conventions the stock script lacks (see §4 of the playbook).
while IFS='=' read -r KEY VALUE; do
    # Escape sed replacement metacharacters (\, & and the | delimiter) so
    # URLs/tokens containing them substitute literally
    ESCAPED_VALUE=$(printf '%s' "$VALUE" | sed -e 's/[\\&|]/\\&/g')
    find "$DESTINATION_DIRECTORY" -type f \
        -exec sed -i "s|\<WEB_APP_SERVE_PLACEHOLDER__$KEY\>|$ESCAPED_VALUE|g" {} +
done < <(env | grep '^APP_')

# Warn about every placeholder with no runtime value. This surfaces ALL leftover
# markers — including unquoted occurrences the rewrite below intentionally leaves
# in place (e.g. a user-visible index.html <title> marker, CSS). Don't silently
# blank those; make them loud so the operator sets the var or bakes a default.
LEFTOVER_PLACEHOLDERS=$(grep -rho 'WEB_APP_SERVE_PLACEHOLDER__APP_[A-Za-z0-9_]*' "$DESTINATION_DIRECTORY" | sort -u)
if [ -n "$LEFTOVER_PLACEHOLDERS" ]; then
    echo "WARNING: no runtime value for the placeholder(s) below — quoted JS occurrences set to 'undefined'; any unquoted occurrence (e.g. index.html) is left in place:" >&2
    printf '%s\n' "$LEFTOVER_PLACEHOLDERS" | sed 's/^/  - /' >&2
fi

# Rewrite quoted JS markers to real JS `undefined` (falsy) instead of leaking the
# literal marker (a truthy string) into the bundle. overrideDefineForWebAppServe
# emits each marker JSON-stringified, so in the JS bundle it appears quoted
# (`"WEB_APP_SERVE_PLACEHOLDER__APP_X"`); consuming the surrounding quotes yields a
# bare `undefined`. Unquoted occurrences (index.html, CSS) are NOT rewritten by
# design — the warning above flags them; the fix for those is a baked default.
find "$DESTINATION_DIRECTORY" -type f \
    -exec sed -i 's|"WEB_APP_SERVE_PLACEHOLDER__APP_[A-Za-z0-9_]*"|undefined|g' {} +
