#!/bin/bash
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
PASS=0; FAIL=0
ROOT=~/AssetSphere360

check_file() {
  local label="$1"; local path="$2"
  if [ -f "$ROOT/$path" ]; then
    echo -e "${GREEN}✓${NC} $label"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $label — MISSING: $path"
    ((FAIL++))
  fi
}

check_cmd() {
  local label="$1"; local cmd="$2"; local expect="$3"
  local result
  result=$(eval "$cmd" 2>&1)
  if echo "$result" | grep -qE "$expect"; then
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
echo "  AssetSphere 360 — Phase 3 & 4 Test"
echo "════════════════════════════════════════"

echo ""
echo "── Domain Entities ──"
check_file "BaseEntity"      "backend/src/AssetSphere360.Domain/Common/BaseEntity.cs"
check_file "Product"         "backend/src/AssetSphere360.Domain/Entities/Product.cs"
check_file "Category"        "backend/src/AssetSphere360.Domain/Entities/Category.cs"
check_file "Supplier"        "backend/src/AssetSphere360.Domain/Entities/Supplier.cs"
check_file "Warehouse"       "backend/src/AssetSphere360.Domain/Entities/Warehouse.cs"
check_file "StockMovement"   "backend/src/AssetSphere360.Domain/Entities/StockMovement.cs"

echo ""
echo "── Value Objects ──"
check_file "Money"           "backend/src/AssetSphere360.Domain/ValueObjects/Money.cs"
check_file "Address"         "backend/src/AssetSphere360.Domain/ValueObjects/Address.cs"

echo ""
echo "── Interfaces ──"
check_file "IRepository"     "backend/src/AssetSphere360.Domain/Interfaces/IRepository.cs"
check_file "IUnitOfWork"     "backend/src/AssetSphere360.Domain/Interfaces/IUnitOfWork.cs"

echo ""
echo "── Infrastructure ──"
check_file "DbContext"       "backend/src/AssetSphere360.Infrastructure/Persistence/AssetSphereDbContext.cs"
check_file "Repository<T>"   "backend/src/AssetSphere360.Infrastructure/Persistence/Repositories/Repository.cs"
check_file "UnitOfWork"      "backend/src/AssetSphere360.Infrastructure/Persistence/Repositories/UnitOfWork.cs"
check_file "ProductConfig"   "backend/src/AssetSphere360.Infrastructure/Persistence/Configurations/ProductConfiguration.cs"
check_file "SupplierConfig"  "backend/src/AssetSphere360.Infrastructure/Persistence/Configurations/SupplierConfiguration.cs"
check_file "InfrastructureDI" "backend/src/AssetSphere360.Infrastructure/DependencyInjection.cs"

echo ""
echo "── Application ──"
check_file "ApplicationDI"   "backend/src/AssetSphere360.Application/DependencyInjection.cs"

echo ""
echo "── API ──"
check_file "Program.cs"      "backend/src/AssetSphere360.API/Program.cs"
check_file "appsettings.json" "backend/src/AssetSphere360.API/appsettings.json"
check_file "ProductsController" "backend/src/AssetSphere360.API/Controllers/ProductsController.cs"

echo ""
echo "── Build ──"
check_cmd "dotnet build 0 errors" \
  "cd $ROOT && dotnet build 2>&1 | grep -E 'Build (succeeded|failed)'" \
  "Build succeeded"
check_cmd "0 NU1903 warnings" \
  "cd $ROOT && dotnet build 2>&1 | grep -c 'NU1903' || echo 0" \
  "^0$"

echo ""
echo "── EF Migration ──"
check_cmd "Migration file exists" \
  "find $ROOT/backend/src/AssetSphere360.Infrastructure -name '*InitialCreate*.cs' 2>/dev/null | wc -l" \
  "[1-9]"
check_cmd "Tables exist in DB" \
  "sqlcmd -S localhost -U SA -P 'ThunderBird79' -C \
   -Q \"USE AssetSphere360_DB; SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES\" \
   -h -1 2>&1 | tr -d ' '" \
  "[1-9]"

echo ""
echo "── API Endpoint ──"
# Start API in background, wait, test, kill
echo -e "${YELLOW}⟳${NC} Starting API briefly to test endpoint..."
cd "$ROOT/backend/src/AssetSphere360.API"
dotnet run --no-build &
API_PID=$!
sleep 5

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:5000/api/v1/products 2>/dev/null || echo "000")

kill $API_PID 2>/dev/null
wait $API_PID 2>/dev/null
cd "$ROOT"

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓${NC} GET /api/v1/products → HTTP 200"
  ((PASS++))
else
  echo -e "${RED}✗${NC} GET /api/v1/products → HTTP $HTTP_STATUS (expected 200)"
  ((FAIL++))
fi

echo ""
echo "── Swagger UI ──"
SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:5000/swagger/index.html 2>/dev/null || echo "000")
# API already killed — just check if swagger.json exists
check_cmd "Swagger configured in Program.cs" \
  "grep -c 'UseSwagger' $ROOT/backend/src/AssetSphere360.API/Program.cs" \
  "[1-9]"

echo ""
echo "════════════════════════════════════════"
echo "  Results: ${GREEN}${PASS} passed${NC}  ${RED}${FAIL} failed${NC}"
echo "════════════════════════════════════════"
[ $FAIL -eq 0 ] && \
  echo -e "${GREEN}Phase 3 & 4 PASSED ✓${NC}" || \
  echo -e "${RED}Phase 3 & 4 FAILED — fix above before Phase 5${NC}"
