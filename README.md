# Node.js Development - септември 2016

[Lab: Develop and Deploy Node.js Project from Scratch](https://youtu.be/RDnHHDc7sVc)

### Problem 1. Node.js Workshop – TODO List

### Problem 2. Route GET / 
Create a Node.js web server which is capable of returning an "index.html" file containing a welcome message and menu. Add all available routes from below to the menu.

### Problem 3. Route GET /create 
The server should be able to return a simple form for creating a TODO entry. Each TODO entry should have Title, Description and State. State can be "Pending" and "Done". All TODO entries are initially in "Pending" state. The form should have two inputs – one for the title and one for the description.

### Problem 4. Route POST /create 
When the form is submitted, the server should set some unique ID to the TODO entry and save it on some "database". Database can be a simple in memory array of objects. All fields should be validated and should not be empty. You can process the invalid input in whatever way you see fit (a simple error message is more than enough).

### Problem 5. Route GET /all 
When this route is reached the server should return dynamically generated HTML containing list of all TODO entries with their Title, Description and State. Entries should be listed sorted first by their state ("PENDING" entries should be on top) and then by their date of creation in ascending order. Each entry should have a link to "/details/{id}" where "id" is the ID of the TODO entry. Links are written with `<a href="url">My link</a>`

### Problem 6. Route GET /details/{id}
When this route is reached, details about the TODO entry with the provided ID should be showed. The title, the description and the state should be shown. A button named "DONE" should exist on the page. When clicked, the server should change the state of the TODO entry.

### Problem 7. Add interchangeable states
Allow the state of a TODO to be returned back to "PENDING". Change the button text and behavior depending on the state of the TODO.

### Problem 8. Add form for comments on the TODO details
Add form to the TODO details allowing the user to save comments for the current TODO. The form should have one field for the comment. 

### Problem 9. Route POST/details/{id}/comment
The form for comments should save the data on the above route. The comment should be saved for the TODO with the provided ID. Validate the comment. It should not be empty. Save the date of the comment too. Add on the "/details/{id}" page all comments made for the corresponding TODO entry.

### Problem 10. Add option to upload an image for each TODO
Add an input type "file" to the "/create" form allowing for the user to save an image for each TODO. Save the file on a server folder named "images". Change the file name so that there will not be any collisions if the user send two files with the same name. Show the file on the TODO details page. Use `<img src="imageSrc" />` HTML tag.

### Problem 11. Add statistics page only available on provided header
Add GET /stats route which is available only, if "My-Authorization" header with "Admin" value is provided in the request (otherwise return 404). Show the total number of TODOs and total number of comments.

### OTHER REQUIREMENTS

- Use Node.js as web server
- Follow the standard - https://github.com/feross/standard
- You may use whatever frameworks you like (including express.js)



