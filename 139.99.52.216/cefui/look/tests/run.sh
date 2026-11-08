#!/bin/sh
# Host tests of the look system's data (no game dependencies). Usage: sh look/tests/run.sh
D="$(cd "$(dirname "$0")" && pwd)"
OUT="${TMPDIR:-/tmp}/looktests.$$"
CXX="${CXX:-g++}"
SAN="${SAN--fsanitize=address,undefined -fno-sanitize-recover=undefined}"
# shellcheck disable=SC2086
$CXX -std=c++20 -O1 -g -Wall -Wextra $SAN "$D/test_look.cpp" "$D/../LookData.cpp" "$D/../LookDress.cpp" "$D/../LookCatalog.gen.cpp" -o "$OUT" || exit 2
"$OUT"
rc=$?
rm -f "$OUT"
exit $rc
