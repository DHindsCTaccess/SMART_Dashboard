const employees = [
    { name: 'Andrea Jesse', team: 'Admin', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Adam Minor', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Andrea Scheid', team: 'Admin', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Chad Bulkowski', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Chris Sanders', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Dan Hinds', team: 'BPA', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Dawn Whitney', team: 'Admin', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Gabriel Scheid', team: 'BPA', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Jillian Wojtczak', team: 'Admin', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Luke Roubik', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Mitchell Milligan', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Mike Ritt', team: 'BPA', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Natanyahu Dunn', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Nate Osmanski', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Ray Schweissinger', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Taylor Gutzmann', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Tom Paul', team: 'Admin', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Tom Wielenbeck', team: 'BPA', progress: 0, goal1: '', goal2: '', goal3: '' },
    { name: 'Zach Oxley', team: 'IT', progress: 0, goal1: '', goal2: '', goal3: '' }
];


function parseQueryString(query) {
    return query
        ? Object.fromEntries(query.split('&').map(pair => pair.split('=')))
        : {};
}

// Replace the existing window.addEventListener('load', ...) and the code that follows it with this:
window.addEventListener('load', function () {
    const queryParams = parseQueryString(window.location.search.slice(1));
    const code = queryParams.code;
    const returnedState = queryParams.state;
    const storedState = sessionStorage.getItem('oauth_state');
    const accessToken = sessionStorage.getItem('access_token');

    if (code && returnedState === storedState) {
        exchangeCodeForTokens(code);
    } else if (accessToken) {
        fetchTeamsAndQuarters(accessToken);
    } else {
        initiateLogin();
    }
});

function initiateLogin() {
    const clientId = 'b493f960-3a0e-4a02-89f7-b09b9db97a1c';
    const redirectUri = 'https://dhindsctaccess.github.io/SMART_Dashboard/index.html';
    //const redirectUri = 'http://127.0.0.1:5501/index.html';
    const customerId = '961460947';
    const scope = 'repository.Read';
    const state = generateRandomState(16);

    sessionStorage.setItem('oauth_state', state);

    const authUrl = `https://signin.laserfiche.com/oauth/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&customerId=${customerId}&scope=${encodeURIComponent(scope)}`;

    window.location.href = authUrl;
}

// Function to generate random state for CSRF protection
function generateRandomState(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        state += characters[randomIndex];
    }
    return state;
}

// Check if code and state are returned in URL after redirect
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const returnedState = urlParams.get('state');
const storedState = sessionStorage.getItem('oauth_state');

// Handle authentication response
if (code && returnedState === storedState) {
    exchangeCodeForTokens(code);
} else if (returnedState !== storedState) {
    console.error('State does not match. Possible CSRF attack.');
} else {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
        fetchTeamsAndQuarters(accessToken);
    } else {
        // Only initiate login if we don't have an access token
        initiateLogin();
    }
}

// Function to exchange code for access and refresh tokens
function exchangeCodeForTokens(code) {
    const clientId = 'b493f960-3a0e-4a02-89f7-b09b9db97a1c';
    const clientSecret = 'CMoi3M0DVjzOCsXkZGmRg1A2QAyhNpo8IhKU3mafqFVFcUxp';
    const redirectUri = 'https://dhindsctaccess.github.io/SMART_Dashboard/index.html';
    //const redirectUri = 'http://127.0.0.1:5501/index.html';

    const tokenUrl = 'https://signin.laserfiche.com/oauth/token';
    const auth = btoa(`${clientId}:${clientSecret}`);

    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('code', code);
    data.append('redirect_uri', redirectUri);

    fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to retrieve tokens');
            }
            return response.json();
        })
        .then(tokenData => {
            const accessToken = tokenData.access_token;
            const refreshToken = tokenData.refresh_token;
            sessionStorage.setItem('access_token', accessToken);
            sessionStorage.setItem('refresh_token', refreshToken);
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchTeamsAndQuarters(accessToken);
        })
        .catch(error => console.error('Error fetching access token:', error));
}

