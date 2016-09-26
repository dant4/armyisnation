var User = function(username, password, email) 
{
	this.username = username;
	this.password = password;
	this.email = email;
}

User.prototype.hey = function (text) {
  return "Whatever";
}

User.prototype.toJSON = function() {
    return {username: this.username, password: this.password, email: this.email}; // everything that needs to get stored
};

User.prototype.fromJSON = function(obj) {
    if (typeof obj == "string") obj = JSON.parse(obj);
    var instance = new User(obj.username, obj.password, obj.email);
    return instance;
};

module.exports = User;
