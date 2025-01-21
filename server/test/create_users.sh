#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Base URL
BASE_URL="http://localhost:3000/api"

# Test function to try login
try_login() {
    local email=$1
    local password=$2
    local RESPONSE=$(curl -X POST "$BASE_URL/auth/signin" -H "Content-Type: application/json" -d "{\"email\": \"$email\", \"password\": \"$password\"}")
    if [[ $RESPONSE == *"session"* ]]; then
        echo "Can Login"
        return 0
    else
        echo "Cannot Login"
        return 1
    fi
}

# Test function
test_endpoint() {
    echo -e "\n${BLUE}Testing: $1${NC}"
    echo "Command: $2"
    echo -e "\n${GREEN}Response:${NC}"
    RESPONSE=$(eval $2)
    echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
    echo -e "\n${BLUE}------------------------${NC}"
    
    # Extract email and password from the command
    local email=$(echo "$2" | grep -o '"email": "[^"]*' | cut -d'"' -f4)
    local password=$(echo "$2" | grep -o '"password": "[^"]*' | cut -d'"' -f4)
    
    # Store result for summary
    if [[ $RESPONSE == *"User already registered"* ]]; then
        # Try to login since user exists
        if login_result=$(try_login "$email" "$password"); then
            eval "${1//:/_}_STATUS='Already Exists (Login OK)'"
        else
            eval "${1//:/_}_STATUS='Already Exists (Login Failed)'"
        fi
    elif [[ $RESPONSE == *"\"user\""* && $RESPONSE == *"\"profile\""* ]]; then
        eval "${1//:/_}_STATUS='Created Successfully'"
    else
        eval "${1//:/_}_STATUS='Failed'"
    fi
}

# Create admin user
test_endpoint "Create_Admin_User" "curl -X POST '$BASE_URL/auth/signup' -H 'Content-Type: application/json' -d '{\"email\": \"test.admin@emberone.com\", \"password\": \"Admin123!\", \"role\": \"ADMIN\", \"fullName\": \"Test Admin\"}'"

# Create agent user
test_endpoint "Create_Agent_User" "curl -X POST '$BASE_URL/auth/signup' -H 'Content-Type: application/json' -d '{\"email\": \"test.agent@emberone.com\", \"password\": \"Agent123!\", \"role\": \"AGENT\", \"fullName\": \"Test Agent\"}'"

# Create customer user
test_endpoint "Create_Customer_User" "curl -X POST '$BASE_URL/auth/signup' -H 'Content-Type: application/json' -d '{\"email\": \"test.customer@example.com\", \"password\": \"Customer123!\", \"role\": \"CUSTOMER\", \"fullName\": \"Test Customer\"}'"

# Print summary
echo -e "\n${BLUE}=== User Creation Summary ===${NC}"
echo -e "\nResults:"
echo -e "- Admin (test.admin@emberone.com): ${GREEN}${Create_Admin_User_STATUS}${NC}"
echo -e "- Agent (test.agent@emberone.com): ${GREEN}${Create_Agent_User_STATUS}${NC}"
echo -e "- Customer (test.customer@example.com): ${GREEN}${Create_Customer_User_STATUS}${NC}"

echo -e "\n${GREEN}Test users credentials:${NC}"
echo -e "Admin: test.admin@emberone.com / Admin123!"
echo -e "Agent: test.agent@emberone.com / Agent123!"
echo -e "Customer: test.customer@example.com / Customer123!" 