//Coded in VSCode and run in Windows 10 Command Prompt after using "npm install mongodp"
//and "npm install node.js", ran using "node Assignment5" all in CMD

// Import necessary modules
const readline = require('readline');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB URI with authentication details
const uri = 'mongodb+srv://RobertFlorinRus:J5TTnIspO1dZIcJJ@cluster0.cbt6vxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;

// Connect to MongoDB and initiate command line interface
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        db = client.db('Assignment5');
        showCommands();
        startCLI();
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
}

connectToDatabase();

// Setup command line interface for input and output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Display available commands to the user
function showCommands() {
    console.log("\nAvailable Commands:");
    console.log("  createUser, retrieveUser, updateUser, deleteUser,");
    console.log("  createItem, retrieveItem, updateItem, deleteItem,");
    console.log("  createOrder, retrieveOrder, updateOrder, deleteOrder,");
    console.log("  exit");
    rl.prompt();
}

// Handle user commands and execute corresponding functions
function startCLI() {
    rl.on('line', async (command) => {
        switch (command) {
            case 'createUser':
                const userInfo = await promptUserDetails('Enter user info separated by commas (title, firstName, surname, mobile, email, homeAddressLine1, homeTown, homeCountyCity, homeEircode, shippingAddressLine1, shippingTown, shippingCountyCity, shippingEircode): ');
                createUser(userInfo.split(',').map(item => item.trim()));
                break;
            case 'retrieveUser':
                retrieveUser();
                break;
            case 'updateUser':
                updateUser();
                break;
            case 'deleteUser':
                deleteUser();
                break;
            case 'createItem':
                const itemInfo = await promptUserDetails('Enter item details separated by commas (manufacturer, model, price): ');
                createItem(itemInfo.split(',').map(item => item.trim()));
                break;
            case 'retrieveItem':
                retrieveItem();
                break;
            case 'updateItem':
                updateItem();
                break;
            case 'deleteItem':
                deleteItem();
                break;
            case 'createOrder':
                createOrder();
                break;
            case 'retrieveOrder':
                retrieveOrder();
                break;
            case 'updateOrder':
                updateOrder();
                break;
            case 'deleteOrder':
                deleteOrder();
                break;
            case 'exit':
                console.log('Exiting program.');
                client.close();
                rl.close();
                return;
            default:
                // Handle invalid commands
                console.log('Invalid command.');
                showCommands();
                break;
        }
    });
}

// Prompt for a single line of user input
function promptUserInput(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Prompt for detailed user input
function promptUserDetails(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Function to create a new user
async function createUser(userInfo) {
    const [title, firstName, surname, mobile, email, homeAddressLine1, homeTown, homeCountyCity, homeEircode, shippingAddressLine1, shippingTown, shippingCountyCity, shippingEircode] = userInfo;
    if (!firstName || !surname || !mobile || !email || !homeAddressLine1 || !homeTown || !homeCountyCity || !homeEircode || !shippingAddressLine1 || !shippingTown || !shippingCountyCity || !shippingEircode) {
        console.log('Missing required fields');
        return;
    }
    try {
        const result = await db.collection('users').insertOne({
            Title: title,
            First_Name: firstName,
            Surname: surname,
            Mobile: mobile,
            Email_Address: email,
            Home_Address: {
                Address_Line1: homeAddressLine1,
                Town: homeTown,
                County_City: homeCountyCity,
                Eircode: homeEircode
            },
            Shipping_Address: {
                Address_Line1: shippingAddressLine1,
                Town: shippingTown,
                County_City: shippingCountyCity,
                Eircode: shippingEircode
            }
        });
        console.log('User created with ID:', result.insertedId);
    } catch (err) {
        console.error('Error creating user:', err);
    }
    showCommands();
}

// Function to retrieve a random user from the database
async function retrieveUser() {
    try {
        const users = await db.collection('users').aggregate([{ $sample: { size: 1 } }]).toArray();
        console.log('Retrieved User:', users[0]);
    } catch (err) {
        console.error('Error retrieving user:', err);
    }
    showCommands();
}

// Function to update a randomly selected user with predetermined data
async function updateUser() {
    try {
        const user = await db.collection('users').aggregate([{ $sample: { size: 1 } }]).toArray();
        if (!user.length) {
            console.log('No users found for updating.');
            showCommands();
            return;
        }
        const userId = user[0]._id;
        const updates = {
            Mobile: '1234567890',
            Email_Address: 'updated@example.com',
            Title: 'Dr',
            Home_Address: {
                Address_Line1: "123 Home St",
                Town: "HomeTown",
                County_City: "HomeCounty",
                Eircode: "H12345"
            },
            Shipping_Address: {
                Address_Line1: "456 Shipping Ave",
                Town: "ShipTown",
                County_City: "ShipCounty",
                Eircode: "S12345"
            }
        };
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updates }
        );
        if (result.modifiedCount > 0) {
            console.log('Random user updated successfully using predetermined data');
        } else {
            console.log('No updates made.');
        }
    } catch (err) {
        console.error('Error updating user:', err);
    }
    showCommands();
}

