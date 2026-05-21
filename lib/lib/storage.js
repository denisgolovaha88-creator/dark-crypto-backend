const fs = require("fs");
const path = require("path");

const usersFile = path.join(process.cwd(), "data", "users.json");

function getUsers() {
  try {
    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  fs.writeFileSync(
    usersFile,
    JSON.stringify(users, null, 2)
  );
}

function getUser(chatId) {
  const users = getUsers();

  if (!users[chatId]) {
    users[chatId] = {};
    saveUsers(users);
  }

  return users[chatId];
}

function updateUser(chatId, data) {
  const users = getUsers();

  users[chatId] = {
    ...users[chatId],
    ...data
  };

  saveUsers(users);
}

module.exports = {
  getUsers,
  saveUsers,
  getUser,
  updateUser
};
