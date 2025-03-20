const { generatePasswordResetToken } = require('../../../services/tokenService');
const { sendEmail } = require('../../../services/emailServices');

const recoveryService = async (login, email) => {
  if(!login) {
    throw new Error('CPF or CNPJ are mandatory to generate the password reset token.');
  }

  const resetToken = generatePasswordResetToken(login);

  const resetLink = `${process.env.FRONTEND_URL}/api/password/reset?token=${resetToken}`;

  const emailResult = await sendEmail({
    to: email,
    subject: 'Recupeção de senha',
    text: `Olá, acesse o link para redifinir a sua senha: ${resetLink}`,
    html: `<p>Olá,</p><p>Acesse o link abaixo para redefinir sua senha:</p><a href="${resetLink}">${resetLink}</a>`,
  });

  return emailResult;
};

module.exports = recoveryService;