// Function to delete a user based on provided email, phone, and name
async function deleteUser() {
    try {
        const email = await promptUserInput('Enter the email of the user to delete: ');
        const phone = await promptUserInput('Enter the phone number of the user to delete: ');
        const name = await promptUserInput('Enter the name (first or last) of the user to delete: ');

        const user = await db.collection('users').findOne({
            Email_Address: email.trim(),
            Mobile: phone.trim(),
            $or: [{ First_Name: name.trim() }, { Surname: name.trim() }]
        });

        if (!user) {
            console.log('No user found with the provided details.');
            showCommands();
            return;
        }

        const userDeleteResult = await db.collection('users').deleteOne({ _id: user._id });
        if (userDeleteResult.deletedCount > 0) {
            console.log(`Deleted user: ${name}.`);

            const orderDeleteResult = await db.collection('orders').deleteMany({ Customer_Id: user._id });
            if (orderDeleteResult.deletedCount > 0) {
                console.log(`Also deleted ${orderDeleteResult.deletedCount} order(s) placed by the user.`);
            } else {
                console.log('No orders found for this user.');
            }
        } else {
            console.log('Failed to delete the user. Please check the provided details and try again.');
        }
    } catch (err) {
        console.error('Error deleting users and their orders:', err);
    }
    showCommands();
}


// Function to create a new item in the database
async function createItem(itemInfo) {
    const [manufacturer, model, price] = itemInfo;
    if (!manufacturer || !model || !price) {
        console.log('Missing required fields');
        return;
    }
    try {
        const result = await db.collection('items').insertOne({
            Manufacturer: manufacturer,
            Model: model,
            Price: parseFloat(price)
        });
        console.log('Item created with ID:', result.insertedId);
    } catch (err) {
        console.error('Error creating item:', err);
    }
    showCommands();
}

// Function to retrieve a random item from the database
async function retrieveItem() {
    try {
        const items = await db.collection('items').aggregate([{ $sample: { size: 1 } }]).toArray();
        console.log('Retrieved Item:', items[0]);
    } catch (err) {
        console.error('Error retrieving item:', err);
    }
    showCommands();
}

// Function to update a randomly selected item with predetermined data
async function updateItem() {
    try {
        const item = await db.collection('items').aggregate([{ $sample: { size: 1 } }]).toArray();
        if (!item.length) {
            console.log('No items found for updating.');
            showCommands();
            return;
        }
        const itemId = item[0]._id;
        const updates = {
            Manufacturer: 'Updated Manufacturer',
            Model: 'Updated Model',
            Price: 999.99
        };
        const result = await db.collection('items').updateOne(
            { _id: new ObjectId(itemId) },
            { $set: updates }
        );
        if (result.modifiedCount > 0) {
            console.log('Item updated successfully.');
        } else {
            console.log('No updates made. Please ensure the item ID is correct.');
        }
    } catch (err) {
        console.error('Error updating item:', err);
    }
    showCommands();
}