// Function to fetch teams and quarters from the API
async function fetchTeamsAndQuarters(accessToken) {
    const repositoryId = 'r-618b7d56';  // Replace with your repository ID
    const searchUrl = `https://api.laserfiche.com/repository/v2/Repositories/${repositoryId}/SimpleSearches?fields=Team&fields=Quarter&formatFieldValues=false`;

    const searchData = {
        searchCommand: '{[SMART Goals]:[Quarter]="*"} & {[SMART Goals]:[Team]="*"}'
    };

    try {
        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(searchData)
        });

        if (response.ok) {
            const searchResults = await response.json();
            populateDropdowns(searchResults);
            if (window.location.pathname.includes('second-page.html')) {
                fetchEmployeeGoals(accessToken);
            } else {
                performSearch(accessToken);
            }
        } else {
            console.error('Error fetching teams and quarters:', response.status, response.statusText);
            alert('Failed to fetch teams and quarters.');
        }
    } catch (error) {
        console.error('Error fetching teams and quarters:', error.message);
        alert('Failed to fetch teams and quarters.');
    }

    updateTeamSelectOptions();
}

// Function to populate team and quarter dropdowns
function populateDropdowns(searchResults) {
    const quarterSelect = document.getElementById('quarter-select');
    const quarters = new Set();

    searchResults.value.forEach(result => {
        const quarter = result.fields.find(field => field.name === 'Quarter').values[0];
        quarters.add(quarter);
    });

    // Clear existing options
    quarterSelect.innerHTML = '';

    // Add quarters in descending order
    [...quarters].sort((a, b) => new Date(b) - new Date(a)).forEach(quarter => {
        const option = document.createElement('option');
        option.value = quarter;
        option.textContent = quarter;
        quarterSelect.appendChild(option);
    });

    // Select the most recent quarter as default
    if (quarterSelect.options.length > 0) {
        quarterSelect.selectedIndex = 0;
    }
}

// Function to select the most recent quarter as default
function selectMostRecentQuarter(quarters) {
    const quarterSelect = document.getElementById('quarter-select');

    // Convert quarters to array and sort descending
    const sortedQuarters = [...quarters].sort((a, b) => new Date(b) - new Date(a));

    if (sortedQuarters.length > 0) {
        quarterSelect.value = sortedQuarters[0];
    }
}

// Function to perform search with access token
async function performSearch(accessToken) {
    const repositoryId = 'r-618b7d56';  // Replace with your repository ID
    const team = document.getElementById('team-select').value;
    const quarter = document.getElementById('quarter-select').value;

    let searchCommand = '';
    if (team === 'all' && quarter === 'all') {
        searchCommand = '{[SMART Goals]:[Quarter]="*"}';
    } else if (team === 'all') {
        searchCommand = `{[SMART Goals]:[Quarter]="${quarter}"}`;
    } else if (quarter === 'all') {
        searchCommand = `{[SMART Goals]:[Team]="${team} Team"}`;
    } else {
        searchCommand = `{[SMART Goals]:[Quarter]="${quarter}"} & {[SMART Goals]:[Team]="${team} Team"}`;
    }

    const searchUrl = `https://api.laserfiche.com/repository/v2/Repositories/${repositoryId}/SimpleSearches?fields=Name&fields=Team&fields=Quarter&fields=Progress&fields=id&fields=pid&formatFieldValues=false`;

    const searchData = {
        searchCommand: searchCommand
    };

    try {
        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(searchData)
        });

        if (response.ok) {
            const searchResults = await response.json();
            console.log('Search results:', searchResults); // Add logging
            displaySearchResults(searchResults, team, quarter);
        } else if (response.status === 401) {
            // Token expired, refresh it
            refreshToken();
        } else {
            console.error('Error performing search:', response.status, response.statusText);
            alert('Failed to perform search.');
        }
    } catch (error) {
        console.error('Error performing search:', error.message);
        alert('Failed to perform search.');
    }
}

