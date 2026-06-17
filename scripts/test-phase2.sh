#!/bin/bash
RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
PASS=0; FAIL=0
ROOT=~/AssetSphere360

check_file() {
  if [ -f "$ROOT/$2" ]; then echo -e "${GREEN}✓${NC} $1"; ((PASS++))
  else echo -e "${RED}✗${NC} $1 — MISSING: $ROOT/$2"; ((FAIL++)); fi
}
check_dir() {
  if [ -d "$ROOT/$2" ]; then echo -e "${GREEN}✓${NC} $1"; ((PASS++))
  else echo -e "${RED}✗${NC} $1 — MISSING DIR: $ROOT/$2"; ((FAIL++)); fi
}
check_cmd() {
  local result; result=$(eval "$2" 2>&1)
  if echo "$result" | grep -qE "$3"; then echo -e "${GREEN}✓${NC} $1"; ((PASS++))
  else echo -e "${RED}✗${NC} $1 — expected '$3'"; echo "    output: $(echo "$result" | head -3)"; ((FAIL++)); fi
}

echo ""; echo "════════════════════════════════════════"
echo "  AssetSphere 360 — Phase 2 Test"
echo "════════════════════════════════════════"

echo ""; echo "── Solution Files ──"
check_file "global.json" "global.json"
check_file "Solution file" "AssetSphere360.slnx"
check_file ".gitignore" ".gitignore"
check_file "README.md" "README.md"

echo ""; echo "── Backend Projects ──"
check_file "Domain .csproj" "backend/src/AssetSphere360.Domain/AssetSphere360.Domain.csproj"
check_file "Application .csproj" "backend/src/AssetSphere360.Application/AssetSphere360.Application.csproj"
check_file "Infrastructure .csproj" "backend/src/AssetSphere360.Infrastructure/AssetSphere360.Infrastructure.csproj"
check_file "API .csproj" "backend/src/AssetSphere360.API/AssetSphere360.API.csproj"
check_file "Tests.Unit .csproj" "backend/tests/AssetSphere360.Tests.Unit/AssetSphere360.Tests.Unit.csproj"
check_file "Tests.Integration .csproj" "backend/tests/AssetSphere360.Tests.Integration/AssetSphere360.Tests.Integration.csproj"

echo ""; echo "── Frontend ──"
check_dir "Angular frontend" "frontend"
check_file "Angular package.json" "frontend/package.json"
check_dir "node_modules" "frontend/node_modules"

echo ""; echo "── NuGet Packages ──"
check_cmd "MediatR 14.1.0 in Application" "grep 'MediatR' $ROOT/backend/src/AssetSphere360.Application/AssetSphere360.Application.csproj" "14.1.0"
check_cmd "AutoMapper 16.1.1 in Application" "grep 'AutoMapper' $ROOT/backend/src/AssetSphere360.Application/AssetSphere360.Application.csproj" "16.1.1"
check_cmd "EF Core 10 in Infrastructure" "grep 'EntityFrameworkCore.SqlServer' $ROOT/backend/src/AssetSphere360.Infrastructure/AssetSphere360.Infrastructure.csproj" "10.0"

echo ""; echo "── Build Check ──"
BUILD_OUT=$(cd $ROOT && dotnet build --nologo 2>&1)
if echo "$BUILD_OUT" | grep -q "Build succeeded"; then
  echo -e "${GREEN}✓${NC} dotnet build succeeds"; ((PASS++))
else
  echo -e "${RED}✗${NC} dotnet build succeeds"; echo "$BUILD_OUT" | tail -5; ((FAIL++))
fi
WARN_COUNT=$(echo "$BUILD_OUT" | grep -c "NU1903" || true)
if [ "$WARN_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✓${NC} No NU1903 vulnerabilities"; ((PASS++))
else
  echo -e "${RED}✗${NC} NU1903 vulnerabilities found: $WARN_COUNT"; ((FAIL++))
fi

echo ""; echo "── Database ──"
check_cmd "AssetSphere360_DB exists" "sqlcmd -S localhost -U SA -P 'ThunderBird79' -C -Q \"SELECT name FROM sys.databases WHERE name='AssetSphere360_DB'\" -h -1 2>&1 | tr -d ' '" "AssetSphere360_DB"

echo ""; echo "── Git ──"
check_cmd "Git remote set" "cd $ROOT && git remote -v" "samnaveenkumaroff"
check_cmd "On main branch" "cd $ROOT && git branch --show-current" "main"

echo ""; echo "════════════════════════════════════════"
echo "  Results: ${GREEN}${PASS} passed${NC}  ${RED}${FAIL} failed${NC}"
echo "════════════════════════════════════════"
[ $FAIL -eq 0 ] && echo -e "${GREEN}Phase 2 PASSED ✓${NC}" || echo -e "${RED}Phase 2 FAILED${NC}"