// Function to delete an item based on model name
async function deleteItem() {
    try {
        const model = await promptUserInput('Enter the model of the item to delete: ');
        const result = await db.collection('items').deleteMany({ Model: model.trim() });
        if (result.deletedCount > 0) {
            console.log(`Deleted ${result.deletedCount} item(s) with the model: '${model.trim()}'.`);
        } else {
            console.log('No items deleted. Please check the model name and try again.');
        }
    } catch (err) {
        console.error('Error deleting items:', err);
    }
    showCommands();
}

// Function to create a new order by linking customer and item IDs
async function createOrder() {
    try {
        const customerName = await promptUserInput('Enter the customer\'s name for the order: ');
        const customer = await db.collection('users').findOne({ $or: [{ First_Name: customerName }, { Surname: customerName }] });
        if (!customer) {
            console.log('Customer not found.');
            showCommands();
            return;
        }
        const itemModelString = await promptUserInput('Enter the model(s) of the item(s) for the order (separate by commas if multiple): ');
        const itemModels = itemModelString.split(',').map(model => model.trim());
        const items = await db.collection('items').find({ Model: { $in: itemModels } }).toArray();
        if (!items.length) {
            console.log('No items found matching the models provided.');
            showCommands();
            return;
        }
        const itemIds = items.map(item => item._id);
        const order = {
            Customer_Id: customer._id,
            Items: itemIds
        };
        const result = await db.collection('orders').insertOne(order);
        console.log('Order created with ID:', result.insertedId);
    } catch (err) {
        console.error('Error creating order:', err);
    }
    showCommands();
}

// Function to retrieve a random order from the database and show detailed information
async function retrieveOrder() {
    try {
        const orders = await db.collection('orders').aggregate([
            { $sample: { size: 1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "Customer_Id",
                    foreignField: "_id",
                    as: "customer_details"
                }
            },
            {
                $lookup: {
                    from: "items",
                    localField: "Items",
                    foreignField: "_id",
                    as: "item_details"
                }
            },
            {
                $project: {
                    _id: 0,
                    "Customer Name": { $arrayElemAt: ["$customer_details.First_Name", 0] },
                    "Item Models": "$item_details.Model"
                }
            }
        ]).toArray();
        if (!orders.length) {
            console.log('No orders found.');
        } else {
            console.log('Retrieved Order:', JSON.stringify(orders[0], null, 2));
        }
    } catch (err) {
        console.error('Error retrieving order:', err);
    }
    showCommands();
}

// Function to update a randomly selected order and update it with a predetermined item
async function updateOrder() {
    try {
        const order = await db.collection('orders').aggregate([{ $sample: { size: 1 } }]).toArray();
        if (!order.length) {
            console.log('No orders found for updating.');
            showCommands();
            return;
        }
        const orderId = order[0]._id;
        const newItemId = new ObjectId("6626e33ef8153bce967f9e00");  // ObjectID of predetermined Item
        const updates = {
            Items: [newItemId]  // Updates the order to include only the new predetermined item
        };
        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId) },
            { $set: updates }
        );
        if (result.modifiedCount > 0) {
            console.log('Order updated successfully with a new item.');
        } else {
            console.log('No updates made. Please ensure the order ID is correct.');
        }
    } catch (err) {
        console.error('Error updating order:', err);
    }
    showCommands();
}

// Function to prompt the user for the order ID and delete the specified order
async function deleteOrder() {
    try {
        const orderId = await promptUserInput('Enter the ObjectId of the order to delete: ');
        if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid ObjectId format. Please enter a 24-character hexadecimal string.');
            showCommands();
            return;
        }
        const result = await db.collection('orders').deleteMany({ _id: new ObjectId(orderId) });
        if (result.deletedCount > 0) {
            console.log(`Deleted ${result.deletedCount} order(s).`);
        } else {
            console.log('No orders found with the provided ObjectId.');
        }
    } catch (err) {
        console.error('Error deleting orders:', err);
    }
    showCommands();
}
