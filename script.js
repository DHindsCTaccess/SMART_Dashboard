// const employees = [
//     { name: 'Andrea Jesse', team: 'Admin', progress: 0 },
//     { name: 'Adam Minor', team: 'IT', progress: 25 },
//     { name: 'Andrea Scheid', team: 'Admin', progress: 50 },
//     { name: 'Brian Dean', team: 'BPA', progress: 75 },
//     { name: 'Chad Bulkowski', team: 'IT', progress: 100 },
//     { name: 'Chris Sanders', team: 'IT', progress: 0 },
//     { name: 'Dan Hinds', team: 'BPA', progress: 25 },
//     { name: 'Dawn Whitney', team: 'Admin', progress: 50 },
//     { name: 'Gabriel Scheid', team: 'BPA', progress: 75 },
//     { name: 'Jillian Wojtczak', team: 'Admin', progress: 100 },
//     { name: 'Luke Roubik', team: 'IT', progress: 0 },
//     { name: 'Mitchell Milligan', team: 'IT', progress: 25 },
//     { name: 'Mike Ritt', team: 'BPA', progress: 50 },
//     { name: 'Natanyahu Dunn', team: 'IT', progress: 75 },
//     { name: 'Nate Osmanski', team: 'IT', progress: 100 },
//     { name: 'Tom Paul', team: 'Admin', progress: 0 },
//     { name: 'Tom Wielenbeck', team: 'BPA', progress: 25 },
//     { name: 'Zach Oxley', team: 'IT', progress: 50 }
// ];

// const progressContainer = document.getElementById('progress-container');
// const teamSelect = document.getElementById('team-select');

// // Function to filter employees based on selected team
// function filterEmployeesByTeam(team) {
//     if (team === 'all') {
//         return employees;
//     } else {
//         return employees.filter(emp => emp.team === team);
//     }
// }

// // Function to create progress bars based on filtered employees
// function createProgressBars(filteredEmployees) {
//     progressContainer.innerHTML = ''; // Clear previous progress bars

//     filteredEmployees.forEach(employee => {
//         const employeeDiv = document.createElement('div');
//         employeeDiv.className = 'progress-item';
//         employeeDiv.innerHTML = `
//             <h4>${employee.name}</h4>
//             <progress value="${employee.progress}" max="100" style="--value: ${employee.progress}; --max: 100;"></progress>
//         `;
//         progressContainer.appendChild(employeeDiv);
//     });
// }

// // Event listener for team select dropdown
// teamSelect.addEventListener('change', function () {
//     const selectedTeam = this.value;
//     const filteredEmployees = filterEmployeesByTeam(selectedTeam);
//     createProgressBars(filteredEmployees);
// });

// // Initial call to create progress bars for all teams
// createProgressBars(employees);

const clientId = 'b493f960-3a0e-4a02-89f7-b09b9db97a1c';
const clientSecret = 'IMWG2oT22FVY6kFXh7jnVVk7Ujez82TsRwe9y3OpjCyxXL8G';
const redirectUri = 'https://hindsd.github.io/SMART_Dashboard'; // Ensure this matches the registered redirect URI
const authUrl = `https://signin.laserfiche.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repository.Read+repository.Write`;
const tokenUrl = 'https://signin.laserfiche.com/oauth/token';
const dataUrl = 'https://api.laserfiche.com/repository/v2/search';

let accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0..4w-ehoGaHi0TIF5niBqerg.wsGmaqagonjR7VpCokE_LxQn3fVrjM5pVK66IcOG5f4Oz1AnZjGRX7VMVzes2okGPG-EJH7HbprwJcmNATFpYou2m0WSlS5uOcsM-XBtwRisEiwXMsvOMhKCTfho1MUAGrb5Rky9DprOmX1RejSzAgcALs-3k8yFy0pCN1yUkfPHA1I6tWXJ7jeVz25PVPkag80E0A2I7Qo87oys43JRUb1EcGhd5wUP9HukL4SKh4OP1JdAIrTsGIlPceLH0n4sKwPZYgFdKZIAYvUuOT71A7Mz_Y6RcXY9-7w8IIuuckFNufX4vjxQ8GAM5mXFhFSS6aCHuPYrdF67_2a6klY2dMWSjy8YSUcF_YST_M7rWuQkg9XR_8xrS8e3kBVYU9iR.wCI60N_wKrP_T99XpFaKuA';

// Function to initiate OAuth authorization flow
function initiateOAuthFlow() {
    window.location.href = authUrl;
}

// Function to exchange authorization code for access token
async function fetchToken(authCode) {
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${encodeURIComponent(redirectUri)}`
        });

        if (!response.ok) {
            throw new Error('Failed to obtain token');
        }

        const data = await response.json();
        accessToken = data.access_token;
    } catch (error) {
        console.error('Error fetching token:', error);
    }
}

// Function to fetch data using the bearer token
async function fetchData() {
    try {
        const response = await fetch(dataUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                query: 'progress'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        return data.value;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

let employees = []; // Initialize an empty employees array

const progressContainer = document.getElementById('progress-container');
const teamSelect = document.getElementById('team-select');

// Function to merge fetched progress data with existing employees list
function mergeProgressData(fetchedData) {
    return fetchedData.map(item => {
        const nameField = item.fields.find(field => field.name === 'Name');
        const teamField = item.fields.find(field => field.name === 'Team');
        const progressField = item.fields.find(field => field.name === 'Progress');

        return {
            name: nameField ? nameField.values[0] : 'Unknown',
            team: teamField ? teamField.values[0] : 'Unknown',
            progress: progressField ? parseInt(progressField.values[0]) : 0
        };
    });
}

// Function to filter employees based on selected team
function filterEmployeesByTeam(team) {
    if (team === 'all') {
        return employees;
    } else {
        return employees.filter(emp => emp.team === team);
    }
}

// Function to create progress bars based on filtered employees
function createProgressBars(filteredEmployees) {
    progressContainer.innerHTML = ''; // Clear previous progress bars

    filteredEmployees.forEach(employee => {
        const employeeDiv = document.createElement('div');
        employeeDiv.className = 'progress-item';
        employeeDiv.innerHTML = `
            <h4>${employee.name}</h4>
            <p>Team: ${employee.team}</p>
            <progress value="${employee.progress}" max="100" style="--value: ${employee.progress}; --max: 100;"></progress>
        `;
        progressContainer.appendChild(employeeDiv);
    });
}

// Event listener for team select dropdown
teamSelect.addEventListener('change', function () {
    const selectedTeam = this.value;
    const filteredEmployees = filterEmployeesByTeam(selectedTeam);
    createProgressBars(filteredEmployees);
});

// Function to handle the entire data fetching and UI update process
async function handleDataFetching() {
    try {
        const fetchedData = await fetchData();
        employees = mergeProgressData(fetchedData);
        createProgressBars(employees);
    } catch (error) {
        console.error('Error handling data fetching:', error);
    }
}

// Initial call to handle OAuth flow and data fetching
(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (!authCode) {
        initiateOAuthFlow();
    } else {
        await fetchToken(authCode);
        await handleDataFetching();
    }
})();
