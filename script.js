// =============================================================================
// DOM ELEMENT REFERENCES
// =============================================================================

const domElements = {
    form: document.getElementById("checkInForm"),
    nameInput: document.getElementById("attendeeName"),
    teamSelect: document.getElementById("teamSelect"),
    attendeeCount: document.getElementById("attendeeCount"),
    progressBar: document.getElementById("progressBar"),
    progressContainer: document.querySelector(".progress-container"),
    greeting: document.getElementById("greeting"),
    attendanceTracker: document.querySelector('.attendance-tracker'),
    attendeeList: document.getElementById("attendeeList"),
    noAttendeesMessage: document.getElementById("noAttendeesMessage")
};

// =============================================================================
// APPLICATION STATE
// =============================================================================

let count = 0;
const maxCount = 50;
let attendees = []; // Array to store attendee information

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Extracts form data from the check-in form
 * @returns {Object} Form data containing name, team, and teamName
 */
function getFormData() {
    return {
        name: domElements.nameInput.value,
        team: domElements.teamSelect.value,
        teamName: domElements.teamSelect.selectedOptions[0].text
    };
}

/**
 * Checks if attendance limit has been reached
 * @returns {boolean} True if limit exceeded
 */
function checkAttendanceLimit() {
    if (count > maxCount) {
        alert("Maximum attendance reached!");
        return true;
    }
    return false;
}

/**
 * Calculates attendance percentage
 * @returns {string} Percentage string (e.g., "50%")
 */
function calculatePercentage() {
    return Math.round((count / maxCount) * 100) + "%";
}

/**
 * Saves attendance data to localStorage
 */
