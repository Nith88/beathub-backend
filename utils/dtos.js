const userToDTO = (user) => {
  return {
    id: user._id,           // Mapping MongoDB's _id to a clean 'id'
    username: user.username,
    email: user.email,
    role: user.role
  };
};

module.exports = { userToDTO };