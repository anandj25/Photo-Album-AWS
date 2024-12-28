# Photo Album Web Application

This project is a photo album web application that supports natural language searches via text and voice. It is built using AWS services such as Amazon S3, ElasticSearch, Lambda, API Gateway, Amazon Rekognition, and Amazon Transcribe. The application allows users to upload photos, search for them using keywords or sentences, and leverage voice input for an enhanced user experience.

## Features

- **Photo Uploads:**
  - Upload photos with optional custom labels.
  - Automatically index uploaded photos using Amazon Rekognition.

- **Search Capabilities:**
  - Text-based and voice-based search options.
  - Intelligent query handling with Amazon Lex for natural language understanding.
  - Results displayed as per detected labels and keywords.

- **Voice Interaction:**
  - Use Amazon Transcribe to convert speech to text for search queries.

- **API Integration:**
  - RESTful API built with API Gateway to manage photo uploads and search requests.

## Architecture

- **Frontend:**
  - A simple web interface hosted on an Amazon S3 bucket with static website hosting.
  - Integrated with the API Gateway-generated SDK for seamless API communication.

- **Backend Services:**
  - ElasticSearch for indexing and querying photos.
  - Lambda functions for indexing and searching operations.

## How to Use

### Search Photos
1. Enter keywords in the search bar or use the microphone icon for voice-based searches.
2. View the relevant results based on the search query.

### Upload Photos
1. Choose a photo to upload.
2. Optionally add custom labels.
3. Click the upload button to add the photo to the library.

![Application Screenshot](/Output 2.jpg)

## Prerequisites

- AWS account with access to the following services:
  - Amazon S3
  - Amazon Rekognition
  - Amazon Transcribe
  - ElasticSearch
  - Lambda
  - API Gateway

- Node.js and npm (if making frontend changes).

## Setup Instructions

1. **ElasticSearch Setup:**
   - Create an ElasticSearch domain and configure it with a security group.

2. **S3 Buckets:**
   - Create a bucket for storing photos.
   - Create a bucket for hosting the frontend.

3. **Lambda Functions:**
   - Implement `index-photos` function to index images in ElasticSearch.
   - Implement `search-photos` function to handle search queries.

4. **API Gateway:**
   - Create and deploy an API with the following endpoints:
     - `PUT /photos` for uploading photos.
     - `GET /search?q={query}` for searching photos.

5. **Frontend Hosting:**
   - Host the frontend on the S3 bucket configured for static website hosting.
   - Integrate the API SDK into the frontend.

6. **Voice Search Integration:**
   - Use Amazon Transcribe to handle voice input and convert it into text queries.

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** AWS Lambda, Amazon ElasticSearch, Amazon Rekognition, API Gateway
- **Voice Processing:** Amazon Transcribe
- **Hosting:** Amazon S3

## Running the Application

1. Deploy the frontend files to the S3 bucket.
2. Ensure all backend services are running and correctly configured.
3. Access the web application using the S3 bucket URL.

## Future Improvements

- Enhance the UI/UX for better usability.
- Add support for advanced query filters.
- Extend the application to support multiple languages.

## License

This project is licensed under the MIT License.
