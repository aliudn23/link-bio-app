#!/bin/bash

echo "Testing API routes..."
echo ""

BASE_URL="${1:-http://localhost:3000}"

echo "1. Testing GET /api/links (should return 401 Unauthorized)"
curl -s -X GET "$BASE_URL/api/links" | jq -r '.error' || echo "Failed"
echo ""

echo "2. Testing GET /api/links/test123 (should return JSON, not HTML 404)"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/links/test123")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html"; then
    echo "❌ FAILED - Got HTML 404 page"
else
    echo "✓ SUCCESS - Got JSON response"
    echo "$RESPONSE" | jq '.'
fi
echo ""

echo "3. Testing OPTIONS /api/links/test123 (should return 200)"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -X OPTIONS "$BASE_URL/api/links/test123"
echo ""

echo "4. Testing GET /api/public/someuser (should return JSON, not HTML 404)"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/public/someuser")
if echo "$RESPONSE" | grep -q "<!DOCTYPE html"; then
    echo "❌ FAILED - Got HTML 404 page"
else
    echo "✓ SUCCESS - Got JSON response"
    echo "$RESPONSE" | jq '.'
fi
echo ""

echo "Done!"
