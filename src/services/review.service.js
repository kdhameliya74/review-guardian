import githubService from './github.service.js';
import aiService from './ai.service.js';

/**
 * Orchestrator service for the code review process
 */
export class ReviewService {
  /**
   * Main entry point to handle a PR review request
   */
  async processPullRequest(owner, repo, pullNumber) {
    try {
      // 1. Fetch the diff
      const diff = await githubService.getPullRequestDiff(owner, repo, pullNumber);

      // 2. Analyze the diff with AI
      const aiResponseText = await aiService.analyzeDiff(diff);
      
      let reviewComments = [];
      try {
        reviewComments = JSON.parse(aiResponseText);
      } catch (e) {
        console.warn('AI response was not valid JSON, posting as single comment instead.');
        return await githubService.postComment(owner, repo, pullNumber, aiResponseText);
      }

      // 3. Post the review back to GitHub
      await githubService.postReview(owner, repo, pullNumber, reviewComments);

      return { success: true };
    } catch (error) {
      console.error('Error in ReviewService:', error);
      throw error;
    }
  }
}

export default new ReviewService();
