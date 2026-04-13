import reviewService from '../services/review.service.js';

export const handleWebhook = async (req, res, next) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Filter for Pull Request events
    if (event === 'pull_request') {
      const { action, pull_request, repository, installation } = payload;

      // Only act on opened or synchronized PRs
      if (['opened', 'synchronize'].includes(action)) {
        const owner = repository.owner.login;
        const repo = repository.name;
        const pullNumber = pull_request.number;
        const installationId = installation?.id;

        if (!installationId) {
          console.error(
            'Webhook payload is missing installation.id. Ensure the bot is installed as a GitHub App.',
          );
          return res.status(400).json({ error: 'Missing installation.id' });
        }

        console.log(
          `Processing review for ${owner}/${repo} PR #${pullNumber} (Installation: ${installationId})`,
        );

        // Run processing in background (don't block the webhook response)
        reviewService
          .processPullRequest(installationId, owner, repo, pullNumber)
          .catch((err) => console.error('Error in background process:', err));

        return res.status(202).json({ message: 'Review process started' });
      }
    }

    res.status(200).json({ message: 'Event ignored' });
  } catch (error) {
    next(error);
  }
};