// Function to display search results
function displaySearchResults(searchResults, selectedTeam, selectedQuarter) {
    const resultsContainer = document.getElementById('progress-container');
    resultsContainer.innerHTML = '';

    const userRole = sessionStorage.getItem('userRole');

    // Create a map of search results for quicker access
    const searchResultsMap = new Map();
    searchResults.value.forEach(result => {
        const name = result.fields.find(field => field.name === 'Name').values[0];
        const team = result.fields.find(field => field.name === 'Team').values[0];
        const quarter = result.fields.find(field => field.name === 'Quarter').values[0];
        const progress = result.fields.find(field => field.name === 'Progress').values[0];
        const id = result.fields.find(field => field.name === 'id').values[0];
        const pid = result.fields.find(field => field.name === 'pid').values[0];
        searchResultsMap.set(name + '-' + quarter, { team, progress, id, pid });
    });

    employees.forEach(employee => {
        const { name, team } = employee;
        const key = name + '-' + selectedQuarter;
        const result = searchResultsMap.get(key);

        if ((userRole === 'All' || team === userRole) && (selectedTeam === 'all' || team === selectedTeam)) {
            const progressValue = result ? parseFloat(result.progress) : 0;

            let buttonHtml = '';
            if (result) {
                const goalsBtnHtml = result.id ? `
                    <button class="view-goals-btn" onclick="window.open('https://app.laserfiche.com/laserfiche/DocView.aspx?repo=r-618b7d56&customerId=961460947&id=${result.id}', '_blank')">
                        View Goals in Laserfiche
                    </button>
                ` : '';

                const reviewBtnHtml = result.pid ? `
                    <button class="view-review-btn" onclick="window.open('https://app.laserfiche.com/laserfiche/DocView.aspx?repo=r-618b7d56&customerId=961460947&id=${result.pid}', '_blank')">
                        View Performance Review in Laserfiche
                    </button>
                ` : `
                    <button class="view-review-btn disabled" disabled>
                        View Performance Review in Laserfiche
                    </button>
                `;

                buttonHtml = `
                    <br>
                    <div class="button-container">
                        ${goalsBtnHtml}
                        ${reviewBtnHtml}
                    </div>
                `;
            }

            const progressElement = document.createElement('div');
            progressElement.classList.add('progress-item');

            progressElement.innerHTML = `
                <h4>${name}</h4>
                <div class="step-progress-container">
                    <div class="step" data-step="0">1<span class="step-label">Set Goals</span></div>
                    <div class="step" data-step="25">2<span class="step-label">Leader Review</span></div>
                    <div class="step" data-step="50">3<span class="step-label">Rework Goals</span></div>
                    <div class="step" data-step="75">4<span class="step-label">Leader Additional Review</span></div>
                    <div class="step" data-step="100">5<span class="step-label">Goals Set!</span></div>
                </div>
                ${buttonHtml}
            `;
            resultsContainer.appendChild(progressElement);

            // Update active steps
            updateStepProgress(progressElement, progressValue);
        }
    });
}

async function fetchEmployeeGoals(accessToken) {
    const repositoryId = 'r-618b7d56';  // Replace with your repository ID
    const team = document.getElementById('team-select').value;
    const quarter = document.getElementById('quarter-select').value;
    const userRole = sessionStorage.getItem('userRole');

    let searchCommand = '';
    if (userRole === 'All') {
        if (team === 'all' && quarter === 'all') {
            searchCommand = '{[SMART Goals]:[Quarter]="*"}';
        } else if (team === 'all') {
            searchCommand = `{[SMART Goals]:[Quarter]="${quarter}"}`;
        } else if (quarter === 'all') {
            searchCommand = `{[SMART Goals]:[Team]="${team} Team"}`;
        } else {
            searchCommand = `{[SMART Goals]:[Quarter]="${quarter}"} & {[SMART Goals]:[Team]="${team} Team"}`;
        }
    } else {
        if (quarter === 'all') {
            searchCommand = `{[SMART Goals]:[Team]="${userRole} Team"}`;
        } else {
            searchCommand = `{[SMART Goals]:[Quarter]="${quarter}"} & {[SMART Goals]:[Team]="${userRole} Team"}`;
        }
    }

    const searchUrl = `https://api.laserfiche.com/repository/v2/Repositories/${repositoryId}/SimpleSearches?fields=Name&fields=Team&fields=Quarter&fields=Goal1&fields=Goal2&fields=Goal3&formatFieldValues=false`;

    const searchData = {
        searchCommand: searchCommand
    };

    try {
        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(searchData)
        });

        if (response.ok) {
            const searchResults = await response.json();
            displayEmployeeGoals(searchResults, team, quarter, userRole);
        } else if (response.status === 401) {
            refreshToken();
        } else {
            console.error('Error fetching employee goals:', response.status, response.statusText);
            alert('Failed to fetch employee goals.');
        }
    } catch (error) {
        console.error('Error fetching employee goals:', error.message);
        alert('Failed to fetch employee goals.');
    }
}

