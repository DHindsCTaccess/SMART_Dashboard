const passcodes = {
    'admin123': 'Admin',
    'bpa123': 'BPA',
    'it123': 'IT',
    'all123': 'All',
    'all456': 'All'
};

const baseUrl = 'https://dhindsctaccess.github.io/SMART_Dashboard';

document.getElementById('submit-passcode').addEventListener('click', function () {
    const passcode = document.getElementById('passcode').value;
    if (passcodes.hasOwnProperty(passcode)) {
        sessionStorage.setItem('userRole', passcodes[passcode]);
        window.location.href = `${baseUrl}/index.html`;
    } else {
        alert('Invalid passcode');
    }
});