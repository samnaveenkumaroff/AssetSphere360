#!/bin/bash
# Usage: dotnet run 2>&1 | tee /tmp/api.log
# Then in another terminal: bash analyze-logs.sh /tmp/api.log

LOGFILE="${1:-/tmp/api.log}"

if [ ! -f "$LOGFILE" ]; then
  echo "Log file not found: $LOGFILE"
  echo "Usage: dotnet run 2>&1 | tee /tmp/api.log"
  echo "       (in another terminal) bash analyze-logs.sh /tmp/api.log"
  exit 1
fi

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

echo ""
echo "════════════════════════════════════════"
echo "  AssetSphere 360 — Log Analysis"
echo "  File: $LOGFILE ($(wc -l < "$LOGFILE") lines)"
echo "════════════════════════════════════════"

echo ""
echo -e "${RED}── Unhandled Exceptions ──${NC}"
grep -A1 "Unhandled exception" "$LOGFILE" | grep -v "^--$" | sort -u | head -20
EXC_COUNT=$(grep -c "Unhandled exception" "$LOGFILE")
echo "Total: $EXC_COUNT"

echo ""
echo -e "${RED}── Exception Types (deduplicated) ──${NC}"
grep -oP '(?<=Unhandled exception: ).*' "$LOGFILE" | sort -u

echo ""
echo -e "${YELLOW}── HTTP Error Responses (4xx/5xx via GlobalExceptionHandler) ──${NC}"
grep "GlobalExceptionHandler" "$LOGFILE" | sort -u | head -20

echo ""
echo -e "${YELLOW}── fail: log lines ──${NC}"
grep "^fail:" "$LOGFILE" | sort -u | head -20

echo ""
echo -e "${CYAN}── Request Summary (method + path, deduplicated) ──${NC}"
grep -oP '(?<=Executed action ).*?(?= in)' "$LOGFILE" 2>/dev/null | sort | uniq -c | sort -rn | head -10

echo ""
echo -e "${CYAN}── Slow DB Commands (>50ms) ──${NC}"
grep -oP 'Executed DbCommand \(\d+ms\)' "$LOGFILE" | grep -oP '\d+' | awk '$1 > 50' | wc -l | xargs echo "Count over 50ms:"
grep "Executed DbCommand" "$LOGFILE" | grep -oP '\(\d+ms\)' | sort -t'(' -k2 -rn | head -5

echo ""
echo -e "${GREEN}── Server Status ──${NC}"
grep "Now listening on" "$LOGFILE" | tail -1
grep "Application started" "$LOGFILE" | tail -1

echo ""
echo "════════════════════════════════════════"
if [ "$EXC_COUNT" -eq 0 ]; then
  echo -e "${GREEN}No unhandled exceptions found.${NC}"
else
  echo -e "${RED}$EXC_COUNT unhandled exception(s) found — see above.${NC}"
fi
echo "════════════════════════════════════════"
