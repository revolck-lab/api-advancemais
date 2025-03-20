const messageErrorSuperAdmin = () => ({
  smtp_host: {
    empty: 'SMTP host cannot be empty.',
    required: 'SMTP host is required.',
  },
  smtp_port: {
    invalid: 'SMTP port must be a number.',
    min: 'SMTP port must be greater than or equal to 1.',
    max: 'SMTP port must be less than or equal to 65535.',
    required: 'SMTP port is required.',
  },
  smtp_username: {
    empty: 'SMTP username cannot be empty.',
    required: 'SMTP username is required.',
  },
  smtp_password: {
    empty: 'SMTP password cannot be empty.',
    required: 'SMTP password is required.',
  },
});

module.exports = messageErrorSuperAdmin;