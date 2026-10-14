#!/usr/bin/env bash
# Smoke test a Food Rescue HQ deployment. Never places calls or texts.
# Usage: worker/smoke.sh https://foodhq.<subdomain>.workers.dev
set -u
BASE="${1:?base URL}"
# Optional extra curl flags, e.g. CURL_EXTRA="--resolve host:443:1.2.3.4" before DNS has spread.
curl() { command curl ${CURL_EXTRA:-} "$@"; }
pass=0; fail=0
check() { if [ "$2" = "$3" ]; then echo "PASS $1"; pass=$((pass+1)); else echo "FAIL $1 (got: $2, want: $3)"; fail=$((fail+1)); fi; }
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

check "GET / html" "$(curl -s "$BASE/" | grep -c 'id="app"')" "1"
check "GET / versioned main.js" "$(curl -s "$BASE/" | grep -c 'main.js?v=')" "1"
check "GET /main.js versioned import" "$(curl -s "$BASE/main.js" | grep -c 'rescue-chat.js?v=')" "1"
check "GET /rescue-chat.js 200" "$(code "$BASE/rescue-chat.js")" "200"
check "GET /styles.css no-store" "$(curl -sI "$BASE/styles.css" | grep -ci '^cache-control: no-store')" "1"
check "GET /v/abc volunteer page" "$(code "$BASE/v/abc")" "200"
check "GET /api/state 200" "$(code "$BASE/api/state")" "200"
check "GET /api/state no-store" "$(curl -sI "$BASE/api/state" | grep -ci '^cache-control: no-store')" "1"
check "GET /food-rescue-hq/api/state 200" "$(code "$BASE/food-rescue-hq/api/state")" "200"
check "GET /api/nope 404" "$(code "$BASE/api/nope")" "404"
check "GET /api/stream 204" "$(code "$BASE/api/stream")" "204"
check "bad JSON 400" "$(code -X POST -H 'Content-Type: application/json' -d '{bad' "$BASE/api/event")" "400"
check "POST /api/event 201" "$(code -X POST -H 'Content-Type: application/json' -d '{"name":"Smoke test event","venue":"Test hall","items":[{"item":"Tacos","ordered":50}]}' "$BASE/api/event")" "201"
check "event persisted" "$(curl -s "$BASE/api/state" | grep -c '"name":"Smoke test event"')" "1"
check "event persisted (2nd read)" "$(curl -s "$BASE/food-rescue-hq/api/state" | grep -c 'Smoke test event')" "1"
check "PATCH /api/event 200" "$(code -X PATCH -H 'Content-Type: application/json' -d '{"goodForMinutes":45}' "$BASE/api/event")" "200"
check "patch persisted" "$(curl -s "$BASE/api/state" | grep -c '"goodForMinutes":45')" "1"
check "duplicate place 409" "$(code -X POST -H 'Content-Type: application/json' -d '{"name":"Partner shelter A","type":"shelter","distanceMiles":1,"capacity":5,"accepts":["prepared"]}' "$BASE/api/places")" "409"
check "unknown volunteer 404" "$(code -X PATCH -H 'Content-Type: application/json' -d '{"name":"X"}' "$BASE/api/volunteers/nope")" "404"
check "POST /voice/offer TwiML" "$(curl -s -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d 'CallSid=test' "$BASE/voice/offer?offerId=none&volunteerId=none" | grep -c '<Response>')" "1"
check "GET /voice/offer friendly text" "$(curl -s "$BASE/voice/offer" | grep -c 'This address is for Twilio')" "1"
check "POST /sms/inbound TwiML" "$(curl -s -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d 'From=%2B10000000000&Body=YES' "$BASE/sms/inbound" | grep -c '<Message>')" "1"
est=$(curl -s -w " %{http_code}" -X POST -H 'Content-Type: application/json' -d '{"items":[]}' "$BASE/api/estimate")
check "POST /api/estimate no images 400 or not configured" "$(echo "$est" | grep -cE 'Send between 1 and 4 photos.* 400|notConfigured')" "1"
echo "estimate said: $est"
check "reset-all 200" "$(code -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/api/demo/reset-all")" "200"
# With no event the agent answers from its script (no model call).
check "agent message (no event) 200" "$(curl -s -X POST -H 'Content-Type: application/json' -d '{"message":""}' "$BASE/api/agent/message" | grep -c 'Add the event first')" "1"
check "clean after reset" "$(curl -s "$BASE/api/state" | grep -c '"event":null')" "1"
echo "$pass passed, $fail failed"
[ "$fail" = 0 ]
