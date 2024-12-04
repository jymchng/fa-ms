# Financial Assistance Management System API Documentation

## Overview
This document outlines the API endpoints for the Financial Assistance Management System, focusing on scheme management, applicant registration, and eligibility checking.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require administrator authentication. Include the authentication token in the request header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. View All Financial Assistance Schemes
Retrieves a list of all available financial assistance schemes.

```http
GET /schemes
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "criteria": {
        "employment_status": "string",
        "marital_status": "string",
        "has_children": boolean,
        "monthly_income": number,
        "age": number
      },
      "benefits": {
        "monthly_payout": number,
        "duration_months": number
      },
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### 2. Add New Applicant
Register a new applicant in the system.

```http
POST /applicants
```

#### Request Body
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "nric": "string",
  "dateOfBirth": "string",
  "employmentStatus": "string",
  "maritalStatus": "string",
  "monthlyIncome": number,
  "householdMembers": [
    {
      "name": "string",
      "relationship": "string",
      "dateOfBirth": "string",
      "employmentStatus": "string",
      "monthlyIncome": number
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "nric": "string",
    "dateOfBirth": "string",
    "employmentStatus": "string",
    "maritalStatus": "string",
    "monthlyIncome": number,
    "householdMembers": [
      {
        "id": "string",
        "name": "string",
        "relationship": "string",
        "dateOfBirth": "string",
        "employmentStatus": "string",
        "monthlyIncome": number
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. Check Applicant's Eligible Schemes
Retrieve a list of schemes that an applicant is eligible for.

```http
GET /applicants/{applicantId}/eligible-schemes
```

#### Response
```json
{
  "success": true,
  "data": {
    "applicant": {
      "id": "string",
      "name": "string"
    },
    "eligibleSchemes": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "benefits": {
          "monthly_payout": number,
          "duration_months": number
        },
        "eligibilityStatus": "ELIGIBLE",
        "matchedCriteria": [
          "employment_status",
          "marital_status"
        ]
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "string",
        "message": "string"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

## Rate Limiting
- Rate limit: 10 requests per minute per IP
- Rate limit headers are included in the response:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Data Validation Rules
1. NRIC must be in valid Singapore format
2. Email must be valid
3. Phone must be valid Singapore number
4. Date of birth must be in ISO format
5. Monthly income must be non-negative
6. Employment status must be one of: "EMPLOYED", "UNEMPLOYED", "STUDENT", "RETIRED"
7. Marital status must be one of: "SINGLE", "MARRIED", "DIVORCED", "WIDOWED"
