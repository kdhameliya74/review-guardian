import authService from '../services/auth.service.js';

export const handleCallback = async (req, res, next) => {
  try {
    const { code, installation_id, setup_action } = req.query;

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code is missing. Please try installing the app again.',
      });
    }

    // 1. Exchange code for user token
    const auth = await authService.exchangeCodeForToken(code);

    // 2. Get user info to verify who installed it
    const user = await authService.getUserProfile(auth.token);

    // 3. Response to the user
    // In a real app, we would save the installation_id and user mapping here.
    return res.status(200).json({
      status: 'success',
      message: 'Review Guardian successfully authorized!',
      data: {
        user: {
          login: user.login,
          id: user.id,
        },
        installation_id: installation_id || 'already_installed',
        setup_action: setup_action || 'none'
      },
      next_steps: 'You can now close this window and start using the bot on your authorized repositories.'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message,
    });
  }
};