function saveAttendanceData() {
    const attendanceData = {
        count: count,
        waterCount: parseInt(document.getElementById("waterCount").textContent) || 0,
        zeroCount: parseInt(document.getElementById("zeroCount").textContent) || 0,
        powerCount: parseInt(document.getElementById("powerCount").textContent) || 0,
        attendees: attendees,
        timestamp: Date.now()
    };
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

/**
 * Loads attendance data from localStorage
 * @returns {Object|null} Saved attendance data or null if none exists
 */
function loadAttendanceData() {
    try {
        const savedData = localStorage.getItem('attendanceData');
        return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
        console.error('Error loading attendance data:', error);
        return null;
    }
}

/**
 * Restores the UI state from saved data without animations
 */
function restoreAttendanceState() {
    const savedData = loadAttendanceData();
    if (!savedData) return;
    
    // Restore counts
    count = savedData.count || 0;
    
    // Restore attendees array
    attendees = savedData.attendees || [];
    
    // Update UI elements without animations
    domElements.attendeeCount.textContent = count;
    
    // Update progress bar
    const percentage = calculatePercentage();
    domElements.progressBar.style.width = percentage;
    domElements.progressBar.textContent = percentage;
    domElements.progressContainer.setAttribute("data-percentage", percentage);
    
    // Update team counters
    document.getElementById("waterCount").textContent = savedData.waterCount || 0;
    document.getElementById("zeroCount").textContent = savedData.zeroCount || 0;
    document.getElementById("powerCount").textContent = savedData.powerCount || 0;
    
    // Display the attendee list
    displayAttendeeList();
}

/**
 * Clears all saved attendance data
 */
function clearAttendanceData() {
    localStorage.removeItem('attendanceData');
}

/**
 * Adds a new attendee to the list
 * @param {Object} attendeeData - Attendee information
 */
function addAttendee(attendeeData) {
    const attendee = {
        id: Date.now() + Math.random(), // Unique ID
        name: attendeeData.name,
        team: attendeeData.team,
        teamName: attendeeData.teamName,
        timestamp: new Date().toLocaleTimeString()
    };
    
    attendees.push(attendee);
    displayAttendeeList();
}

/**
 * Gets team icon based on team type
 * @param {string} team - Team identifier
 * @returns {string} Team emoji icon
 */
function getTeamIcon(team) {
    const icons = {
        'water': '🌊',
        'zero': '🌿',
        'power': '⚡'
    };
    return icons[team] || '👥';
}

/**
 * Displays the list of checked-in attendees
 */
function displayAttendeeList() {
    const listContainer = domElements.attendeeList;
    const noAttendeesMsg = domElements.noAttendeesMessage;
    
    if (attendees.length === 0) {
        noAttendeesMsg.style.display = 'block';
        // Remove any existing attendee items
        const existingItems = listContainer.querySelectorAll('.attendee-item');
        existingItems.forEach(item => item.remove());
        return;
    }
    
    // Hide no attendees message
    noAttendeesMsg.style.display = 'none';
    
    // Clear existing items
    const existingItems = listContainer.querySelectorAll('.attendee-item');
    existingItems.forEach(item => item.remove());
    
    // Add each attendee to the list
    attendees.forEach((attendee, index) => {
        const attendeeItem = document.createElement('div');
        attendeeItem.className = `attendee-item ${attendee.team}`;
        attendeeItem.style.animation = 'slideInAttendee 0.3s ease';
        attendeeItem.style.animationDelay = `${index * 0.05}s`;
        
        attendeeItem.innerHTML = `
            <span class="attendee-name">${attendee.name}</span>
            <span class="attendee-team">
                <span class="attendee-team-icon">${getTeamIcon(attendee.team)}</span>
                ${attendee.teamName.replace('Team ', '')}
            </span>
        `;
        
        listContainer.appendChild(attendeeItem);
    });
}

// =============================================================================
// ANIMATION FUNCTIONS
// =============================================================================

/**
 * Animates the main attendance counter with bounce effect
 */
function animateAttendanceCount() {
    const element = domElements.attendeeCount;
    element.textContent = count;
    
    // Standard bounce animation
    element.style.transform = "scale(1.3)";
    element.style.color = "#00c4a7";
    element.style.transition = "all 0.3s ease";
    
    setTimeout(() => {
        element.style.transform = "scale(1)";
        element.style.color = "";
    }, 300);
}

/**
 * Creates milestone celebration effects (every 10th attendee)
 */
function celebrateMilestone() {
    if (count % 10 !== 0) return;
    
    const element = domElements.attendeeCount;
    
    // Special milestone animation
    element.style.color = "#ff6b35";
    element.style.transform = "scale(1.5)";
    
    // Create celebration stars
    createCelebrationStars();
    
    setTimeout(() => {
        element.style.color = "";
        element.style.transform = "scale(1)";
    }, 500);
}

/**
 * Updates and animates the progress bar
 */
function updateProgressBar() {
    const percentage = calculatePercentage();
    const progressBar = domElements.progressBar;
    const progressContainer = domElements.progressContainer;
    
    // Update progress bar with smooth animation
    progressBar.style.transition = "width 0.5s ease, box-shadow 0.3s ease";
    progressBar.style.width = percentage;
    progressBar.textContent = percentage;
    
    // Update data attribute for the container's ::after element
    progressContainer.setAttribute("data-percentage", percentage);
    
    // Add pulse effect
    progressBar.style.boxShadow = "0 0 20px rgba(0, 196, 167, 0.7)";
    setTimeout(() => {
        progressBar.style.boxShadow = "";
    }, 600);
}

/**
 * Updates team counter with bounce animation
 * @param {string} team - Team identifier (water, zero, power)
 */
function updateTeamCount(team) {
    const teamCounter = document.getElementById(team + "Count");
    const newTeamCount = parseInt(teamCounter.textContent) + 1;
    teamCounter.textContent = newTeamCount;
    
    // Add bounce effect to team counter
    teamCounter.style.transform = "scale(1.2)";
    teamCounter.style.transition = "transform 0.2s ease";
    
    setTimeout(() => {
        teamCounter.style.transform = "scale(1)";
    }, 200);
}

/**
 * Displays welcome message with slide-in animation
 * @param {string} name - Attendee name
 * @param {string} teamName - Full team name
 */
function showWelcomeMessage(name, teamName) {
    const message = `Welcome ${name} from ${teamName}!`;
    const greetingElement = domElements.greeting;
    
    // Set up message and initial styles
    greetingElement.innerHTML = message;
    greetingElement.style.display = "block";
    greetingElement.style.opacity = "0";
    greetingElement.style.transform = "translateY(-20px)";
    greetingElement.style.transition = "all 0.4s ease";
    
    // Animate in
    setTimeout(() => {
        greetingElement.style.opacity = "1";
        greetingElement.style.transform = "translateY(0)";
    }, 50);
    
    // Hide the message after 3 seconds with fade out
    setTimeout(() => {
        greetingElement.style.opacity = "0";
        greetingElement.style.transform = "translateY(-20px)";
        setTimeout(() => {
            greetingElement.style.display = "none";
        }, 400);
    }, 3000);
}

/**
 * Creates celebration stars effect for milestone achievements
 */
function createCelebrationStars() {
    const attendanceTracker = domElements.attendanceTracker;
    
    for (let i = 0; i < 6; i++) {
        const star = document.createElement('div');
        star.innerHTML = '⭐';
        star.style.position = 'absolute';
        star.style.fontSize = '20px';
        star.style.pointerEvents = 'none';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = '50%';
        star.style.transform = 'translate(-50%, -50%)';
        star.style.animation = `starFall 1s ease-out forwards`;
        star.style.animationDelay = i * 0.1 + 's';
        
        attendanceTracker.style.position = 'relative';
        attendanceTracker.appendChild(star);
        
        // Remove star after animation
        setTimeout(() => {
            star.remove();
        }, 1000 + i * 100);
    }
}

// =============================================================================
// MAIN PROCESSING FUNCTION
// =============================================================================

/**
 * Processes a check-in submission with all animations and updates
 * @param {Object} formData - Form data from getFormData()
 */
function processCheckIn(formData) {
    // Increment counter
    count++;

    checkAttendanceLimit();
    
    // Add attendee to the list
    addAttendee(formData);
    
    // Update all UI elements with animations
    animateAttendanceCount();
    celebrateMilestone();
    updateProgressBar();
    updateTeamCount(formData.team);
    showWelcomeMessage(formData.name, formData.teamName);
    
    // Save attendance data to localStorage
    saveAttendanceData();
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handles form submission event
 * @param {Event} event - Form submission event
 */
function handleFormSubmission(event) {
    event.preventDefault();
    
    const formData = getFormData();
    processCheckIn(formData);
    
    // Reset form
    domElements.form.reset();
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Restore saved attendance data on page load
restoreAttendanceState();

// Set up event listeners
domElements.form.addEventListener("submit", handleFormSubmission);