function displayEmployeeGoals(searchResults, selectedTeam, selectedQuarter, userRole) {
    const goalsContainer = document.getElementById('goals-container');
    goalsContainer.innerHTML = '';

    const searchResultsMap = new Map();
    searchResults.value.forEach(result => {
        const name = result.fields.find(field => field.name === 'Name').values[0];
        const team = result.fields.find(field => field.name === 'Team').values[0];
        const quarter = result.fields.find(field => field.name === 'Quarter').values[0];
        const goal1 = result.fields.find(field => field.name === 'Goal1').values[0];
        const goal2 = result.fields.find(field => field.name === 'Goal2').values[0];
        const goal3 = result.fields.find(field => field.name === 'Goal3').values[0];
        searchResultsMap.set(name + '-' + quarter, { team, goal1, goal2, goal3 });
    });

    employees.forEach(employee => {
        const { name, team } = employee;
        const key = name + '-' + selectedQuarter;
        const result = searchResultsMap.get(key);

        if ((userRole === 'All' && (selectedTeam === 'all' || team === selectedTeam)) ||
            (userRole !== 'All' && team === userRole)) {
            const goalElement = document.createElement('div');
            goalElement.classList.add('goal-item');
            goalElement.innerHTML = `
                <h4>${name}</h4>
                <ul>
                    <li>${result ? result.goal1 : 'No goal set'}</li>
                    <li>${result ? result.goal2 : 'No goal set'}</li>
                    <li>${result ? result.goal3 : 'No goal set'}</li>
                </ul>
            `;
            goalsContainer.appendChild(goalElement);
        }
    });
}

function updateTeamSelectOptions() {
    const teamSelect = document.getElementById('team-select');
    const userRole = sessionStorage.getItem('userRole');

    teamSelect.innerHTML = '<option value="all">All Teams</option>';

    if (userRole === 'All') {
        teamSelect.innerHTML += `
            <option value="IT">IT Team</option>
            <option value="BPA">BPA Team</option>
            <option value="Admin">Admin Team</option>
        `;
    } else {
        teamSelect.innerHTML += `<option value="${userRole}">${userRole} Team</option>`;
    }
}

function updateStepProgress(progressElement, value) {
    const steps = progressElement.querySelectorAll('.step');
    const container = progressElement.querySelector('.step-progress-container');
    steps.forEach(step => {
        const stepValue = parseInt(step.getAttribute('data-step'));
        if (value >= stepValue) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    container.style.setProperty('--progress-width', `${value}%`);
}

// Function to refresh access token
function refreshToken() {
    const clientId = 'b493f960-3a0e-4a02-89f7-b09b9db97a1c';
    const clientSecret = 'CMoi3M0DVjzOCsXkZGmRg1A2QAyhNpo8IhKU3mafqFVFcUxp';
    const refreshToken = sessionStorage.getItem('refresh_token');

    const tokenUrl = 'https://signin.laserfiche.com/oauth/token';
    const auth = btoa(`${clientId}:${clientSecret}`);

    const data = new URLSearchParams();
    data.append('grant_type', 'refresh_token');
    data.append('refresh_token', refreshToken);

    fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to refresh access token');
            }
            return response.json();
        })
        .then(tokenData => {
            const accessToken = tokenData.access_token;
            const newRefreshToken = tokenData.refresh_token;
            sessionStorage.setItem('access_token', accessToken);
            sessionStorage.setItem('refresh_token', newRefreshToken);
            performSearch(accessToken);
        })
        .catch(error => console.error('Error refreshing access token:', error));
}

// Event listeners for dropdown changes
document.getElementById('team-select').addEventListener('change', () => {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
        if (window.location.pathname.includes('second-page.html')) {
            fetchEmployeeGoals(accessToken);
        } else {
            performSearch(accessToken);
        }
    }
});

document.getElementById('quarter-select').addEventListener('change', () => {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
        if (window.location.pathname.includes('second-page.html')) {
            fetchEmployeeGoals(accessToken);
        } else {
            performSearch(accessToken);
        }
    }
});