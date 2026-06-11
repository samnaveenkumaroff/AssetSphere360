#!/bin/bash
RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
PASS=0; FAIL=0
ROOT=~/AssetSphere360

check_file() {
  local label="$1"; local path="$2"
  if [ -f "$ROOT/$path" ]; then
    echo -e "${GREEN}✓${NC} $label"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $label — MISSING: $ROOT/$path"
    ((FAIL++))
  fi
}

check_dir() {
  local label="$1"; local path="$2"
  if [ -d "$ROOT/$path" ]; then
    echo -e "${GREEN}✓${NC} $label"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $label — MISSING DIR: $ROOT/$path"
    ((FAIL++))
  fi
}

check_cmd() {
  local label="$1"; local cmd="$2"; local expect="$3"
  local result
  result=$(eval "$cmd" 2>&1)
  if echo "$result" | grep -q "$expect"; then
    echo -e "${GREEN}✓${NC} $label"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $label — expected '$expect'"
    echo "    output: $(echo "$result" | head -3)"
    ((FAIL++))
  fi
}

echo ""
echo "════════════════════════════════════════"
echo "  AssetSphere 360 — Phase 2 Test"
echo "════════════════════════════════════════"

echo ""
echo "── Solution Files ──"
check_file "global.json"         "global.json"
check_file "Solution file"       "AssetSphere360.slnx"
check_file ".gitignore"          ".gitignore"
check_file "README.md"           "README.md"

echo ""
echo "── Backend Projects ──"
check_file "Domain .csproj"      "backend/src/AssetSphere360.Domain/AssetSphere360.Domain.csproj"
check_file "Application .csproj" "backend/src/AssetSphere360.Application/AssetSphere360.Application.csproj"
check_file "Infrastructure .csproj" "backend/src/AssetSphere360.Infrastructure/AssetSphere360.Infrastructure.csproj"
check_file "API .csproj"         "backend/src/AssetSphere360.API/AssetSphere360.API.csproj"
check_file "Tests.Unit .csproj"  "backend/tests/AssetSphere360.Tests.Unit/AssetSphere360.Tests.Unit.csproj"
check_file "Tests.Integration .csproj" "backend/tests/AssetSphere360.Tests.Integration/AssetSphere360.Tests.Integration.csproj"

echo ""
echo "── Frontend ──"
check_dir  "Angular frontend"    "frontend"
check_file "Angular package.json" "frontend/package.json"
check_dir  "node_modules"        "frontend/node_modules"

echo ""
echo "── NuGet Packages ──"
check_cmd "MediatR 14.1.0 in Application" \
  "grep -r 'MediatR' $ROOT/backend/src/AssetSphere360.Application/AssetSphere360.Application.csproj" \
  "14.1.0"
check_cmd "AutoMapper 16.1.1 in Application" \
  "grep -r 'AutoMapper' $ROOT/backend/src/AssetSphere360.Application/AssetSphere360.Application.csproj" \
  "16.1.1"
check_cmd "EF Core 10 in Infrastructure" \
  "grep 'EntityFrameworkCore.SqlServer' $ROOT/backend/src/AssetSphere360.Infrastructure/AssetSphere360.Infrastructure.csproj" \
  "10.0"

echo ""
echo "── Build Check ──"
check_cmd "dotnet build succeeds" \
  "cd $ROOT && dotnet build 2>&1 | tail -2" \
  "Build succeeded"

check_cmd "No NU1903 vulnerabilities" \
  "cd $ROOT && dotnet build 2>&1 | grep -c 'NU1903' || true" \
  "^0$"

echo ""
echo "── Database ──"
check_cmd "AssetSphere360_DB exists" \
  "sqlcmd -S localhost -U SA -P 'ThunderBird79' -C \
   -Q \"SELECT name FROM sys.databases WHERE name='AssetSphere360_DB'\" -h -1 2>&1 | tr -d ' '" \
  "AssetSphere360_DB"

echo ""
echo "── Git ──"
check_cmd "Git remote set"       "cd $ROOT && git remote -v"           "samnaveenkumaroff"
check_cmd "On main branch"       "cd $ROOT && git branch --show-current" "main"

echo ""
echo "════════════════════════════════════════"
echo "  Results: ${GREEN}${PASS} passed${NC}  ${RED}${FAIL} failed${NC}"
echo "════════════════════════════════════════"
[ $FAIL -eq 0 ] && echo -e "${GREEN}Phase 2 PASSED${NC}" || echo -e "${RED}Phase 2 FAILED — fix above before proceeding${NC}"
