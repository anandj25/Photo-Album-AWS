async function uploadPhoto() {
   const fileInput = document.getElementById("uploaded_file");
   const file = fileInput.files[0];
   const customLabels = document.getElementById("custom_labels").value;


   if (!file) {
       alert("Please select a file to upload.");
       return;
   }


   const apiUrl = "https://ia6bfmsy63.execute-api.us-east-1.amazonaws.com/dev2/photos";
   const objectKey = encodeURIComponent(file.name);
   console.log(objectKey);


   try {
       const response = await fetch(`${apiUrl}/${objectKey}`, {
           method: "PUT",
           body: file
       });


       if (response.ok) {
           alert("File uploaded successfully!");
       } else {
           alert(`Failed to upload file. Status: ${response.status}`);
       }
   } catch (error) {
       console.error("Error uploading file:", error);
       alert("An error occurred while uploading the file.");
   }
}


async function textSearch() {
   const query = document.getElementById("search_query").value;
   const apiUrl = "https://4728t2jxvc.execute-api.us-east-1.amazonaws.com/prod/photos?q=" + encodeURIComponent(query);

   try {
       const response = await fetch(apiUrl, { method: "GET" });
       const results = await response.json();
       console.log("API Response:", results);
       displayResults(results);
   } catch (error) {
       console.error("Error searching photos:", error);
   }
}


function displayResults(results) {
   const resultsDiv = document.getElementById("photos_search_results");
   resultsDiv.innerHTML = "";
  
   results.forEach(photo => {
       const img = document.createElement("img");
       img.src = `https://${photo.bucket}.s3.amazonaws.com/${photo.objectKey}`;
       resultsDiv.appendChild(img);
   });
}


function voiceSearch() {
   if (!('webkitSpeechRecognition' in window)) {
       alert("Your browser does not support voice recognition. Please use Google Chrome or another supported browser.");
       return;
   }


   const recognition = new webkitSpeechRecognition();
   recognition.lang = "en-US";
   recognition.interimResults = false;
   recognition.maxAlternatives = 1;


   recognition.onstart = function () {
       console.log("Voice recognition started. Speak now...");
   };


   recognition.onresult = function (event) {
       const transcript = event.results[0][0].transcript;
       console.log(transcript);
       console.log("Voice input recognized: ", transcript);
       document.getElementById("search_query").value = transcript;
       queryLexBot(transcript);
   };


   recognition.onerror = function (event) {
       console.error("Voice recognition error: ", event.error);
       alert("Voice recognition failed. Please try again.");
   };


   recognition.onend = function () {
       console.log("Voice recognition ended.");
   };


   recognition.start();
}


function handleLexQuery() {
   const userInput = document.getElementById('search_query').value;
   console.log(userInput);
   if (userInput.trim() === '') {
       alert("Please enter a query!");
       return;
   }
   queryLexBot(userInput);
}


async function queryLexBot(userInput) {
   const lexRuntime = new AWS.LexRuntime();
   const params = {
       botAlias: 'prod',
       botName: 'searchBot',
       inputText: userInput,
       userId: 'user-1234',
   };

   console.log(params);

   try {
       const response = await lexRuntime.postText(params).promise();
       console.log("Lex response:", response);


       const resultsDiv = document.getElementById('photos_search_results');
       resultsDiv.innerHTML = '';


       if (response.message && response.message.includes("results")) {
           const jsonMatch = response.message.match(/(\[\{.*\}\])/);
           if (jsonMatch) {
               let rawPhotosData = jsonMatch[1];
               console.log("Raw photos data before cleaning:", rawPhotosData);


               let cleanedJSON = rawPhotosData.replace(/'/g, '"');
               console.log("Cleaned JSON string:", cleanedJSON);


               try {
                   const photos = JSON.parse(cleanedJSON);
                   console.log("Parsed photos:", photos);


                   photos.forEach(photo => {
                       const img = document.createElement('img');
                       img.src = `https://${photo.bucket}.s3.amazonaws.com/${photo.objectKey}`;
                       img.alt = photo.objectKey;
                       img.style.maxWidth = '200px';
                       img.style.margin = '10px';
                       resultsDiv.appendChild(img);
                   });
               } catch (err) {
                   console.error("Error parsing JSON:", err);
                   resultsDiv.innerHTML = `<p>Failed to parse photo results. Please try again later.</p>`;
               }
           } else {
               console.error("No valid JSON found in response:", response.message);
               resultsDiv.innerHTML = `<p>Invalid data format received from Lex.</p>`;
           }
       } else {
           resultsDiv.innerHTML = `<p>No results found.</p>`;
       }
   } catch (error) {
       console.error("Error querying Lex:", error);
       alert("An error occurred while processing your request.");
   }
}
