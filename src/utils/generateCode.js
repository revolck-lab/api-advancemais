const generateCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let result = "";

  for (let i = 0; i < 9; i++) {
    const indexRandom = Math.floor(Math.random() * characters.length);
    result += characters[indexRandom];
  }

  return result;
};

module.exports = generateCode;
