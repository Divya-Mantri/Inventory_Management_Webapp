document.addEventListener("DOMContentLoaded", function () {
    //loading modal
    const editModal = new bootstrap.Modal(document.getElementById("editModal"));

    // Function to load inventory data from the backend
    function loadInventoryData() {
        const table = document.getElementById('inventory-item');

        // Get the token from localStorage
        const token = localStorage.getItem('authToken');

        if (!token) {
            alert("You need to log in first.");
            return;
        }

        // Make a GET request to fetch inventory data, passing the token in the Authorization header
        fetch('http://localhost:3000/products', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log("Loaded Inventory Data: ", data);

                // Clear the table before adding data
                table.innerHTML = "";

                // Checking if we have data to display
                if (data.length === 0) {
                    console.log("No inventory data found.");
                    return;
                }

                // Calling the displayProducts function to show the fetched data
                displayProducts(data);
            })
            .catch(error => {
                console.error('Error loading inventory:', error);
                alert("Failed to load inventory.");
            });
    }

    // Function to display fetched products in the table
    function displayProducts(products) {
        const table = document.getElementById('inventory-item');

        products.forEach((item, index) => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${index + 1}</td>
                <td class="item-name"><strong>${item.name}</strong></td>
                <td>${item.description}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
                <td><span class="badge ${item.quantity > 1 ? 'bg-success' : 'bg-danger'}">${item.quantity > 1 ? 'In Stock' : 'Out of Stock'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary edit-btn" data-id="${item.id}">Edit</button>
                    <button class="btn btn-sm btn-danger" data-id="${item.id}">Delete</button>
                </td>
            `;
            table.appendChild(newRow);
        });
    }

    // Load data when the page loads
    loadInventoryData();

    // Add Item Functionality
    document.getElementById('addItemForm').addEventListener('submit', function (e) {
        e.preventDefault();
        if (!this.checkValidity()) {
            this.classList.add('was-validated');
            return;
        }

        const itemName = document.getElementById('itemName').value.trim();
        const category = document.getElementById('category').value;
        const quantity = document.getElementById('quantity').value;
        const price = document.getElementById('price').value;
        const description = document.getElementById('description').value;

        // Create a new item object
        const newItem = {
            name: itemName,
            description: description,
            category: category,
            quantity: parseInt(quantity),
            price: parseFloat(price)
        };

        // Get the token from localStorage
        const token = localStorage.getItem('authToken');

        // Send a POST request to add the new item, passing the token in the Authorization header
        fetch('http://localhost:3000/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newItem)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Product Added:', data);
                loadInventoryData();  // Reload the inventory after adding a new item
            })
            .catch(error => console.error('Error adding item:', error));

        // Reset the form
        this.reset();
        this.classList.remove('was-validated');
    });

    // Delete Item Functionality
    document.getElementById('inventory-item').addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-danger')) {
            const productId = e.target.getAttribute('data-id');

            // Get the token from localStorage
            const token = localStorage.getItem('authToken');

            // Send a DELETE request to delete the item, passing the token in the Authorization header
            fetch(`http://localhost:3000/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to delete item: ${response.status}`);
                    }
                    return response.json(); // Parse the JSON response
                })
                .then(data => {
                    alert(data.message || "Item deleted successfully!");
                    loadInventoryData(); // Reload the inventory after deletion
                })
                .catch(error => {
                    console.error('Error deleting item:', error);
                    alert("Failed to delete item: " + error.message);
                });
        }
    });
    // Edit Item Functionality
    document.getElementById("inventory-item").addEventListener("click", function (e) {
        if (e.target.classList.contains("edit-btn")) {
            const productId = e.target.getAttribute("data-id");

            // Get the token from localStorage
            const token = localStorage.getItem('authToken');

            // Fetch the specific product data
            fetch(`http://localhost:3000/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(item => {
                    // Populate the edit form
                    document.getElementById("editProductId").value = item.id;
                    document.getElementById("editItemName").value = item.name;
                    document.getElementById("editDescription").value = item.description;
                    document.getElementById("editCategory").value = item.category;
                    document.getElementById("editQuantity").value = item.quantity;
                    document.getElementById("editPrice").value = item.price;

                    // Show the modal
                    editModal.show();
                })
                .catch(error => {
                    console.error('Error fetching item:', error);
                    alert("Failed to load item data.");
                });
        }
    });


    document.getElementById("editItemForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const updatedItem = {
            name: document.getElementById("editItemName").value,
            description: document.getElementById("editDescription").value,
            category: document.getElementById("editCategory").value,
            quantity: parseInt(document.getElementById("editQuantity").value),
            price: parseFloat(document.getElementById("editPrice").value)
        };

        const productId = document.getElementById("editProductId").value;
        const token = localStorage.getItem('authToken');

        fetch(`http://localhost:3000/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedItem)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to update item.");
                }
                return response.json();
            })
            .then(data => {
                alert("Item updated successfully!");
                loadInventoryData();
                const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
                editModal.hide();
            })
            .catch(error => {
                console.error('Error updating item:', error);
                alert("Failed to update item.");
            });
    });



});

