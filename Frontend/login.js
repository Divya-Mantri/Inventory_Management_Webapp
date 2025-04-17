document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validating the form fields
    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    // Calling backend login API
    fetch('http://127.0.0.1:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {return response.json()})
    .then(data => {
        console.log('API Response:',data);
        if (data.token) {
            // Storing the token in localStorage
            localStorage.setItem('authToken', data.token);
            alert("Login successful!");
            window.location.href = "inventory.html"; 
        } else {
            document.getElementById('error-message').innerText = "Invalid credentials, please try again.";
            document.getElementById('error-message').style.display = "block";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred during login.");
    });
});

