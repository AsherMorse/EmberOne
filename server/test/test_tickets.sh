#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'
YELLOW='\033[1;33m'

# Base URL
BASE_URL="http://localhost:3000/api"

# Test users credentials
ADMIN_EMAIL="test.admin@emberone.com"
ADMIN_PASSWORD="Admin123!"
AGENT_EMAIL="test.agent@emberone.com"
AGENT_PASSWORD="Agent123!"
CUSTOMER_EMAIL="test.customer@example.com"
CUSTOMER_PASSWORD="Customer123!"

# Arrays to store results (parallel arrays)
TEST_NAMES=()
TEST_RESULTS=()
TEST_STATUS_CODES=()
TEST_RESPONSES=()

# Function to sign in and get session token
get_session_token() {
    local email=$1
    local password=$2
    local RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signin" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$email\", \"password\": \"$password\"}")
    
    echo "$RESPONSE" | jq -r '.session.access_token' 2>/dev/null
}

# Function to store test result
store_result() {
    TEST_NAMES+=("$1")
    TEST_RESULTS+=("$2")
    TEST_STATUS_CODES+=("$3")
    TEST_RESPONSES+=("$4")
}

# Function to extract error message
get_error_message() {
    local response="$1"
    local status_code="$2"
    
    # Try to parse error message from JSON response
    local error_msg=$(echo "$response" | jq -r '.error // .message // empty' 2>/dev/null)
    
    # If no JSON error message, try to extract from HTML
    if [ -z "$error_msg" ]; then
        if [[ "$response" == *"<pre>"* ]]; then
            error_msg=$(echo "$response" | grep -o '<pre>.*</pre>' | sed 's/<[^>]*>//g')
        fi
    fi
    
    # If still no message, use status code description
    if [ -z "$error_msg" ]; then
        case $status_code in
            200) error_msg="OK";;
            201) error_msg="Created";;
            400) error_msg="Bad Request";;
            401) error_msg="Unauthorized";;
            403) error_msg="Forbidden";;
            404) error_msg="Not Found";;
            500) error_msg="Server Error";;
            *) error_msg="Status: $status_code";;
        esac
    fi
    
    # Truncate long messages
    if [ ${#error_msg} -gt 50 ]; then
        error_msg="${error_msg:0:47}..."
    fi
    
    echo "$error_msg"
}

# Function to test endpoint
test_endpoint() {
    local description=$1
    local command=$2
    local expected_status=$3

    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Command: $command"
    echo -e "\n${GREEN}Response:${NC}"

    # Execute command and store response
    local RESPONSE=$(eval "$command")
    local STATUS_CODE=$(eval "$command" -o /dev/null -w '%{http_code}')

    # Print response
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    # Check if status code matches expected status
    if [[ "$STATUS_CODE" == "$expected_status" ]]; then
        echo -e "${GREEN}✓ Test passed${NC}"
        store_result "$description" "PASS" "$STATUS_CODE" "$RESPONSE"
    else
        echo -e "${RED}✗ Test failed${NC}"
        store_result "$description" "FAIL" "$STATUS_CODE" "$RESPONSE"
    fi
    
    echo -e "\n${BLUE}------------------------${NC}"

    # Return response for potential use
    echo "$RESPONSE"
}

echo -e "${BLUE}=== Starting Ticket CRUD Tests ===${NC}"

# Get session tokens
echo "Getting session tokens..."
ADMIN_TOKEN=$(get_session_token $ADMIN_EMAIL $ADMIN_PASSWORD)
AGENT_TOKEN=$(get_session_token $AGENT_EMAIL $AGENT_PASSWORD)
CUSTOMER_TOKEN=$(get_session_token $CUSTOMER_EMAIL $CUSTOMER_PASSWORD)

# Test 1: Create ticket as customer
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/tickets" \
-H "Authorization: Bearer $CUSTOMER_TOKEN" \
-H "Content-Type: application/json" \
-d '{"title": "Test Ticket", "description": "This is a test ticket", "priority": "MEDIUM"}')

# Store ticket ID from creation response
TICKET_ID=$(echo "$CREATE_RESPONSE" | jq -r '.ticket.id')
if [ -z "$TICKET_ID" ]; then
    echo -e "${RED}Failed to extract ticket ID from response${NC}"
    echo "Response was: $CREATE_RESPONSE"
    exit 1
fi
echo -e "${GREEN}Created ticket with ID: $TICKET_ID${NC}"

# Log the creation response through test_endpoint for consistency
test_endpoint "Create ticket as customer" "echo '$CREATE_RESPONSE'" "201"

# Test 2: Get ticket list as agent
test_endpoint "Get ticket list as agent" "curl -s -X GET '$BASE_URL/tickets' \
-H 'Authorization: Bearer $AGENT_TOKEN'" "200"

# Test 3: Get specific ticket as admin
test_endpoint "Get specific ticket as admin" "curl -s -X GET '$BASE_URL/tickets/$TICKET_ID' \
-H 'Authorization: Bearer $ADMIN_TOKEN'" "200"

# Test 4: Update ticket as agent
test_endpoint "Update ticket as agent" "curl -s -X PUT '$BASE_URL/tickets/$TICKET_ID' \
-H 'Authorization: Bearer $AGENT_TOKEN' \
-H 'Content-Type: application/json' \
-d '{\"title\": \"Updated Test Ticket\", \"description\": \"This ticket has been updated\", \"priority\": \"HIGH\", \"status\": \"IN_PROGRESS\"}'" "200"

# Test 5: Try to update ticket as customer (should fail)
test_endpoint "Update ticket as customer (should fail)" "curl -s -X PUT '$BASE_URL/tickets/$TICKET_ID' \
-H 'Authorization: Bearer $CUSTOMER_TOKEN' \
-H 'Content-Type: application/json' \
-d '{\"title\": \"Customer Update\", \"description\": \"This should fail\", \"priority\": \"LOW\"}'" "403"

# Test 6: Delete ticket as admin
test_endpoint "Delete ticket as admin" "curl -s -X DELETE '$BASE_URL/tickets/$TICKET_ID' \
-H 'Authorization: Bearer $ADMIN_TOKEN'" "200"

# Test 7: Try to delete ticket as customer (should fail)
test_endpoint "Delete ticket as customer (should fail)" "curl -s -X DELETE '$BASE_URL/tickets/$TICKET_ID' \
-H 'Authorization: Bearer $CUSTOMER_TOKEN'" "403"

# Print test summary
echo -e "\n=== Test Summary ===\n"
printf "%-60s %-20s %s\n" "Test Name" "Result" "Status"
printf "%s\n" "--------------------------------------------------------------------------------"

# Track overall success
PASSED=0
FAILED=0

for i in "${!TEST_NAMES[@]}"; do
    result=${TEST_RESULTS[$i]}
    status=${TEST_STATUS_CODES[$i]}
    test_name="${TEST_NAMES[$i]}"
    
    # Check if this test is expected to fail
    if [[ "$test_name" == *"(should fail)"* ]]; then
        if [ "$result" == "PASS" ]; then
            ((FAILED++))
            result="${RED}FAIL (unexpected pass)${NC}"
        else
            ((PASSED++))
            result="${GREEN}PASS (expected fail)${NC}"
        fi
    else
        if [ "$result" == "PASS" ]; then
            ((PASSED++))
            result="${GREEN}PASS${NC}"
        else
            ((FAILED++))
            result="${RED}FAIL${NC}"
        fi
    fi
    
    # Extract just the first 3-digit number from the response
    status_code=$(echo "$status" | grep -o -m 1 '[0-9]\{3\}' || echo "---")
    
    printf "%-60s %-20b %s\n" "$test_name" "$result" "$status_code"
done

printf "%s\n" "--------------------------------------------------------------------------------"
echo -e "Total Tests: $((PASSED + FAILED))  ${GREEN}Passed: $PASSED${NC}  ${RED}Failed: $FAILED${NC}\n"
echo "=== Test Complete ===" 