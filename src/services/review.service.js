import githubService from './github.service.js';
import aiService from './ai.service.js';

export class ReviewService {
  async processPullRequest(installationId, owner, repo, pullNumber) {
    try {
      // step: 1 fetch diff
      const diff = await githubService.getPullRequestDiff(installationId, owner, repo, pullNumber);

      if (!diff) {
        console.warn(`No diff found for ${owner}/${repo} #${pullNumber}. Skipping review.`);
        return { success: true, skipped: true };
      }

      // step: 2 Analyze the diff with AI
      const aiResponseRaw = await aiService.analyzeDiff(diff);

      // step: 3 Clean the response (robust block removal)
      let aiResponseText = aiResponseRaw.trim();
      if (aiResponseText.startsWith('```')) {
        aiResponseText = aiResponseText.replace(/^```(?:json)?\n?/, '');
      }
      if (aiResponseText.endsWith('```')) {
        aiResponseText = aiResponseText.replace(/\n?```$/, '');
      }
      aiResponseText = aiResponseText.trim();

      let reviewData = { summary: '', reviews: [] };
      try {
        const parsed = JSON.parse(aiResponseText);
        if (Array.isArray(parsed)) {
          reviewData.reviews = parsed;
        } else {
          reviewData = {
            summary: parsed.summary || '### 🤖 AI Summary Review\n\nNo overall summary provided.',
            reviews: parsed.reviews || parsed.comments || []
          };
        }
      } catch (e) {
        console.warn('AI response was not valid JSON, posting as single comment.', e.message);
        // step: 4 Post the review back to GitHub
        return await githubService.postComment(installationId, owner, repo, pullNumber, aiResponseRaw);
      }

      // step: 5 Post the review back to GitHub
      await githubService.postReview(installationId, owner, repo, pullNumber, reviewData.reviews, reviewData.summary);

      return { success: true };
    } catch (error) {
      console.error('Error in ReviewService:', error);
      throw error;
    }
  }
}

export default new ReviewService();
