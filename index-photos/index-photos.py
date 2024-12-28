import boto3
import time
import logging
from requests.auth import HTTPBasicAuth
import requests
from datetime import datetime

# Logging setup
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# OpenSearch configuration
region = 'us-east-1'
opensearch_domain_endpoint = "*ENDPOINT URL*"
auth = HTTPBasicAuth('ID', 'PASSWORD')

# Initialize Rekognition
rekognition = boto3.client('rekognition', region_name=region)

def lambda_handler(event, context):
    logger.info(f"Received event: {event}")
    
    result = []  # Collect Rekognition results for all records
    
    for record in event['Records']:
        try:
            # Extract bucket and key
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            logger.info(f"Processing file: s3://{bucket}/{key}")
            
            # Rekognition: Detect labels
            try:
                start_rekognition = time.time()
                rekognition_response = rekognition.detect_labels(
                    Image={'S3Object': {'Bucket': bucket, 'Name': key}},
                    MaxLabels=5
                )
                labels = [label['Name'] for label in rekognition_response['Labels']]
                logger.info(f"Labels detected for {key}: {labels}")
                logger.info(f"Rekognition took {time.time() - start_rekognition} seconds")
                
                # Add labels to the result
                result.append({
                    "file": f"s3://{bucket}/{key}",
                    "labels": labels
                })
            except Exception as rek_error:
                logger.error(f"Error during Rekognition for {key}: {rek_error}")
                raise
            
            # OpenSearch: Index document
            try:
                start_opensearch = time.time()
                document = {
                    "objectKey": key,
                    "bucket": bucket,
                    "createdTimestamp": datetime.now().isoformat(),
                    "labels": labels
                }
                response = requests.post(
                    f"{opensearch_domain_endpoint}/photos/_doc/{key}",
                    auth=auth,
                    json=document,
                    headers={"Content-Type": "application/json"}
                )
                logger.info(f"OpenSearch response: {response.status_code} {response.text}")
                if response.status_code not in [200, 201]:
                    logger.error(f"OpenSearch indexing failed for {key}: {response.text}")
                    raise Exception(f"Failed to index document: {response.text}")
                logger.info(f"Document indexed successfully for {key}")
                logger.info(f"OpenSearch indexing took {time.time() - start_opensearch} seconds")
            except Exception as os_error:
                logger.error(f"Error during OpenSearch indexing for {key}: {os_error}")
                raise
        
        except Exception as e:
            logger.error(f"Error processing file {key}: {e}")
    
    return {
        'statusCode': 200,
        'body': result  # Return the collected Rekognition results
    }


