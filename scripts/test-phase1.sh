#!/bin/bash
set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
PASS=0; FAIL=0

check() {
  local label="$1"; local cmd="$2"; local expect="$3"
  local result
  result=$(eval "$cmd" 2>&1 | head -1)
  if echo "$result" | grep -q "$expect"; then
    echo -e "${GREEN}✓${NC} $label → $result"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $label → expected '$expect', got '$result'"
    ((FAIL++))
  fi
}

echo ""
echo "════════════════════════════════════════"
echo "  AssetSphere 360 — Phase 1 Test"
echo "════════════════════════════════════════"

check ".NET SDK 10"        "dotnet --version"                                    "10.0"
check "Node.js 24"         "node --version"                                      "v24"
check "npm 11"             "npm --version"                                       "11"
check "Angular CLI 21"     "ng version 2>/dev/null | grep 'Angular CLI'"         "21"
check "Git 2"              "git --version"                                       "2."
check "Redis PONG"         "redis-cli ping"                                      "PONG"
check "SQL Server running" "systemctl is-active mssql-server"                   "active"
check "sqlcmd works"       "sqlcmd -S localhost -U SA -P 'ThunderBird79' -C \
  -Q 'SELECT 1' -h -1 2>&1 | tr -d ' '"                                         "1"

echo ""
echo "════════════════════════════════════════"
echo "  Results: ${GREEN}${PASS} passed${NC}  ${RED}${FAIL} failed${NC}"
echo "════════════════════════════════════════"
[ $FAIL -eq 0 ] && echo -e "${GREEN}Phase 1 PASSED${NC}" || echo -e "${RED}Phase 1 FAILED — fix above before proceeding${NC}"
