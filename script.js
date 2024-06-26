const employees = [
    { name: 'Andrea Jesse', team: 'Admin', progress: 0 },
    { name: 'Adam Minor', team: 'IT', progress: 25 },
    { name: 'Andrea Scheid', team: 'Admin', progress: 50 },
    { name: 'Brian Dean', team: 'BPA', progress: 75 },
    { name: 'Chad Bulkowski', team: 'IT', progress: 100 },
    { name: 'Chris Sanders', team: 'IT', progress: 0 },
    { name: 'Dan Hinds', team: 'BPA', progress: 25 },
    { name: 'Dawn Whitney', team: 'Admin', progress: 50 },
    { name: 'Gabriel Scheid', team: 'BPA', progress: 75 },
    { name: 'Jillian Wojtczak', team: 'Admin', progress: 100 },
    { name: 'Luke Roubik', team: 'IT', progress: 0 },
    { name: 'Mitchell Milligan', team: 'IT', progress: 25 },
    { name: 'Mike Ritt', team: 'BPA', progress: 50 },
    { name: 'Natanyahu Dunn', team: 'IT', progress: 75 },
    { name: 'Nate Osmanski', team: 'IT', progress: 100 },
    { name: 'Tom Paul', team: 'Admin', progress: 0 },
    { name: 'Tom Wielenbeck', team: 'BPA', progress: 25 },
    { name: 'Zach Oxley', team: 'IT', progress: 50 }
];

const progressContainer = document.getElementById('progress-container');
const teamSelect = document.getElementById('team-select');

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

// Initial call to create progress bars for all teams
createProgressBars(employees);
