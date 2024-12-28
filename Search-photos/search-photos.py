import boto3
import requests
from requests.auth import HTTPBasicAuth
import json  # Import the JSON module for encoding responses

# OpenSearch configuration
region = 'us-east-1'
opensearch_domain_endpoint = "*ENDPOINT URL"
opensearch_username = "ID"
opensearch_password = "Password"

def lambda_handler(event, context):
    # Extract the query parameter 
    query = event.get("queryStringParameters", {}).get("q", "")
    if not query:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing search query parameter 'q'."})
        }
    
    # Build the OpenSearch query
    url = f"{opensearch_domain_endpoint}/photos/_search"
    headers = {"Content-Type": "application/json"}
    search_query = {
        "query": {
            "match": {
                "labels": query
            }
        }
    }
    
    # Execute the query
    response = requests.get(
        url,
        headers=headers,
        json=search_query,
        auth=HTTPBasicAuth(opensearch_username, opensearch_password)
    )
    
    if response.status_code != 200:
        return {
            "statusCode": response.status_code,
            "body": json.dumps({"error": response.text})
        }
    
    # Parse and return the search results
    results = response.json()
    hits = results.get("hits", {}).get("hits", [])
    photos = [{"key": hit["_source"]["objectKey"], "labels": hit["_source"]["labels"]} for hit in hits]
    
    return {
        "statusCode": 200,
        "body": json.dumps({
            "query": query,
            "results": photos
        })
    }