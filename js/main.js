// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
    // Select all elements with the class "selectable-icon"
    const icons = document.querySelectorAll(".selectable-icon");
    // Retrieve entries from localStorage or initialize an empty array
    const entries = JSON.parse(localStorage.getItem("entries")) || [];
     // Initialize variables for pagination
    let currentPage = 1;
    const entriesPerPage = 6;
    let entriesVisible = false;

   // Function to render a specific page of entries
    function renderDecryptedEntries(page) {
    const entryContainer = document.querySelector(".entries-container");
    entryContainer.innerHTML = "";

    const startIndex = (page - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const reversedEntries = entries.slice().reverse();

    // Retrieve the key used during registration
    const storedKey = localStorage.getItem('key');

    for (let i = startIndex; i < Math.min(endIndex, reversedEntries.length); i++) {
        const encryptedEntry = reversedEntries[i];
        // Decrypt entry data using the stored key
        const decryptedEntry = {
            description: CryptoJS.AES.decrypt(encryptedEntry.description, storedKey).toString(CryptoJS.enc.Utf8),
            pin: CryptoJS.AES.decrypt(encryptedEntry.pin, storedKey).toString(CryptoJS.enc.Utf8),
            icons: CryptoJS.AES.decrypt(encryptedEntry.icons, storedKey).toString(CryptoJS.enc.Utf8).split(','),
            date: CryptoJS.AES.decrypt(encryptedEntry.date, storedKey).toString(CryptoJS.enc.Utf8),
            time: CryptoJS.AES.decrypt(encryptedEntry.time, storedKey).toString(CryptoJS.enc.Utf8),
            temperature: CryptoJS.AES.decrypt(encryptedEntry.temperature, storedKey).toString(CryptoJS.enc.Utf8),
            weather: CryptoJS.AES.decrypt(encryptedEntry.weather, storedKey).toString(CryptoJS.enc.Utf8),
        };
        

        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");

        // Create a new div element to display weather information
        const weatherDiv = document.createElement("div");
        // Set the class name for styling purposes
        weatherDiv.className = "entry-weather";
        // Set the inner HTML content of the div to the decrypted weather information
        weatherDiv.innerHTML = `${decryptedEntry.weather}`;
        // Append the weather div to the entry div, assuming entryDiv is previously defined
        entryDiv.appendChild(weatherDiv);

        const entryTitle = document.createElement("h2");
        entryTitle.textContent = `Entry ${i + 1}`;
        entryDiv.appendChild(entryTitle);

        const descriptionDiv = document.createElement("div");
        descriptionDiv.className = "entry-description";
        descriptionDiv.innerHTML = `${decryptedEntry.description}`;
        entryDiv.appendChild(descriptionDiv);

        const selectedIconsDiv = document.createElement("div");
        selectedIconsDiv.className = "entry-icons";
        entryDiv.appendChild(selectedIconsDiv);

        decryptedEntry.icons.forEach(iconId => {
            if (iconId) {  // Check if iconId is not empty or undefined
                const iconElement = document.createElement("i");
                iconElement.classList.add("fas", iconId);
                selectedIconsDiv.appendChild(iconElement);
            }
        });

        const statsDiv = document.createElement("div");
        statsDiv.className = "stats";

        const temperatureDiv = document.createElement("div");
        temperatureDiv.className = "entry-temperature";
        temperatureDiv.innerHTML = `${decryptedEntry.temperature}`;
        statsDiv.appendChild(temperatureDiv);

        const dateDiv = document.createElement("div");
        dateDiv.className = "entry-date";
        dateDiv.innerHTML = `${decryptedEntry.date}`;
        statsDiv.appendChild(dateDiv);

        const timeDiv = document.createElement("div");
        timeDiv.className = "entry-time";
        timeDiv.innerHTML = `${decryptedEntry.time}`;
        statsDiv.appendChild(timeDiv);

        entryDiv.appendChild(statsDiv);

        entryContainer.appendChild(entryDiv);
        }
    }
    
    // Function to update pagination buttons
    function updatePagination() {
        const prevPageButton = document.getElementById("prevPage");
        const nextPageButton = document.getElementById("nextPage");
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage * entriesPerPage >= entries.length;

        // Clear existing page numbers
        const pageNumbers = document.getElementById("pageNumbers");
        pageNumbers.innerHTML = "";

        // Calculate the total number of pages
        const totalPages = Math.ceil(entries.length / entriesPerPage);

        // Create numbered pagination links
        for (let i = 1; i <= totalPages; i++) {
            const pageNumberLink = document.createElement("button");
            pageNumberLink.textContent = i;
            pageNumberLink.addEventListener("click", function () {
                currentPage = i;
                renderDecryptedEntries(currentPage);
                updatePagination();
            });
        
            // Add the "active" class to the current page number
            if (i === currentPage) {
                pageNumberLink.classList.add("active");
            }
        
            pageNumbers.appendChild(pageNumberLink);
        }
    }
    // Hide entry container and pagination if entries are not visible
    if (!entriesVisible) {
        const entryContainer = document.querySelector(".entry-container");
        const pagination = document.querySelector(".pagination");
        entryContainer.style.display = "none";
        pagination.style.display = "none";
    }
    // Initialize pagination
    updatePagination();

    // Event listener for selecting icons
    icons.forEach(icon => {
        icon.addEventListener("click", function (event) {
            event.preventDefault();
            icon.classList.toggle("selected");
        });
    });


    // Function to display messages in the pop-up
    const displayPopupMessage = (message, isSuccess = true) => {
    const popupMessage2 = document.getElementById('popup-message2');
    popupMessage2.textContent = message;
    popupMessage2.className = isSuccess ? 'popup-message success' : 'popup-message error';
    popupMessage2.style.display = 'block';

    // Hide the message after 3 seconds (adjust as needed)
    setTimeout(() => {
        popupMessage2.style.display = 'none';
    }, 3000);
};


    // Event listeners for saving and showing/hiding entries
    const saveButton = document.querySelector("input[type=submit]");
    const showButton = document.querySelector("input[type=button]");
    const descriptionTextarea = document.querySelector("textarea");
    const pinInput = document.querySelector("input[type=number]");
    

    // Event listeners for save button entries
    saveButton.addEventListener("click", function (event) {
        event.preventDefault();
        const selectedIcons = Array.from(icons)
            .filter(icon => icon.classList.contains("selected"))
            .map(icon => icon.querySelector('i').classList[1]);
    
        const enteredPin = pinInput.value;
        // Check if the entered PIN matches the stored PIN
    
        // Retrieve the stored and encrypted PIN from local storage
        const storedEncryptedPIN = localStorage.getItem('pin');
        const storedKey = localStorage.getItem('key'); // Retrieve the key used during registration
        const storedPIN = CryptoJS.AES.decrypt(storedEncryptedPIN, storedKey).toString(CryptoJS.enc.Utf8);
    
        if (enteredPin === storedPIN) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
    
                    //Using the coordinates to fetch weather data with temperature in degrees Celsius
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=ce6fe51446ae0a4f06e307a4ed77acb3`)
                        .then(response => response.json())
                        .then(data => {
                            // Create a mapping of weather conditions to Font Awesome icons
                            const weatherIcons = {
                                'Clear': '<img src="images/sun.png" alt="Clear" />', // Sunny Weather
                                'Clouds': '<img src="images/cloudy.png" alt="Cloudy" />', // Cloudy Weather
                                'Snow': '<img src="images/snowy.png" alt="Snowy" />', // Snowy Weather
                                'Rain': '<img src="images/rain.png" alt="Rainy" />', // Rainy Weather
                                'Thunderstorm': '<img src="images/thunderstorm.png" alt="Thunderstorm" />', // Thunderstorm
                                'Drizzle': '<img src="images/partly-cloudy.png" alt="Partly Cloudy" />', // Partly Cloudy Weather
                                'Mist': '<img src="images/mistAndFog.png" alt="Mist" />', // Misty Weather
                                'Fog': '<img src="images/mistAndFog.png" alt="Fog" />', // Foggy Weather
                                'Haze': '<img src="images/haze.png" alt="Haze" />', // Hazy Weather
                                'Windy': '<img src="images/windy.png" alt="Windy" />', // Windy Weather
                            };
    
                            // Encrypt the entry data
                            const encryptedEntry = {
                                description: CryptoJS.AES.encrypt(descriptionTextarea.value, storedKey).toString(),
                                pin: CryptoJS.AES.encrypt(pinInput.value, storedKey).toString(),
                                icons: CryptoJS.AES.encrypt(selectedIcons.join(','), storedKey).toString(),
                                date: CryptoJS.AES.encrypt(new Date().toLocaleDateString(), storedKey).toString(),
                                time: CryptoJS.AES.encrypt(new Date().toLocaleTimeString(), storedKey).toString(),
                                temperature: CryptoJS.AES.encrypt(`${data.main.temp}°C`, storedKey).toString(),
                                weather: CryptoJS.AES.encrypt(`${data.weather[0].main} <br>${weatherIcons[data.weather[0].main]}`, storedKey).toString(),
                            };
                            
    
                            entries.push(encryptedEntry);
                            localStorage.setItem("entries", JSON.stringify(entries));
                           displayPopupMessage("Entry saved successfully!", true);
    
                            // Clear the form fields after successfully saving the entry
                            pinInput.value = '';
                            descriptionTextarea.value = '';
                            icons.forEach(icon => icon.classList.remove("selected"));
                              setTimeout(function () {
                                // Refresh the page
                                location.reload();
                            }, 1500); 
                        })
                        .catch(error => {
                            console.error(error);
                            // Display error message for weather data retrieval
                            displayPopupMessage("Error retrieving weather data.", false);
                        });
                }, function (error) {
                    
                    // Alert the user about the geolocation issue
                    displayPopupMessage("Geolocation is not available or was denied by the user. Need permission to save entries.", false);
                });
            } else {
                
                // Alert the user about the geolocation issue
                displayPopupMessage("Geolocation is not available or was denied by the user. Need permission to save entries.", false);
            }
            
        } else {
            // The entered PIN is incorrect; display an error message
            displayPopupMessage('Incorrect PIN. Please try again.', false);
        }
    });
 
    
 

    // Event listener for the showButton click
    showButton.addEventListener("click", function () {
         // Select the entry container and pagination elements
        const entryContainer = document.querySelector(".entry-container");
        const pagination = document.querySelector(".pagination");
        
        // Toggle visibility of entries and pagination
        if (entriesVisible) {
            // Hide entries and pagination
            entryContainer.style.display = "none";
            pagination.style.display = "none";
            showButton.value = "Show Entries";
        } else {
            // Show entries and pagination
            entryContainer.style.display = "flex";
            pagination.style.display = "flex";
            // Decrypt and render entries
            renderDecryptedEntries(currentPage);
            showButton.value = "Hide Entries";
            
        }
        // Toggle the entries visibility flag
        entriesVisible = !entriesVisible;
    });
    
    // Select previous and next page buttons
    const prevPageButton = document.getElementById("prevPage");
    const nextPageButton = document.getElementById("nextPage");
    
    // Event listener for the previous page button click
    prevPageButton.addEventListener("click", function () {
        // Check if there's a previous page
        if (currentPage > 1) {
            // Decrement current page, render entries, and update pagination
            currentPage--;
            renderDecryptedEntries(currentPage);
            updatePagination();
        }
    });
    // Event listener for the next page button click
    nextPageButton.addEventListener("click", function () {
        // Check if there's a next page
        if (currentPage * entriesPerPage < entries.length) {
             // Increment current page, render entries, and update pagination
            currentPage++;
            renderDecryptedEntries(currentPage);
            updatePagination();
        }
    });

    // Deselect all icons when the page loads
    icons.forEach(icon => {
        icon.classList.remove("selected");
    });

   
const shareButton = document.getElementById("shareEntries");

// Event listener for sharing entries
shareButton.addEventListener("click", function () {
    const storedKey = localStorage.getItem('key');
    const storedEncryptedPIN = localStorage.getItem('pin');
    // Prevent the default behavior of the button click
    event.preventDefault();

    // Check if the PIN is correct before sharing
    const enteredPin = prompt("Enter your PIN to share your entries:");

    if (!enteredPin) {
        displayPopupMessage("PIN entry canceled. Share operation aborted.", false);
        return;
    }

    const storedPIN = CryptoJS.AES.decrypt(storedEncryptedPIN, storedKey).toString(CryptoJS.enc.Utf8);

    if (enteredPin === storedPIN) {
        // Retrieve the entries from local storage
        const entriesToShare = JSON.parse(localStorage.getItem("entries"));

        if (!entriesToShare || entriesToShare.length === 0) {
            displayPopupMessage("No entries to share.", false);
            return;
        }

        // Create a Blob containing the JSON data
        const blob = new Blob([JSON.stringify(entriesToShare)], { type: 'application/json' });

        // Ask the user how they want to share the data
        const shareOption = prompt("How would you like to share your entries? (email or download)");

        if (shareOption === null) {
            // User pressed cancel, display a message and abort the share operation
            displayPopupMessage("Share operation canceled.", false);
            return;
        } else if (shareOption.toLowerCase() === 'email') {
            // Convert the Blob to a data URL
            const dataUrl = URL.createObjectURL(blob);

            // Encode the data URL for inclusion in the mailto link
            const encodedDataUrl = encodeURIComponent(dataUrl);

            // Create a mailto link with the encoded data URL as the body
            const mailtoLink = `mailto:?subject=Encrypted%20Entries&body=Please%20find%20attached%20the%20encrypted%20entries%20file.%0D%0A%0D%0A${encodedDataUrl}`;

            // Open the user's default email client
            window.location.href = mailtoLink;
        } else if (shareOption.toLowerCase() === 'download') {
            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'encrypted_entries.json';

            // Append the link to the body and trigger a click
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Clean up
            document.body.removeChild(downloadLink);
        } else {
            // Invalid option, display an error message
            displayPopupMessage("Invalid share option. Please enter 'email' or 'download'.", false);
            return;
        }
    } else {
        // The entered PIN is incorrect; display an error message
        displayPopupMessage('Incorrect PIN. Share operation aborted.', false);
        return;
    }
    });
});
 
